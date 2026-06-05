# API reference

> **Base URL:** `http://localhost:4000` (development) — set `PORT` and reverse-proxy in production.
> **Auth:** All `/api/*` routes except `/api/auth/*` and `/api/health` require a Bearer JWT.
> **TOTP:** All `/api/<resource>/*` routes require the session to be TOTP-verified. Return `403 TOTP_NOT_ENROLLED` otherwise.

---

## Conventions

### Request format
```http
POST /api/auth/login HTTP/1.1
Host: localhost:4000
Content-Type: application/json
Authorization: Bearer <jwt>            ← only on protected routes

{ "username": "admin", "password": "ChangeMe!2026" }
```

### Response format
Success:
```json
{ "ok": true, "data": { ... } }
```

Error:
```json
{ "ok": false, "error": { "code": "INVALID_CREDENTIALS", "message": "..." } }
```

### Error codes

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed body, missing field |
| 401 | `UNAUTHORIZED` | Missing / invalid / expired JWT |
| 401 | `INVALID_CREDENTIALS` | Wrong username or password |
| 403 | `TOTP_NOT_ENROLLED` | User has 2FA enabled, session not verified |
| 403 | `TOTP_INVALID` | Wrong 6-digit code |
| 403 | `FORBIDDEN` | Authenticated but role insufficient |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate username / email |
| 429 | `RATE_LIMITED` | Too many requests — see `Retry-After` |
| 500 | `INTERNAL` | Unhandled server error |
| 503 | `NMAP_UNAVAILABLE` | nmap binary not on PATH |

---

## 1. Auth — `/api/auth`

### `POST /api/auth/login`
Issue a JWT for valid credentials. Does **not** assert TOTP — that's a separate verification step.

**Request**
```json
{ "username": "admin", "password": "ChangeMe!2026" }
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requiresTotp": true,
  "user": { "id": 1, "username": "admin", "email": "admin@local.soc", "role": "admin" }
}
```

**cURL**
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"ChangeMe!2026"}'
```

---

### `POST /api/auth/setup-2fa`
Returns either an existing-secret verify challenge, or a fresh enrollment secret + QR.

**Request** (JWT required, but TOTP not required)
```json
{ }
```

**Response 200 — already enrolled**
```json
{ "alreadyEnabled": true }
```

**Response 200 — fresh enrollment**
```json
{
  "alreadyEnabled": false,
  "secret": "FNPCUJL6EEAC2QCG",
  "otpauth": "otpauth://totp/SOC%2F%2FOPS%20v2:admin?secret=...",
  "qrDataUrl": "data:image/png;base64,iVBORw0KGgo..."
}
```

**cURL**
```bash
curl -s -X POST http://localhost:4000/api/auth/setup-2fa \
  -H "Authorization: Bearer $JWT"
```

---

### `POST /api/auth/verify-2fa`
Verify a 6-digit TOTP code for an **already-enrolled** user.

**Request**
```json
{ "token": "531930" }
```

**Response 200**
```json
{ "ok": true, "totpVerified": true }
```

**cURL**
```bash
curl -s -X POST http://localhost:4000/api/auth/verify-2fa \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{"token":"531930"}'
```

---

### `POST /api/auth/confirm-2fa`
Confirm a 6-digit TOTP code during a **fresh enrollment** (flips `totp_enabled` to `1`).

Same request/response as `verify-2fa`.

---

### `POST /api/auth/change-password`
Change the current user's password.

**Request**
```json
{ "currentPassword": "ChangeMe!2026", "newPassword": "N3w!Str0ng#Pass" }
```

**Response 200**
```json
{ "ok": true }
```

---

### `POST /api/auth/logout`
Invalidate the current session. Server deletes the row from `sessions`; client must discard the JWT.

**Response 200**
```json
{ "ok": true }
```

---

### `GET /api/auth/me`
Return the authenticated user record.

**Response 200**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@local.soc",
  "role": "admin",
  "totpEnabled": true
}
```

---

## 2. Alerts — `/api/alerts`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | List alerts (paginated) |
| `GET` | `/:id` | Single alert |
| `POST` | `/:id/assign` | Assign to user |
| `POST` | `/:id/status` | Update status |
| `POST` | `/:id/note` | Append an analyst note |
| `DELETE` | `/:id` | Dismiss alert (soft) |

### `GET /api/alerts?severity=critical&status=open&limit=50`

**Response 200**
```json
{
  "items": [
    {
      "id": 17,
      "severity": "critical",
      "source": "packet-engine",
      "title": "RDP burst from 10.0.0.7",
      "summary": "7 packets targeting TCP/3389 in 1s",
      "indicator": "10.0.0.7",
      "status": "open",
      "assignee_id": null,
      "created_at": 1717689600000,
      "updated_at": 1717689600000
    }
  ],
  "total": 200
}
```

