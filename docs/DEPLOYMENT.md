# Deployment

How to take CYBERBLACK-SoC-DASHBOARD v2.0 from `localhost:5173` to a production host with TLS, a reverse proxy, log shipping, and backups.

> Pre-requisites: you have read [`SECURITY.md`](SECURITY.md) and run through [`QUICKSTART.md`](QUICKSTART.md) at least once.

---

## 1. Production build

```bash
# 1. install
npm run install:all

# 2. bootstrap
npm run setup
#   → creates .env with a fresh JWT_SECRET
#   → creates data/soc.db and seeds admin

# 3. set production env (see § 2)
$EDITOR .env

# 4. build the client
npm run build
#   → outputs to client/dist/ (~884 kB unminified, ~260 kB gzipped)

# 5. start the server (serves dist/ statically, falls back to index.html)
NODE_ENV=production npm start
```

---

## 2. Environment variables (production)

```ini
# .env (DO NOT COMMIT)
NODE_ENV=production
PORT=4000
CLIENT_URL=https://soc.example.com

JWT_SECRET=...                          # 64 random bytes, base64url
JWT_TTL=12h

ADMIN_USERNAME=admin
ADMIN_EMAIL=ops@example.com
ADMIN_PASSWORD=...                      # long, random; do NOT use ChangeMe!2026

VT_API_KEY=...                          # optional
SHODAN_API_KEY=...                      # optional

LOG_LEVEL=info
LOG_FILE=/var/log/cyberblack/soc.log
```

Generate a strong admin password:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

---

## 3. Reverse proxy (nginx)

```nginx
upstream cyberblack_app {
    server 127.0.0.1:4000;
    keepalive 16;
}

server {
    listen 443 ssl http2;
    server_name soc.example.com;

    ssl_certificate     /etc/letsencrypt/live/soc.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/soc.example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options    "nosniff" always;
    add_header Referrer-Policy           "no-referrer" always;

    # WebSocket upgrade
    proxy_http_version 1.1;
    proxy_set_header   Upgrade            $http_upgrade;
    proxy_set_header   Connection         "upgrade";
    proxy_set_header   Host               $host;
    proxy_set_header   X-Real-IP          $remote_addr;
    proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto  $scheme;

    # Don't buffer socket bursts
    proxy_buffering    off;
    proxy_read_timeout 3600s;

    # Size limit matches the server's express.json limit
    client_max_body_size 1m;

    # Slightly more aggressive rate limit at the edge
    limit_req_zone $binary_remote_addr zone=edge:10m rate=10r/s;
    limit_req        zone=edge burst=20 nodelay;

    location / {
        proxy_pass http://cyberblack_app;
    }

    # Optional: hide /api/health from the public (still allow your monitor)
    location = /api/health {
        allow 10.0.0.0/8;       # your monitor subnet
        allow 127.0.0.1;
        deny  all;
        proxy_pass http://cyberblack_app;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name soc.example.com;
    return 301 https://$host$request_uri;
}
```

Test & reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Run as a system service (Linux, systemd)

### `/etc/systemd/system/cyberblack.service`
```ini
[Unit]
Description=CYBERBLACK SoC Dashboard
After=network.target

[Service]
Type=simple
User=cyberblack
Group=cyberblack
WorkingDirectory=/opt/cyberblack
EnvironmentFile=/opt/cyberblack/.env
ExecStart=/usr/bin/node /opt/cyberblack/server/index.js
Restart=on-failure
RestartSec=5

# Hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/cyberblack/data /var/log/cyberblack
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

```bash
sudo useradd -r -s /usr/sbin/nologin cyberblack
sudo install -d -o cyberblack -g cyberblack -m 750 /opt/cyberblack
sudo install -d -o cyberblack -g cyberblack -m 750 /var/log/cyberblack
# copy app, .env, run npm ci --omit=dev in /opt/cyberblack
sudo systemctl daemon-reload
sudo systemctl enable --now cyberblack
sudo systemctl status cyberblack
```

---

## 5. Windows (no `cmd.exe` on PATH)

The dev runner already works on PowerShell. For production on Windows, use **NSSM** (the Non-Sucking Service Manager) to wrap `node`:

```powershell
# install NSSM, then:
nssm install CyberBlack "C:\Program Files\nodejs\node.exe" "C:\soc\server\index.js"
nssm set CyberBlack AppDirectory "C:\soc"
nssm set CyberBlack AppEnvironmentExtra "NODE_ENV=production"
nssm set CyberBlack AppStdout "C:\soc\logs\out.log"
nssm set CyberBlack AppStderr "C:\soc\logs\err.log"
nssm set CyberBlack AppRotateFiles 1
nssm set CyberBlack AppRotateBytes 10485760
nssm start CyberBlack
```

Or run under **pm2** for a managed process:

```bash
npm i -g pm2
pm2 start server/index.js --name cyberblack --time
pm2 save
pm2 startup   # follow the printed instructions
```

---

## 6. Database backup

The DB is a single file. Two strategies:

### A. Filesystem snapshot (cheap, consistent with WAL)
```bash
# using sqlite3's online backup API
sqlite3 data/soc.db ".backup '/backups/soc-$(date +%F).db'"

