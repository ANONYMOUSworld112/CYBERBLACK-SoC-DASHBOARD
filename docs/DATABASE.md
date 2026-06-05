# Database

The CYBERBLACK-SoC-DASHBOARD stores all state in a single **SQLite** database file: `data/soc.db`.

The driver is **`node:sqlite`** (built into Node ≥ 22.5), wrapped by a small shim (`server/db-shim.js`) that exposes a `better-sqlite3`-compatible API. This choice means:

- **Zero native build** — no Visual Studio Build Tools, no `node-gyp`, no `node-pre-gyp` download.
- **In-process** — no connection pool, no TCP socket, no auth.
- **Single-file backup** — `cp data/soc.db backup/soc-YYYYMMDD.db` is the entire backup story.
- **Trivial horizontal-scale path** — replace `db.js` with a `pg` adapter; the rest of the code is SQL-agnostic.

---

## ER diagram

```
   ┌────────────┐ 1     *  ┌────────────┐
   │   users    │──────────▶│  sessions  │
   └─────┬──────┘            └────────────┘
         │ 1
         │
         │ *
   ┌─────▼──────────────────────────────────────────┐
   │                  audit_log                     │
   └────────────────────────────────────────────────┘

   ┌────────────┐  *  ┌────────────┐
   │  alerts    │◀────│ incidents  │  (related_alerts: TEXT[])
   └────────────┘     └────────────┘

   ┌────────────┐
   │  scans     │  (one row per scan; result is TEXT JSON)
   └────────────┘

   ┌────────────────┐
   │  osint_cache   │  UNIQUE(indicator, kind)
   └────────────────┘

   ┌────────────┐
   │  packets    │  (time-series, indexed by ts DESC)
   └────────────┘

   ┌────────────┐
   │  settings   │  (key-value)
   └────────────┘
```

---

## Tables

### `users`
Identity store. Hashed credentials + TOTP metadata.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | |
| `username` | TEXT | UNIQUE NOT NULL | |
| `email` | TEXT | UNIQUE NOT NULL | |
| `password_hash` | TEXT | NOT NULL | bcrypt 12 rounds |
| `role` | TEXT | NOT NULL DEFAULT `'analyst'` | `admin` or `analyst` |
| `totp_secret` | TEXT | nullable | base32-encoded |
| `totp_enabled` | INTEGER | NOT NULL DEFAULT 0 | 0/1 boolean |
| `created_at` | INTEGER | NOT NULL | epoch ms |
| `last_login_at` | INTEGER | nullable | epoch ms |

Seeded by `setup.js` with one `admin` user. Subsequent users are added via `/api/settings/users` (admin-only) — the v2.1 roadmap.

### `sessions`
Active JWT sessions, used for server-side revocation. The JWT itself is stateless, but the row in this table is the source of truth for "is this token still valid?"

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | the JWT's `jti` claim |
| `user_id` | INTEGER FK → users.id ON DELETE CASCADE | |
| `issued_at` | INTEGER | epoch ms |
| `expires_at` | INTEGER | epoch ms (matches `JWT_TTL`) |
| `ip` | TEXT | issuing IP, for audit |
| `user_agent` | TEXT | for audit |

`attachUser` middleware checks `sessions.expires_at > now()` on every request. Logout deletes the row.

### `alerts`
The heart of the SOC. One row per detection.

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `severity` | TEXT | CHECK in (`critical`,`high`,`medium`,`low`) |
| `source` | TEXT NOT NULL | e.g. `packet-engine`, `vuln-scanner`, `auth` |
| `title` | TEXT NOT NULL | |
| `summary` | TEXT | |
| `indicator` | TEXT | the IP / hash / URL that triggered the alert |
| `status` | TEXT | CHECK in (`open`,`investigating`,`resolved`,`dismissed`) |
| `assignee_id` | INTEGER FK → users.id | |
| `created_at` | INTEGER NOT NULL | |
| `updated_at` | INTEGER NOT NULL | |

Indexes: `severity`, `status`, `created_at DESC`.

### `incidents`
Logical groupings of alerts. Analyst-curated, not auto-generated.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `title` | TEXT NOT NULL | |
| `description` | TEXT | |
| `status` | TEXT | `triage`, `investigating`, `resolved` |
| `severity` | TEXT | promoted from the highest-severity alert in the group |
| `related_alerts` | TEXT | JSON array of alert IDs |
| `created_at`, `updated_at` | INTEGER | |

