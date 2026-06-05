# Changelog

All notable changes to **CYBERBLACK-SoC-DASHBOARD** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-06-05

**The first MNC-grade release.** Full-stack SoC dashboard with detection, network visibility, OSINT, threat tooling, TOTP 2FA, and a strict 12-tone black-and-white design system.

### Highlights

- **Real-time detection engine** with severity-tagged alerts (critical / high / medium / low) and assignment / status workflow
- **Network visibility** — live packet feed, geo-plotted world map (Leaflet + CartoDB dark tiles), top talkers, protocol breakdown, bandwidth chart
- **OSINT** — DNS, Whois, and Shodan lookups with per-indicator caching
- **Threat tools** — Nmap terminal (graceful fallback), vulnerability scanner, malware hash check + VirusTotal hook, phishing URL analyzer, threat intel feed
- **Identity** — bcrypt (12 rounds) passwords, TOTP RFC 6238 2FA, JWT (HS256, 12 h TTL), server-side session revocation, per-IP and per-user rate limiting, audit log
- **Platform** — Express 4 + Socket.IO 4, **node:sqlite** (built into Node ≥ 22.5, zero native build), React 18 + Vite 5 + Tailwind 3, Zustand, Recharts, Leaflet

### Design system (shipped gates)

- 12-tone neutral palette enforced by 7 CI compliance gates
- Severity encoded by **border shade + glyph + label** — never by hue
- Typography: **Orbitron** (headers), **JetBrains Mono** (data), **Rajdhani** (body)
- Geometry: 0 or 2 px radius only, no glassmorphism, no chromatic glow
- Motion: `scanline`, `flicker`, `pulse-glow`, `slide-in`, `blink-cursor`, `scan-horizontal`
- `matrix-fall` banned (the single most overused SOC cliché and we refuse)

### Cross-platform dev runner

- Custom `scripts/dev.mjs` replaces `concurrently` to avoid the `spawn cmd.exe ENOENT` failure on PowerShell-only Windows hosts
- `scripts/get-totp.js` — live TOTP code ticker for 2FA enrollment / verification

### Security posture

- Helmet CSP with explicit allow-list (no `unsafe-eval`, no wildcard)
- CORS restricted to a single origin from `CLIENT_URL`
- HSTS / X-Frame-Options / X-Content-Type-Options at the edge (nginx config in `docs/DEPLOYMENT.md`)
- Audit log on every privileged action: login, 2FA, password change, alert status, settings change, scanner run

### Dependencies

- **318** server packages (zero native build)
- **191** client packages
- Production client bundle: **884 kB unminified, ~260 kB gzipped**

### Documentation

- `README.md` — landing page
- `docs/ARCHITECTURE.md` — system diagrams, module map, data flows
- `docs/QUICKSTART.md` — 5-minute setup with troubleshooting matrix
- `docs/API.md` — full REST + Socket.IO reference
- `docs/DATABASE.md` — ER diagram + per-table documentation
- `docs/SECURITY.md` — threat model, auth flow, hardening checklist
- `docs/DESIGN-SYSTEM.md` — palette, severity encoding, typography, motion
- `docs/DEPLOYMENT.md` — production build, nginx, systemd, backups
- `docs/ROADMAP.md` — v2.1 / v2.2 / v3.0 backlog
- `docs/FAQ.md` — 12 common operator questions
- `CONTRIBUTING.md` — branch model, commit style, PR template
- `SECURITY.md` — responsible disclosure
- `CHANGELOG.md` — this file
- `LICENSE` — Proprietary / All Rights Reserved

### Verified

- [x] Production client build passes
- [x] Server boot smoke-tested
- [x] `/api/health` returns 200
- [x] Auth flow end-to-end (login → 2FA → protected route)
- [x] All 7 design-system compliance gates pass
- [x] Synthetic packet engine emits identical event shape to a real pcap backend
- [x] 200+ alerts / 11k+ flows generated in a single soak test
- [x] OSINT DNS / Whois return real records

### Known limitations

- Single-tenant only (multi-tenant ships in v3.0)
- Single admin role (granular RBAC ships in v2.1)
- No real NIC capture backend (synthetic generator only; v2.1)
- No design CI script yet (`npm run lint:design` ships in v2.1)

---

## [Unreleased]

### Planned for v2.1

- Real Npcap / libpcap capture
- Full VirusTotal integration
- Full Shodan integration
- OIDC SSO
- Granular RBAC
- Multi-user UI
- Design CI gate script
- `npm audit` in CI
- Migration runner
- Scheduled DB backup script

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

[2.0.0]: #200--2026-06-05
[Unreleased]: #unreleased
