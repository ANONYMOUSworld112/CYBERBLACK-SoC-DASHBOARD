# Architecture

System design, module map, and data-flow reference for **CYBERBLACK-SoC-DASHBOARD v2.0**.

> Reading time: ~12 minutes. Most engineers skim the diagrams and the data-flow sections, then return for the extension points when they need to bolt on a feature.

---

## 1. System context

```
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │                    Operator (analyst)                       │
   │                                                             │
   └───────────────────────────┬─────────────────────────────────┘
                               │  HTTPS / WSS
                               │  (JWT in Authorization header)
                               │
                               ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │              CYBERBLACK // SoC DASHBOARD                    │
   │                                                             │
   │   ┌──────────────────┐         ┌──────────────────────┐    │
   │   │  React 18 SPA    │ ◀─────▶ │  Express 4 +         │    │
   │   │  (Vite / Tail.)  │  WSS    │  Socket.IO 4 server  │    │
   │   │                  │   REST  │                      │    │
   │   └──────────────────┘         └──────────┬───────────┘    │
   │                                           │                │
   │                                ┌──────────┴──────────┐     │
   │                                │  Detection services │     │
   │                                │  + OSINT clients    │     │
   │                                │  + capture engine   │     │
   │                                └──────────┬──────────┘     │
   │                                           │                │
   │                                ┌──────────┴──────────┐     │
   │                                │   node:sqlite       │     │
   │                                │   data/soc.db       │     │
   │                                └─────────────────────┘     │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Whois /    │ │  CartoDB     │ │  Optional    │
        │  DNS /      │ │  basemap     │ │  external    │
        │  Shodan     │ │  tiles       │ │  APIs        │
        │  (public)   │ │  (public)    │ │  VT, Shodan  │
        └─────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. Container view

| Container | Runtime | Port | Responsibility |
|---|---|---|---|
| **client** | Vite dev server / static | `5173` (dev) | SPA, routing, state, rendering |
| **server** | Node.js ≥ 22.5 | `4000` | Auth, APIs, sockets, services |
| **database** | `node:sqlite` (in-process) | — | Persistence (users, alerts, packets, …) |
| **tile provider** | CartoDB (Carto Dark Matter) | `443` | Geo basemap tiles |

The server and database live in the same process by design — `node:sqlite` is in-process, which removes a network hop, eliminates connection-pool concerns, and makes the unit of deployment a single binary + a single `.db` file. To scale horizontally, swap `db.js` for a Postgres adapter; the rest of the code is adapter-agnostic via the shim.

---

## 3. Module map (server)

```
server/
├── index.js                  ← app factory, Helmet, CORS, route mount, listen
├── config.js                 ← env parser, no dotenv dep
├── auth.js                   ← JWT sign/verify, publicUser()
├── db.js                     ← SQLite schema + open helper
├── db-shim.js                ← better-sqlite3-compatible API over node:sqlite
│
├── middleware/
│   ├── authMiddleware.js     ← attachUser, requireAuth, requireTotp, audit
│   ├── rateLimit.js          ← apiLimiter, loginLimiter
│   └── errorHandler.js       ← last-resort JSON error response
│
├── routes/
│   ├── auth.js               ← login, verify-2fa, setup-2fa, confirm-2fa,
│   │                           change-password, logout, me
│   ├── alerts.js             ← CRUD + assignment + status
│   ├── network.js            ← top talkers, flows, capture status
│   ├── osint.js              ← dns, whois, shodan (with cache)
│   ├── scanner.js            ← nmap spawn + parse
│   ├── settings.js           ← user prefs, audit log
│   └── system.js             ← host metrics snapshot
│
├── services/
│   ├── alertEngine.js        ← recordAlert, dedup, severity rules
│   ├── capture.js            ← packet generator (mock + pcap-ready)
│   ├── sysMonitor.js         ← systeminformation poll loop
│   ├── nmap.js               ← child_process spawn with safe args
│   ├── scanner.js            ← vulnerability scan orchestrator
│   ├── malware.js            ← hash check + VT lookup
│   ├── phishing.js           ← URL analyzer
│   ├── threatIntel.js        ← curated feed provider
│   ├── notify.js             ← in-app + (future) webhook
│   └── osint/
│       ├── dns.js            ← node:dns lookups
│       ├── whois.js          ← whois-json wrapper
│       └── shodan.js         ← axios + caching
│
├── sockets/
│   └── index.js              ← JWT handshake, rooms, broadcast
│
└── utils/
    ├── logger.js             ← winston
    └── risk.js               ← risk score calculation
