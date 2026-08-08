# KR1688 Phase 2C Security Baseline Design

## Decision

Create Phase 2C after OPS-01 reaches a green GitHub Actions run and before Phase 3A begins. Phase 2C secures the application and its deployment contract. Phase 3A configures the real public infrastructure before any public traffic is allowed.

Phase 2C does not deploy, connect Cloudflare, create production accounts, store credentials, publish content, or begin Phase 3A.

## Threat model

The V1 risks to reduce are automated registration, comment spam, stolen administrator credentials, API overreach, accidental loss of database/media data, and bulk scraping. This is a small commercial content platform; it does not need a security operations team, SIEM, enterprise zero-trust implementation, bespoke firewall, DRM, or custom cryptography.

## Phase boundaries

| Requirement | Phase 2C application baseline | Phase 3A production gate |
|---|---|---|
| Cloudflare proxy | Deployment contract and configuration checklist | Enable proxy for the production hostname |
| HTTPS | Secure-cookie and trusted-origin contract | Full (strict), HTTP-to-HTTPS, then HSTS only after verification |
| Environment variables | Typed startup validation and secret scan | Store real values only in deployment environment settings |
| Database isolation | Role contract, least-privilege SQL and tests | Create runtime, migration, and backup accounts on production PostgreSQL |
| Password safety | Payload native auth only; never expose raw password/hash | Enforce production secret rotation process |
| Admin 2FA | Extension boundary and launch gate | Enroll every admin before public launch |
| Login limits | Account lockout, request boundary interface and tests | Cloudflare rate limits at the edge |
| Comments | Pending-first lifecycle and server-side authorization tests | Turnstile and edge limits for abusive traffic |
| API access | Collection and field access matrix, depth limits, tests | Monitor access/error signals through host and Cloudflare dashboards |
| Backups | Backup manifest, retention policy, restore-test procedure | Scheduled PostgreSQL backups, R2 media protection, successful restore drill |

## Authentication and administrator protection

The existing `users` collection remains the V1 identity collection. Payload's supported auth configuration must set `maxLoginAttempts: 5`, `lockTime: 900000`, a defined token expiry, secure cookie settings for production, and email verification enabled before public registration is opened. Password hashing remains Payload's built-in responsibility; application code must never implement a second hashing scheme, write a raw password into a custom field, or return a hash through API serialization.

The API must prove that public registration always assigns `reader`; only an authenticated administrator can assign `admin`. Administrative capabilities remain role-controlled. Phase 2C adds no fake 2FA toggle. Instead, it provides a narrowly named 2FA integration boundary and a production launch gate: public launch is blocked until the chosen identity mechanism enforces 2FA for every administrator.

## Authorization and API rules

Every collection receives an explicit read/create/update/delete matrix. Collection filters and field-level controls both apply. Local API calls used by application routes and tests must not use `overrideAccess: true` except isolated test setup that is clearly labelled and never used to prove an end-user permission.

Readers may access only their own favorites, reading progress, and account data. A reader comment is created as `pending`; the reader can update only its own pending comment body. The reader cannot set or later change author, story, chapter, parent, status, moderation reason, AI recommendation, or counters. An administrator can approve, reject, hide, or edit moderation metadata without changing the original author.

Payload configuration must set the smallest usable `maxDepth` value. REST and GraphQL permissions are both included in the permission test matrix. Any future privileged API route must declare its authorization rule and receive an automated negative test before it is enabled.

## Environment and database isolation

A single environment module validates required values at startup: database URL, Payload secret, public server URL, cron secret, preview secret, and runtime mode. It rejects placeholder production values and prevents startup if production mode has an unsafe HTTP URL or a missing secret. `.env.example` contains names and clearly inert sample values only. GitHub scanning rejects committed `.env` files and credential-shaped values.

The production PostgreSQL model has three separate credentials:

- `kr1688_migrate`: schema changes only; never used by web requests.
- `kr1688_app`: runtime owner of only the application schema; no database creation, role management, superuser, or replication privileges.
- `kr1688_backup`: read-only backup access; no DDL or writes.

Phase 2C provides reviewed SQL role scripts and tests them in disposable PostgreSQL. Production account creation happens only during Phase 3A, using real provider settings outside Git.

## Rate limiting, comments, and scraping

Application code defines a small, provider-neutral rate-limit interface and route categories: login, registration, password reset, comment creation, and anonymous public read. It must fail closed for state-changing endpoints when the limiter is unavailable, while public story reading remains available. The production adapter is not selected in Phase 2C; Phase 3A maps these categories to Cloudflare edge limits and Turnstile.

Comments use a moderation state machine: `pending -> approved | rejected | hidden`. No client may bypass it. Moderation decisions are auditable with actor, time, previous status, new status, and reason. Comment content is rendered as safe rich text/plain text only, never injected HTML.

Bulk scraping cannot be eliminated for publicly readable text. Phase 3A will use Cloudflare bot controls and edge rules to add cost and slow abusive clients. Paid/downloadable media, if introduced later, uses short-lived signed delivery; it is out of V1 and Phase 2C scope.

## Backup and recovery contract

Before launch, production needs daily PostgreSQL backups, a documented retention period, media protection in a separate R2 backup strategy, and an owner-visible backup success record. The acceptance test is a restore into an empty disposable environment, followed by a read check of users, stories, chapters, comments, and media metadata. A backup without a successful restore test is a failed launch gate.

## Acceptance gates

Phase 2C is ready for Phase 3A only when all of the following are true:

1. GitHub Actions runs the complete test/build/guardrail suite successfully on the exact head SHA.
2. Automated authorization tests cover negative cases for user role escalation, foreign favorite/progress access, foreign comment mutation, comment moderation fields, and administrator author preservation.
3. Automated auth tests prove lockout after five failed logins and prove no password/hash is returned by public account endpoints.
4. The environment validator rejects missing and placeholder production configuration.
5. The permission matrix, database-role SQL, backup manifest, Cloudflare/HTTPS checklist, and 2FA launch gate are present and consistent.
6. No real secret, external service configuration, deployment, public indexing, sitemap, RSS, JSON-LD, author system, payment, recommendation engine, or Phase 3 feature is introduced.

## Non-goals

Do not create a self-managed firewall, security team process, SIEM, enterprise zero-trust configuration, proprietary encryption, DRM, a production Cloudflare account, a production database, or an actual 2FA implementation in this phase.
