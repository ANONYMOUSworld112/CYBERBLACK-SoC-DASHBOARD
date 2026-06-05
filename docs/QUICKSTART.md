# Quickstart

Five minutes from zero to a working dashboard. Tested on Windows (PowerShell), macOS, and Linux.

---

## Prerequisites

| Requirement | Why | Verify |
|---|---|---|
| **Node.js ≥ 22.5** | Uses built-in `node:sqlite` (no native build) | `node --version` |
| **npm ≥ 10** | Workspace install | `npm --version` |
| Optional: `nmap` on PATH | NmapTerminal works end-to-end | `nmap --version` |
| Optional: VirusTotal API key | Enables VT lookups in MalwarePanel | _env var_ |
| Optional: Shodan API key | Enables Shodan tab in OSINT | _env var_ |

That's it. No Docker, no Postgres, no Redis, no native compilers.

---

## 1. Install

```bash
cd /path/to/soc-dashboard-v2
npm run install:all
```

This installs:

- **318** server packages (Express, Socket.IO, helmet, jsonwebtoken, bcrypt, otplib, qrcode, winston, …)
- **191** client packages (React, Vite, Tailwind, Zustand, Recharts, Leaflet, …)

No native build steps. No Visual Studio Build Tools required. No `node-gyp` failures.

---

## 2. Bootstrap

```bash
npm run setup
```

**Expected output** (every line is informational, not a warning):

```
[01] .env created with freshly generated JWT_SECRET
[02] data/ ready at D:\SoC-dashboard v2\data
[03] schema migrated (users, sessions, alerts, incidents, scans, osint_cache, settings, audit_log, packets)
[04] admin user created — username: admin / password: ChangeMe!2026
[05] setup complete — run `npm run dev` to start
```

What just happened:

1. A 64-byte cryptographically random `JWT_SECRET` was generated and written to `.env`.
2. The `data/` directory was created.
3. The SQLite schema was migrated (9 tables, all `IF NOT EXISTS`).
4. An `admin` user was seeded with bcrypt-hashed password `ChangeMe!2026`.

> Re-running `setup` is safe. It does **not** overwrite `.env` if it exists, and it skips admin seeding if the user is present.

---

## 3. Run

```bash
npm run dev
```

**Expected output** (two streams merged):

```
═══════════════════════════════════════════════════════════
  CYBERBLACK // SoC DASHBOARD  —  dev runner
═══════════════════════════════════════════════════════════
[server] node --watch server/index.js
[client] vite
[server] SOC server listening on :4000  (client http://localhost:5173)
[server] packet capture started (mock generator)
[client]
  VITE v5.4.10  ready in 482 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
[client] page reload src/styles/global.css
```

Open **http://localhost:5173** in a browser.

---

## 4. First login

The login screen renders against a live neural-network canvas (no images, all canvas-drawn).

```
  CYBERBLACK // SoC DASHBOARD
  ┌──────────────────────────────┐
  │  USERNAME  [ admin         ] │
  │  PASSWORD  [ •••••••••••• ] │
  │                              │
  │  [  AUTHENTICATE  ]          │
  └──────────────────────────────┘
```

1. Enter **`admin`** / **`ChangeMe!2026`**.
2. Click **AUTHENTICATE**.
3. The server returns a JWT and a `requiresTotp: false` flag (first login, no TOTP yet).
4. The client routes you to `/setup-2fa`.

### 4a. TOTP enrollment

The setup screen shows a QR code (or a setup secret) for any RFC 6238 authenticator.

```
  CYBERBLACK // SoC DASHBOARD  —  2FA ENROLLMENT
  ┌──────────────────────────────┐
  │   ┌─────────┐                │
  │   │ ▓▓▓▓▓▓▓ │   scan with    │
  │   │ ▓▓░░░▓▓ │   Google       │
  │   │ ▓▓░░░▓▓ │   Authenticator│
  │   │ ▓▓▓▓▓▓▓ │                │
  │   └─────────┘                │
  │                              │
  │  secret: FNPC UJL6 EEAC 2QCG │
  │                              │
  │  6-DIGIT CODE [______]       │
  │                              │
  │  [  CONFIRM ENROLLMENT  ]    │
  └──────────────────────────────┘
```