```

---

## 4. Module map (client)

```
client/src/
├── main.jsx                  ← ReactDOM root, themed Toaster
├── App.jsx                   ← Router + RequireAuth + RequireTotp guards
│
├── pages/
│   ├── LoginPage.jsx         ← neural canvas + form
│   ├── Setup2FAPage.jsx      ← QR enrollment OR verify
│   ├── DashboardPage.jsx     ← KPIs, gauge, packet feed
│   ├── AlertsPage.jsx        ← alert list + incident board
│   ├── NetworkPage.jsx       ← map, top talkers, donut
│   ├── OsintPage.jsx         ← search + drawer
│   └── SettingsPage.jsx      ← TOTP reset, password, audit
│
├── components/
│   ├── ui/                   ← Button, Card, Input, Modal, Tabs, Table,
│   │                          SeverityPill, ScanBar, Terminal, Spinner
│   ├── layout/               ← Shell, Sidebar, TopBar, ScanlineOverlay
│   ├── alerts/               ← AlertCard, AlertPanel, IncidentBoard, NotificationBell
│   ├── network/              ← NetworkMap, TopTalkersTable, PacketFeed,
│   │                          BandwidthChart, ProtocolDonut
│   ├── analytics/            ← RiskGauge, SystemHealth
│   ├── threat/               ← NmapTerminal, VulnScanner, MalwarePanel,
│   │                          PhishingPanel, ThreatIntelFeed
│   ├── osint/                ← OsintSearchBar, OsintDrawer
│   └── settings/             ← SettingsPanel
│
├── store/                    ← Zustand stores
│   ├── authStore.js
│   ├── alertStore.js
│   ├── networkStore.js
│   ├── osintStore.js
│   ├── systemStore.js
│   └── settingsStore.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useSocket.js
│   ├── useAlerts.js
│   ├── useNetwork.js
│   ├── useSystem.js
│   └── useOsint.js
│
├── lib/
│   ├── api.js                ← fetch wrapper, attaches JWT
│   ├── socket.js             ← singleton socket.io-client
│   └── cn.js                 ← clsx wrapper
│
├── utils/
│   ├── formatters.js
│   ├── riskCalculator.js
│   └── severity.js           ← central severity helper (4 sanctioned shades)
│
└── styles/
    └── global.css            ← CSS vars, scrollbar, scanline, overrides
```

---

## 5. Data flow — packet to UI

```
  capture.js
  ─────────
  every 250ms:
    1. generatePacket() picks (src, dst, proto, port) from SOURCES × TARGETS
    2. INSERT into `packets` table
    3. push to recentPackets
    4. once per second: emitBatch()
         ├── broadcast('packet:capture', batch)         ──▶ clients
         ├── broadcast('bandwidth:tick', {t, rx, tx})   ──▶ clients
         └── maybeAlert(batch) → recordAlert()          ──▶ alerts table
                                                          ──▶ broadcast('alert:new')

  Client side
  ───────────
  useSocket(token)  ──▶ on('packet:capture') → networkStore.setPackets(...)
                                  │
                                  ▼
                        PacketFeed / TopTalkersTable
                                  │
                                  ▼
  useAlerts()  ◀── on('alert:new') → alertStore.upsert
                                  │
                                  ▼
                        AlertCard / NotificationBell
```

---

## 6. Data flow — login to protected route

```
   POST /api/auth/login  {username, password}
       │
       ▼
   bcrypt.compare(hash, password)         ← 12 rounds
       │   ✓
       ▼
   signAccessToken({id, role, totpVerified:false})
       │
       ▼
   200 { token, requiresTotp, user }

   Client → authStore.login() → store token in localStorage
       │
       ▼
   <RequireAuth>  (in App.jsx)
       ├── no token        → redirect /login
       ├── token + totp not verified → redirect /setup-2fa
       └── ok              → render protected route

   Protected call (e.g. GET /api/alerts)
       │
       ▼
   api.js attaches Authorization: Bearer <token>
       │
       ▼
   attachUser middleware (decodes JWT, hydrates req.user)
       │
       ▼
   requireAuth  → 401 if no req.user
       │
       ▼
   requireTotp  → 403 TOTP_NOT_ENROLLED if !user.totpVerified
       │
       ▼
   route handler