### `POST /api/alerts/17/status`

```json
{ "status": "investigating" }
```

Status transitions allowed: `open → investigating → resolved | dismissed`.

---

## 3. Network — `/api/network`

### `GET /api/network/top-talkers?window=300`
Top N source/destination IPs by packet count over the last `window` seconds.

### `GET /api/network/flows?window=60`
Aggregated (src, dst) flow tuples with byte counts.

### `GET /api/network/capture-status`
```json
{ "source": "mock", "running": true, "pps": 47 }
```

`source` is `"mock"` or `"pcap"`. `pps` is the running packets-per-second estimate.

---

## 4. OSINT — `/api/osint`

### `POST /api/osint/whois`
```json
{ "indicator": "8.8.8.8" }
```
**Response**: parsed Whois record (registrar, dates, name servers).

### `POST /api/osint/dns`
```json
{ "indicator": "google.com", "type": "A" }
```
**Response**: `A`/`AAAA`/`MX`/`NS`/`TXT` records (caller-specified type).

### `POST /api/osint/shodan`
**Requires `SHODAN_API_KEY`**. Returns host banners, ports, vulns.

All three endpoints cache results in `osint_cache` (TTL configurable; default 24h).

---

## 5. Scanner — `/api/scanner`

### `POST /api/scanner/nmap`
```json
{ "target": "scanme.nmap.org", "profile": "quick" }
```
Profiles: `quick`, `version`, `full`. The server spawns `nmap` and streams parsed output.

**Response 503** if `nmap` not on PATH: `{ "ok": false, "error": { "code": "NMAP_UNAVAILABLE" } }`.

### `POST /api/scanner/vuln`
```json
{ "target": "https://example.com" }
```
Runs a battery of header / TLS / cookie checks. Returns a list of findings with severity.

---

## 6. Threat intel — `/api/threat/feed`

### `GET /api/threat/feed`
Curated IOC feed (last 20 entries). Static by default; pluggable for future feeds.

```json
{ "items": [ { "indicator": "198.51.100.42", "kind": "ip", "source": "...", "first_seen": 1717689600000 } ] }
```

---

## 7. System — `/api/system`

### `GET /api/system/metrics`
Returns the latest snapshot from `systeminformation`.

```json
{
  "cpu": { "load": 0.42, "cores": 16 },
  "memory": { "total": 68719476736, "used": 21474836480, "free": 47244640256 },
  "disk": [ { "fs": "C:", "size": 999653638144, "used": 412316860416 } ],
  "net": [ { "iface": "Ethernet", "rx_sec": 1024, "tx_sec": 512 } ],
  "uptime": 12345
}
```

---

## 8. Settings — `/api/settings`

### `GET /api/settings`
Returns the current user's preferences.

### `PUT /api/settings`
```json
{ "density": "compact", "defaultPage": "alerts", "notifications": { "sound": false } }
```

### `GET /api/settings/audit`
Last 100 audit-log entries (most recent first). Each row has `user_id`, `action`, `target`, `ip`, `ts`.

---

## Socket.IO events

The server emits a `connection` event with a JWT-authenticated socket. After that:

### Server → client

| Event | Payload | Notes |
|---|---|---|
| `packet:capture` | `[{ts, src, dst, proto, port, state, insecure, note}, ...]` | ~1 Hz batch of recent packets |
| `bandwidth:tick` | `{ t, rx, tx }` | Bytes per second, last batch |
| `alert:new` | `{ id, severity, title, summary, indicator, source, created_at }` | Push on every new alert |
| `system:metric` | `{ cpu, memory, net, ... }` | Periodic (default 5 s) |
| `scan:progress` | `{ id, tool, percent, line }` | Streamed for nmap / vuln scanner |
| `scan:done` | `{ id, tool, result }` | Final result |
| `threat:update` | `{ items: [...] }` | IOC feed refresh |

### Client → server

| Event | Payload | Notes |
|---|---|---|
| `subscribe:packets` | `{}` | Subscribe to packet events (default-on) |
| `subscribe:alerts` | `{}` | Subscribe to alert events (default-on) |
| `unsubscribe:*` | `{}` | Stop receiving |

### Handshake

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:4000', {
  auth: { token: localStorage.getItem('token') },
  transports: ['websocket', 'polling'],
});
```

If the token is missing or invalid, the handshake is rejected and the client retries with exponential backoff (handled by `socket.io-client` natively).

---

## Rate limits

| Bucket | Limit | Window |
|---|---|---|
| Per-IP (all `/api/*`) | 100 requests | 15 min sliding |
| Per-IP (login) | 5 attempts | 1 min |
| Per-IP (verify-2fa) | 10 attempts | 5 min |

Exceeding a limit returns `429` with a `Retry-After` header (in seconds).