# or via our helper (planned v2.1)
node scripts/backup.mjs
```

### B. LiteFS / Litestream (continuous replication to S3/GCS)
For multi-host or off-host backup, run Litestream as a sidecar:

```bash
# /etc/litestream.yml
dbs:
  - path: /opt/cyberblack/data/soc.db
    replicas:
      - url: s3://my-bucket/cyberblack/soc
        retention: 30d
```

```bash
litestream replicate -config /etc/litestream.yml
```

Add `litestream.service` to systemd, ordered before `cyberblack.service`.

### Restore
```bash
# stop the server
sudo systemctl stop cyberblack
# restore
cp /backups/soc-YYYY-MM-DD.db /opt/cyberblack/data/soc.db
chown cyberblack:cyberblack /opt/cyberblack/data/soc.db
# start
sudo systemctl start cyberblack
```

---

## 7. Log shipping

Winston is configured to write JSON to `LOG_FILE` (if set). Tail it with your favorite shipper.

### CloudWatch (AWS)
```bash
sudo amazon-cloudwatch-agent-ctl -a append-config \
  -m ec2 -s -c file:/opt/cyberblack/cwagent.json
```

```json
{
  "agent": { "metrics_collection_interval": 60, "run_as_user": "cwagent" },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          { "file_path": "/var/log/cyberblack/soc.log", "log_group_name": "cyberblack", "log_stream_name": "{instance_id}" }
        ]
      }
    }
  }
}
```

### Datadog
```bash
DD_API_KEY=... dd-agent-setup
# /etc/datadog-agent/conf.d/cyberblack.yaml
logs:
  - type: file
    path: /var/log/cyberblack/soc.log
    service: cyberblack
    source: nodejs
```

---

## 8. Health check

```
GET /api/health
→ 200 { "ok": true, "ts": 1717689600000 }
```

Wire your load balancer or uptime monitor to this endpoint. Configure the LB to mark the instance unhealthy on:

- 5 consecutive 5xx responses
- `/api/health` returning non-200
- response time > 5 s for 3 consecutive checks

---

## 9. Capacity planning (single host)

| Concurrent analysts | Recommended host | Notes |
|---|---|---|
| 1–5 | 2 vCPU / 4 GB / 20 GB SSD | fine on a small VM |
| 5–20 | 4 vCPU / 8 GB / 50 GB SSD | bump `max_old_space_size=4096` |
| 20–100 | 8 vCPU / 16 GB / 100 GB SSD | consider Postgres + Redis |

For > 100 concurrent, v2.2 ships:

- Socket.IO with the Redis adapter (multi-instance broadcast)
- Postgres backend
- Rate-limit store in Redis
- Separate capture / alert services behind a queue

---

## 10. Upgrade path (v2.0 → v2.1, etc.)

```bash
# 1. read the release notes in CHANGELOG.md
# 2. take a backup
sqlite3 data/soc.db ".backup '/backups/pre-upgrade.db'"
# 3. stop the service
sudo systemctl stop cyberblack
# 4. pull the new code
cd /opt/cyberblack && git pull
# 5. install
npm ci --omit=dev
npm run build
# 6. re-run setup (idempotent; only adds new tables/columns)
npm run setup
# 7. start
sudo systemctl start cyberblack
# 8. verify
curl https://soc.example.com/api/health
```

If something goes wrong:

```bash
# roll back
sudo systemctl stop cyberblack
git checkout v2.0.0
npm ci --omit=dev
npm run build
cp /backups/pre-upgrade.db data/soc.db
sudo systemctl start cyberblack
```

---

## 11. Compliance checklist (re-stated)

See [`SECURITY.md` § 6](SECURITY.md#6-hardening-checklist-production) for the full list. The top 5 for go-live:

1. `ADMIN_PASSWORD` changed from `ChangeMe!2026`
2. TLS + HSTS at the reverse proxy
3. `CLIENT_URL` matches the public origin exactly
4. `data/soc.db` is `chmod 600` and owned by the service user
5. Backup of `data/soc.db` is shipping off-host