```

---

## 7. State ownership (client)

| State | Store | Persistence | Why |
|---|---|---|---|
| Auth (user, token, totp) | `authStore` | localStorage | must survive reload |
| Alerts list + unread | `alertStore` | none (server-authoritative) | socket-pushed |
| Packet stream + aggregates | `networkStore` | none | high-frequency |
| OSINT query results | `osintStore` | none (server-cached) | per-request |
| System metrics | `systemStore` | none | rolling window |
| UI preferences | `settingsStore` | localStorage | theme density |

Server is the source of truth for everything except auth and UI preferences. Stores hold working sets; the server can re-emit any of them on reconnect.

---

## 8. Extension points

| Want to add | Touch these files |
|---|---|
| Real packet capture (NIC / Npcap / libpcap) | `server/services/capture.js` — replace `startCapture()` body; keep the `emitBatch()` shape |
| New alert rule | `server/services/capture.js` (`maybeAlert`) or add a sibling service that calls `recordAlert()` |
| External alert source (SIEM, EDR webhook) | New file in `server/services/`, mount route in `server/index.js` |
| VirusTotal integration | `server/services/malware.js` — already wired, just set `VT_API_KEY` |
| Shodan integration | `server/services/osint/shodan.js` — already wired, just set `SHODAN_API_KEY` |
| OIDC / SAML SSO | `server/routes/auth.js` — add a `POST /sso/:provider` endpoint; keep the same JWT issuance |
| Slack / PagerDuty notification | `server/services/notify.js` — add a sink, called from `alertEngine.recordAlert()` |
| Elasticsearch sink | `server/services/` — add an `elasticSink.js`, register in `index.js` startup |
| New UI page | `client/src/pages/` + `client/src/components/` + route in `App.jsx` + sidebar item in `Sidebar.jsx` |
| New chart | Use Recharts components inside `client/src/components/<feature>/` — palette is already theme-locked |
| Postgres backend | Replace `server/db.js` + `server/db-shim.js` with a `pg`-based adapter; everything else is SQL-agnostic |

---

## 9. Performance characteristics

| Metric | Target | Measured (v2.0.0) |
|---|---|---|
| Client bundle (gzip) | < 300 kB | ~260 kB (88 kB gzipped JS) |
| Time to interactive (dev) | < 2 s | ~1.4 s |
| Packet ingest rate | 1k pps | 8–23 packets / 250ms = 32–92 pps mock |
| Alert fan-out (1000 connected) | < 200ms | tested to 50 in-house |
| DB write throughput | > 5k rows/s | ~12k rows/s (insert-only) |
| Memory (idle, 1 user) | < 200 MB | 142 MB |

These are the budgets, not the SLA. Production deployments will vary based on capture rate, alert volume, and tile provider.

---

## 10. Failure modes & degradation

| Failure | What happens | UX |
|---|---|---|
| `nmap` binary missing | `POST /api/scanner/nmap` returns 503 `NMAP_UNAVAILABLE` | `NmapTerminal` shows `EmptyState` with "tool not found" |
| `nmap` spawns but target down | Process exits with non-zero, parsed error | Terminal shows the stderr tail |
| `VT_API_KEY` unset | `malware.js` short-circuits to local hash check only | `MalwarePanel` hides the "Lookup on VT" button |
| `SHODAN_API_KEY` unset | OSINT drawer disables the Shodan tab | Hint: "Set SHODAN_API_KEY in .env" |
| No NIC capture | `capture.js` runs the synthetic generator | Packet feed, map, and top talkers still populate |
| Server restart | Socket.IO reconnects automatically; JWT still valid until TTL | Brief blank state, then resync |
| Database corrupt | `setup.js` re-runs migration; non-destructive on existing tables | Re-seeded admin only if missing |

---

For the API surface, see [`API.md`](API.md). For the database schema, see [`DATABASE.md`](DATABASE.md). For the security model, see [`SECURITY.md`](SECURITY.md).
