# FAQ

> 12 common operator questions, answered without ceremony. If your question isn't here, open an issue or check the [docs index](../README.md#documentation).

---

### 1. Why is everything black and white?

Because the team uses the dashboard at 02:00, and the team includes color-blind analysts. Severity should never depend on hue. Border shade + glyph + label works in any lighting, on any display, in any printout.

If you genuinely need chromatic data, hook a third-party BI tool (Grafana, Kibana) to the same data source. The dashboard itself stays B&W.

### 2. Can I add a single accent color?

No. The 12-tone palette is enforced by the 7 compliance gates in CI. Adding an accent means adding it to the palette, updating `tailwind.config.js`, `client/src/styles/global.css`, **and** updating this design system. The cost is intentional.

### 3. The map shows real cities but the IPs are fake. Why?

The 6 hardcoded `TARGETS` in `capture.js` (8.8.8.8, 1.1.1.1, 142.250.74.78, 93.184.216.34, 13.107.42.14, 52.84.150.22) are real public IPs that geolocate to real cities. The packets themselves are synthetic — we don't have a NIC tap. When you switch to a real capture backend, the map continues to work because Leaflet geolocates the IPs through `geoip-lite`, not from a static lookup.

### 4. How do I reset the admin password?

The clean way:

```bash
node -e "
  import('./server/db.js').then(async m => {
    const bcrypt = (await import('bcrypt')).default;
    const hash = await bcrypt.hash('NewPassword!2026', 12);
    m.db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, 'admin');
    console.log('admin password reset');
  });
"
```

Or the destructive way:

```bash
rm data/soc.db*
npm run setup
```

The destructive way generates a new admin password (`ChangeMe!2026`) and a new `JWT_SECRET`. Every existing session is invalidated.

### 5. How do I revoke a leaked JWT?

```bash
node -e "
  import('./server/db.js').then(m => {
    const r = m.db.prepare('DELETE FROM sessions WHERE id = ?').run(process.argv[1]);
    console.log('deleted', r.changes, 'session(s)');
  });
" <jwt-jti-claim>
```

You can also delete the `JWT_SECRET` (delete `.env`, re-run `setup.js`, restart). That kills **every** session but also requires re-configuring `VT_API_KEY` / `SHODAN_API_KEY`.

### 6. Why `node:sqlite` instead of Postgres?

- Zero native build. No `node-gyp`, no Visual Studio Build Tools, no Docker, no `apt install postgresql-15`.
- Single-file backup. `cp data/soc.db` is the whole story.
- In-process. No network hop, no connection pool.
- Good enough for single-tenant up to ~100k alerts/day. The v2.2 roadmap swaps to Postgres via the same shim.

### 7. The custom dev runner — why not `concurrently`?

`concurrently` v9 spawns child processes via `cmd.exe` on Windows. Many corporate / locked-down Windows machines don't have `cmd.exe` on PATH (only PowerShell). The error is `spawn cmd.exe ENOENT`. Our `scripts/dev.mjs` spawns `node` and `vite` directly via `child_process.spawn(process.execPath, …)`, no shell, no `cmd.exe`. It works identically on Windows / macOS / Linux.

### 8. How do I add a new alert source?

Add a service file:

```js
// server/services/mySource.js
import { recordAlert } from './alertEngine.js';

export function startMySource() {
  setInterval(() => {
    recordAlert({
      severity: 'medium',
      source: 'my-source',
      title: 'Example event',
      summary: '...',
      indicator: '10.0.0.5',
    });
  }, 60_000);
}
```

Wire it in `server/index.js`:

```js
import { startMySource } from './services/mySource.js';
// ...
server.listen(config.port, () => {
  startCapture();
  startMySource();
});
```

Done. The dashboard renders it via the existing alert panel.

### 9. Nmap is not on PATH. What now?

Install nmap:

```bash
# macOS
brew install nmap
# Debian / Ubuntu
sudo apt install nmap
# Windows
choco install nmap
```

Or accept the `EmptyState` UI. The rest of the dashboard works without nmap.

### 10. How do I rotate `JWT_SECRET` without logging everyone out?

You can't. Rotating the secret invalidates every JWT in flight because their signatures become unverifiable. If you need zero-downtime rotation, ship **two** secrets (`JWT_SECRET` + `JWT_SECRET_PREVIOUS`), accept tokens signed by either, then phase out the old one. That's a v2.1 feature.

### 11. Does the dashboard phone home?

No. There is no telemetry, no analytics, no crash reporting, no auto-update check. The only outbound network calls are:

- DNS, Whois, and (optionally) Shodan lookups you explicitly trigger
- CartoDB tile requests (the map basemap)
- Google Fonts requests (for Orbitron, JetBrains Mono, Rajdhani)

All three can be eliminated for air-gapped deployments. v3.0 will ship an offline mode that bundles the tiles and fonts.

### 12. Where's the data flow diagram?

[Architecture → § 5 / § 6](../docs/ARCHITECTURE.md#5-data-flow--packet-to-ui). The packet-to-UI and login-to-protected-route flows are both drawn in ASCII.

---

## Still stuck?

1. Read the [docs index](../README.md#documentation).
2. Search the issue tracker.
3. Open a new issue with: CYBERBLACK version, OS, Node version, what you ran, what you expected, what you got, and a `console` / server log snippet.