1. Scan the QR (or type the secret manually) into your authenticator.
2. Enter the current 6-digit code.
3. Click **CONFIRM ENROLLMENT**.
4. The server stores the TOTP secret and flips `totp_enabled = 1`.
5. You're routed to `/dashboard`.

### 4b. Verifying the code expires

TOTP codes rotate every 30 seconds. If your paste / form-submission round-trip is taking longer than 30 s, the code will be invalid by the time the server checks it.

Two solutions:

- **A.** Be quick.
- **B.** Run `node scripts/get-totp.js` in a separate terminal — it prints a live ticker with a countdown. Copy the code while the "valid Xs" number is ≥ 5.

```
[12s] TOTP for admin: 531930  (valid 18s, refresh in 18s)
[13s] TOTP for admin: 531930  (valid 17s)
[14s] TOTP for admin: 531930  (valid 16s)
[15s] TOTP for admin: 531930  (valid 15s)
```

### 4c. Subsequent logins

After enrollment, the flow becomes:

1. `POST /api/auth/login` → JWT issued with `totpVerified: false` (the JWT itself does not assert TOTP — that's a per-request DB check).
2. Client routes to `/setup-2fa` (which now renders as a **verify-only** form).
3. `POST /api/auth/verify-2fa` with the 6-digit code → server marks the session as TOTP-verified.
4. Client routes to `/dashboard`.

---

## 5. Verify everything works

After login, the dashboard should show:

- **Risk gauge** in the top-left animating from 0 to ~30–60.
- **Active alerts** counter ticking up (the alert engine fires every few seconds).
- **Packet feed** scrolling with `10.0.0.x → 8.8.8.8` style entries.
- **Network map** with markers at San Francisco (1.1.1.1), Mountain View (8.8.8.8), etc.

If any of these are static / empty, see the troubleshooting matrix below.

---

## Troubleshooting matrix

| Symptom | Cause | Fix |
|---|---|---|
| `spawn cmd.exe ENOENT` (PowerShell) | Old `concurrently` dependency | Already fixed — we use `scripts/dev.mjs`. Run `npm run dev`, not raw `concurrently`. |
| `EADDRINUSE :::4000` | Previous server still bound to port | `Get-Process node \| Stop-Process -Force` (PowerShell) or `pkill -f "node --watch server/index.js"` (Unix) |
| Login returns 500 | `.env` missing or `JWT_SECRET` empty | Re-run `npm run setup` |
| `TOTP_NOT_ENROLLED` loop | You deleted the user but kept the DB | `rm data/soc.db*` then `npm run setup` |
| Nmap terminal says "tool unavailable" | `nmap` not on PATH | Install nmap or accept the EmptyState; the rest of the app still works |
| Map tiles blank | CSP blocking CartoDB, or offline | Check the browser console for CSP errors. The map falls back to a black background; packet feed and charts are unaffected |
| `node:sqlite` import error | Node < 22.5 | Upgrade Node |
| Bundle is 884 kB | Vite is including the whole of Recharts + Leaflet in one chunk | Acceptable for a SOC tool. Manual chunking is on the v2.2 roadmap. |
| First login → blank page | `attachUser` rejected the JWT because of clock skew | `JWT_TTL` defaults to 12h; restart server, log in again |
| 2FA code rejected | Clock skew on the host running the server vs the authenticator | Sync system clock. otplib's default tolerance is ±30 s. |

---

## Reset everything

If you want a clean slate:

```bash
# 1. stop the dev runner (Ctrl+C)

# 2. delete the DB
rm -rf data/soc.db*

# 3. delete the .env
rm .env

# 4. re-bootstrap
npm run setup

# 5. re-run
npm run dev
```

This generates a fresh `JWT_SECRET` and a fresh admin password. **Do not do this in production.**

---

## Production build

```bash
npm run build      # builds client/dist
npm start          # node server/index.js, serves dist/ statically
```

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for nginx config, hardening, and backup.

---

## Next steps

- Read [`ARCHITECTURE.md`](ARCHITECTURE.md) to understand the system.
- Read [`SECURITY.md`](SECURITY.md) before exposing the dashboard to anyone.
- Skim [`FAQ.md`](FAQ.md) for common operational questions.