### `scans`
History of every scanner run.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `tool` | TEXT NOT NULL | `nmap`, `vuln`, `malware`, `phishing` |
| `target` | TEXT NOT NULL | the indicator scanned |
| `status` | TEXT NOT NULL | `running`, `done`, `error` |
| `result` | TEXT | JSON, populated on completion |
| `started_at`, `finished_at` | INTEGER | |

### `osint_cache`
Whois / DNS / Shodan lookups, keyed by indicator + kind.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `indicator` | TEXT NOT NULL | |
| `kind` | TEXT NOT NULL | `whois`, `dns`, `shodan` |
| `result` | TEXT NOT NULL | JSON |
| `fetched_at` | INTEGER NOT NULL | |

UNIQUE `(indicator, kind)`. TTL is enforced at the service layer (default 24 h). A cron job purges entries older than the TTL.

### `settings`
Per-user key-value preferences. The `key` is namespaced as `user:<id>:<pref>` for private keys, or just `<pref>` for globals.

| Column | Type | Notes |
|---|---|---|
| `key` | TEXT PK | |
| `value` | TEXT NOT NULL | JSON-encoded |

### `audit_log`
Tamper-evident (within SQLite) record of every privileged action.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | INTEGER FK → users.id | nullable for system actions |
| `action` | TEXT NOT NULL | `login`, `verify-2fa`, `change-password`, … |
| `target` | TEXT | what was acted on (alert id, settings key, …) |
| `ip` | TEXT | source IP |
| `ts` | INTEGER NOT NULL | epoch ms |

Visible in the UI at `/settings → audit log`. Exposed via `GET /api/settings/audit`.

### `packets`
Append-only log of every captured packet (mock or pcap).

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `ts` | INTEGER NOT NULL | epoch ms |
| `src` | TEXT | |
| `dst` | TEXT | |
| `proto` | TEXT | TCP / UDP / ICMP |
| `port` | INTEGER | nullable for ICMP |
| `state` | TEXT | `open`, `filtered`, `closed` |
| `insecure` | INTEGER | 0/1 — whether the port is in `INSECURE_PORTS` |
| `note` | TEXT | free-form |

Index: `ts DESC`. The capture service writes 8–23 rows per 250 ms tick. The dashboard aggregates over the last 5 min by default; older rows are eligible for pruning (cron, default 7-day retention).

---

## Migration strategy

There is **one** migration file: the `migrate()` function inside `setup.js`. It uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`, so re-running it is idempotent.

For schema changes after v2.0.0:

1. Add a new `IF NOT EXISTS` statement to `migrate()`. Always additive.
2. For destructive changes (column drop, type change), write a `migrations/NNNN_description.sql` file and a runner that records applied migrations in a `schema_migrations` table.
3. Backfill scripts live in `scripts/backfill/`.

> The `schema_migrations` table will land in v2.1 when the first destructive change is required.

---

## Backup & restore

### Backup
```bash
# simple
cp data/soc.db backup/soc-$(date +%F).db

# safer (use SQLite backup API — online, no lock)
node -e "
  import('./server/db.js').then(m => {
    const dest = await import('node:fs').then(f => f.promises.open('backup.db','w'));
    await m.db.backup(dest.fd);
    dest.close();
  });
"
```

### Restore
```bash
# stop the server
cp backup/soc-YYYY-MM-DD.db data/soc.db
# start the server
```

For production, schedule a daily `node scripts/backup.mjs` (to be added in v2.1) and ship the `.db` to S3 / GCS / Azure Blob with 30-day retention.

---

## Sizing

| Metric | Single-tenant demo | 1k alerts/day | 10k alerts/day | 100k alerts/day |
|---|---|---|---|---|
| DB file | ~500 KB | ~5 MB | ~50 MB | ~500 MB |
| `packets` retention | 7 days | 3 days | 24 h | 6 h |
| Index size | negligible | < 1 MB | ~5 MB | ~50 MB |
| Backup time (cp) | instant | < 100 ms | ~1 s | ~10 s |

For 100k+ alerts/day or multi-tenant deployments, move to Postgres. The shim abstracts 95% of the surface; the remaining 5% is `db.prepare(...)` calls that use the few SQLite-specific placeholders (`@name` style) — those are already standard SQL and work as-is on Postgres.
