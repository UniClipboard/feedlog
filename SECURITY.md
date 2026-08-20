# Security Policy

We take security seriously. If you believe you've found a vulnerability in
FeedLog, please follow the process below rather than opening a public issue.

## Reporting a vulnerability

Email **feedlog.oss@outlook.com** with:

- A description of the issue and its potential impact
- Steps to reproduce (ideally a minimal proof of concept)
- Affected version / commit SHA
- Your name and a link (GitHub / website) if you'd like public credit

FeedLog is currently maintained by a small team, so acknowledgement is
**best-effort within 7 days**. We'll then work with you on triage, a fix,
and a coordinated disclosure timeline.

## Scope

### In scope

- Authentication and session handling (better-auth integration, OAuth flows)
- Authorization and admin-role enforcement on API routes
- Input validation on feedback/changelog submissions (XSS, SSRF, SQL/NoSQL injection)
- File upload handling and blob storage credential exposure
- Secrets leakage in logs, error messages, or build artifacts
- Supply-chain concerns in the published `ghcr.io/linkcraftstudio/feedlog` images

### Out of scope

- Vulnerabilities in dependencies that are already in the public CVE database
  with no exploitable path in FeedLog — please report those upstream
- Self-hosted misconfigurations (weak `BETTER_AUTH_SECRET`, exposed database,
  missing TLS) — these are deployment concerns, not product bugs
- Social engineering, physical attacks, and DoS via resource exhaustion
- Findings from automated scanners without a concrete exploit scenario

## Supported versions

Only the latest minor release on `main` receives security fixes. Older
versions are best-effort. Once we cut a 1.0, this policy will move to a more
formal support window.

## Safe harbor

Good-faith security research conducted under this policy is welcome. We will
not pursue legal action against researchers who:

- Report vulnerabilities privately per this policy
- Avoid privacy violations, destruction of data, and service disruption
- Give us reasonable time to respond before any public disclosure

## Credit

Reporters who follow this policy will be credited in the release notes of
the fix, unless they ask to remain anonymous.
