# Roadmap

Where CYBERBLACK-SoC-DASHBOARD is going. Versions are **targets**, not promises.

> Status legend: ☐ planned · ☑ in progress · ✅ shipped

---

## v2.0 — current (`✅ shipped`)

Full-stack SoC with detection, network visibility, OSINT, threat tools, TOTP 2FA, and a strict 12-tone design system. 318 server packages, 191 client packages, zero native build. Custom dev runner for cross-platform PowerShell compatibility.

See [CHANGELOG.md](../CHANGELOG.md) for the full release notes.

---

## v2.1 — `60 days` (target: Q1)

**Focus: live capture + integrations.**

| Item | Status | Notes |
|---|---|---|
| Real Npcap / libpcap capture backend | ☐ | replace mock in `capture.js`; identical event shape |
| VirusTotal integration (full) | ☐ | already scaffolded; ship the key flow + rate-limit handling |
| Shodan integration (full) | ☐ | already scaffolded; ship cached host banners |
| OIDC SSO (Auth0, Okta, Keycloak) | ☐ | `POST /api/auth/sso/:provider` returning a JWT |
| Granular RBAC | ☐ | roles beyond `admin` / `analyst` (e.g. `viewer`, `responder`) |
| Multi-user UI | ☐ | user management page, audit log filtering |
| Design CI gate script | ☐ | `npm run lint:design` runs all 7 compliance gates |
| `npm audit` in CI | ☐ | fail build on `high` / `critical` |
| Migration runner | ☐ | `schema_migrations` table + `scripts/migrate.mjs` |
| Scheduled DB backup script | ☐ | `scripts/backup.mjs` (uses SQLite backup API) |

---

## v2.2 — `90 days` (target: Q2)

**Focus: scale-out + automation.**

| Item | Status | Notes |
|---|---|---|
| Socket.IO Redis adapter | ☐ | multi-instance broadcast |
| Postgres backend | ☐ | drop-in via the existing shim |
| Sigma rule pack | ☐ | convert community Sigma rules to the alert engine DSL |
| SOAR playbooks | ☐ | webhook sinks, scheduled responses, manual approval |
| Elasticsearch sink | ☐ | forward alerts / packets to ES for long-term search |
| Webhook notifier (Slack, PagerDuty, Teams) | ☐ | pluggable sinks in `notify.js` |
| Per-tenant API keys | ☐ | service accounts with scoped permissions |
| Performance: packet ingest at 10k pps | ☐ | batched inserts, optional write-through cache |

---

## v3.0 — `180 days` (target: Q3–Q4)

**Focus: enterprise / multi-tenant.**

| Item | Status | Notes |
|---|---|---|
| Multi-tenant database isolation | ☐ | schema-per-tenant, row-level security |
| Agent-based deployment | ☐ | lightweight Go/Rust agent for capture, ship to a central SoC |
| High-availability mode | ☐ | active/active with shared Postgres + Redis |
| Compliance reports | ☐ | SOC 2 / ISO 27001 evidence packs generated from audit log |
| Air-gapped deployment | ☐ | offline install, signed packages, no external CDN at runtime |
| Theming beyond B&W | ☐ | optional accent palette (still gated by the same compliance rules) |
| Mobile-responsive PWA | ☐ | full feature set on tablet / phone for on-call |
| Federated threat intel | ☐ | MISP / OpenCTI sync |

---

## Non-goals (intentionally)

- **Offensive security tooling.** No exploit modules, no credential-stuffing, no exfiltration helpers. This is a defensive platform.
- **Generic SIEM replacement.** CYBERBLACK is for analyst triage, not petabyte log retention. Hook into Splunk / Elastic / Sentinel for that.
- **Mobile-first.** We optimize for analysts at a desk. v3.0 adds a responsive PWA, not a native app.
- **"Just one more color."** The B&W rule is the brand. Don't ask.

---

## Contributing to the roadmap

Open an issue with the `roadmap` label and a short description. Maintainers triage monthly. Acceptance criteria:

- Use case is clear and concrete
- Aligns with the goals above
- Doesn't violate the non-goals
- Maintainer agrees to shepherd it
