# Contributing

Thanks for wanting to make CYBERBLACK better. This document is the minimum-viable guide. The team will help you ramp; please read the parts that affect you.

---

## 1. Code of conduct

Be a professional. Disagree on substance, not on identity. No harassment, no personal attacks, no doxxing. Violations get a warning, then a ban.

---

## 2. Branch model

- **`main`** — always shippable, protected, requires green CI + 1 reviewer.
- **`feat/<short-name>`** — short-lived feature branches off `main`.
- **`fix/<short-name>`** — short-lived fix branches off `main`.
- **`docs/<short-name>`** — docs only, faster turnaround.
- **No `develop` branch.** Trunk-based.

Branches older than 14 days without commits get closed.

---

## 3. Commit style

[Conventional Commits](https://www.conventionalcommits.org/) — enforced by CI.

```
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | When |
|---|---|
| `feat` | new feature |
| `fix` | bug fix |
| `refactor` | no behavior change |
| `perf` | performance |
| `docs` | docs only |
| `test` | tests only |
|`chore` | build / deps / tooling |
| `style` | formatting only |
| `revert` | undo a previous commit |

Scopes: `server`, `client`, `sockets`, `db`, `osint`, `scanner`, `alerts`, `network`, `design`, `docs`, `ci`.

Examples:
```
feat(alerts): add bulk status update endpoint
fix(capture): clamp packet rate to 100 pps
docs(security): clarify TOTP window tolerance
refactor(server): extract auth middleware into modules
```

---

## 4. Local dev setup

```bash
git clone ...
cd soc-dashboard-v2
npm run install:all
npm run setup
npm run dev
```

That gets you a working dashboard. To make a change:

1. Branch from `main`: `git checkout -b feat/your-thing`
2. Edit.
3. Run the relevant checks locally (see § 6).
4. Push, open a PR.

---

## 5. PR template

When you open a PR, fill this in:

```markdown
## What
One paragraph. What does this change, and why?

## How
One paragraph. How does it work? What's the trickiest bit?

## Test
What did you do to verify? Manual steps, scripts, screenshots.

## Risk
What could break? Rollback plan?

## Checklist
- [ ] Branch is from `main`
- [ ] Commits follow Conventional Commits
- [ ] `npm run build` passes
- [ ] `node setup.js` is idempotent (no destructive migrations)
- [ ] Docs updated (if user-facing)
- [ ] No new chromatic colors added (or palette updated + CI gate updated)
- [ ] Reviewed by at least one maintainer
```

---

## 6. Local checks (until CI gate ships)

```bash
# type/lint (server)
node --check server/index.js

# build
npm run build

# design compliance
grep -rE '#[0-9a-fA-F]{6}' client/src | grep -vE '#(000000|0a0a0a|0d0d0d|111111|141414|1a1a1a|2a2a2a|303030|333333|404040|505050|606060|707070|a0a0a0|ffffff)'
# (no output above means we passed)
```

The 7-gate script (`npm run lint:design`) ships in v2.1.

---

## 7. Where to start (good first issues)

Look for issues labeled `good first issue`. These are:

- Doc typos / clarifications
- Empty-state copy
- Aria-label additions
- Single-file refactors
- Test coverage for one service

---

## 8. Coding conventions

**Server (Node.js / ESM)**
- ESM imports only (`"type": "module"`)
- Async/await over `.then()` chains
- Logger (`winston`) — never `console.log` in production paths
- All queries via `db.prepare(...).run/get/all(...)` — no string interpolation
- All endpoints respond with `{ok: true, data: ...}` or `{ok: false, error: {code, message}}`
- All middleware composed via `app.use(...)` in `server/index.js`

**Client (React 18)**
- Function components only
- Zustand for state, no Redux
- Tailwind utility classes, no CSS modules (global.css for keyframes + variables only)
- Imports: relative within `src/`, no `~` alias
- One component per file, default export
- `cn()` for conditional classnames (it's `clsx`)

**Accessibility**
- Every icon-only button has `aria-label`
- Every form input has a `<label htmlFor>`
- `prefers-reduced-motion` respected
- Keyboard navigation works end to end

---

## 9. Design system

Read [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) **before** opening a PR that touches the UI. The 7 compliance gates are not negotiable.

If you need a new color, **add it to the palette and update the design system doc** in the same PR. Don't sneak it in.

---

## 10. Security

See [`SECURITY.md`](../SECURITY.md) for the responsible-disclosure process. **Do not** open a public issue for a security vulnerability — email the security contact instead.

If your PR touches auth, sessions, the shim, or any middleware, request a security review.

---

## 11. Release process

1. Maintainer cuts a `release/v2.x` branch off `main`.
2. CI is run end-to-end.
3. Version bump in `package.json` (root + `client/package.json`).
4. `CHANGELOG.md` updated with the release notes.
5. PR from `release/v2.x` to `main` is merged.
6. Tag `v2.x.y` is pushed.
7. Release notes are published.

---

## 12. License

By contributing, you agree that your contributions are licensed under the same [proprietary license](../LICENSE) as the rest of the project. The CYBERBLACK authors retain all rights to the codebase.

If you need a CLA (Contributor License Agreement), the maintainer will provide one.
