# Security policy

## Supported versions

| Version | Supported |
|---|---|
| v2.0.x | ✅ active |
| v1.x   | ❌ end of life — please upgrade |
| < 1.0  | ❌ not supported |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email **`security@cyberblack.local`** (replace with the operational alias for your deployment) with:

1. A description of the vulnerability
2. Steps to reproduce (or a proof-of-concept)
3. The impact (what can an attacker do?)
4. Any known mitigations

We acknowledge within **2 business days** and aim to ship a fix within **30 days** for critical issues, **90 days** for everything else. We will coordinate disclosure timing with you.

## Scope

In scope:
- Authentication and authorization bypass
- JWT / TOTP / session handling flaws
- SQL injection or other injection in our routes
- SSRF in OSINT lookups
- XSS in the React client
- Information disclosure in `/api/*` responses
- Dependency vulnerabilities with a known exploit

Out of scope:
- The `node_modules/` tree (open it to the upstream maintainers)
- Self-XSS (paste-injected payloads)
- Theoretical attacks without a concrete proof of concept
- Social engineering

## Recognition

We do not run a paid bug bounty program at this time. Researchers who report valid vulnerabilities are credited in the release notes (unless they prefer to remain anonymous) and acknowledged on the security page of the docs site when it lands.

## Safe harbor

We will not pursue legal action against researchers who:
- Make a good-faith effort to avoid privacy violations and data destruction
- Only interact with accounts they own or have explicit permission to test
- Stop testing immediately if they encounter user data
- Report the vulnerability to us before disclosing it publicly
