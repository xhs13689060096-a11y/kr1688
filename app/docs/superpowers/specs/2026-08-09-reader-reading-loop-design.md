# KR1688 Reader Reading Loop Design

## Decision

Build the V1 reader loop before public-launch infrastructure. A signed-in Arabic reader
must be able to discover a published story, begin or resume a chapter, save a favorite,
see reading progress, and submit a pending comment. The existing Payload collections
remain the source of truth; this phase adds reader-facing composition and narrowly scoped
server actions, not a second backend or recommendation system.

## Scope and boundaries

Included:

- A reader account area with favorite stories and reading-progress entries.
- A minimal reader login page backed by Payload's existing local-auth endpoint.
- A visible “continue reading” action derived from the reader's latest progress.
- A chapter reader action that persists progress only for the authenticated reader.
- A favorite toggle that operates only on the authenticated reader's record.
- A comment submission action that always creates a `pending` comment and explains that
  it awaits moderation.
- RTL Arabic copy, keyboard access, empty states, and tests for the public and signed-in paths.

Excluded:

- Recommendation/ranking algorithms, search, payments, author submissions or revenue sharing.
- Deployment, Cloudflare, real R2, real production database, sitemap, RSS, JSON-LD, IndexNow,
  native applications, and Phase 3A infrastructure.
- Reader-side comment editing, moderation UI for readers, notifications, social login, or email delivery.

## Architecture

The frontend remains Next.js App Router with Payload local API access. Reader-specific
operations are implemented as small server-side actions or route handlers that obtain the
current Payload user from the request. They call the existing `favorites`, `reading-progress`,
and `comments` collections with `overrideAccess: false`; collection access rules remain the
final authorization boundary.

The login page posts credentials only to Payload's same-origin `/api/users/login` endpoint,
which owns the session cookie. It never stores a token in browser storage. The account page
reads only the current user's favorites and progress. It computes one
continue-reading card from the newest incomplete progress record. Story and chapter pages
reuse existing public queries, then render account controls only when the request has a
reader identity. Anonymous visitors can read published content but are prompted to sign in
instead of receiving state-changing controls.

## Component and data flow

1. **Account shell** loads the authenticated reader. If absent, it redirects to the existing
   login route; it never accepts a user ID from the browser.
2. **Continue-reading card** queries the reader's newest progress, resolves its story and
   chapter, and links to the existing chapter URL.
3. **Favorite control** submits the story ID to the server. The server finds or creates the
   current reader's favorite, or removes only that reader's existing favorite. Duplicate and
   foreign-record errors are rendered as safe Arabic messages.
4. **Progress control** submits the current chapter identity and percentage. The server
   records progress under the authenticated user and never trusts a supplied user ID.
5. **Comment form** submits body plus the current story/chapter context. The server derives
   author identity from the request, creates `pending`, and returns the moderation notice.

## Error handling and safety

- Missing authentication returns an ordinary sign-in prompt; no backend record is created.
- Server actions validate identifiers and percentage bounds before calling Payload.
- The browser never receives raw database authorization errors, role data, passwords, hashes,
  or moderation-only fields.
- A reader cannot alter another reader's favorite, progress, or comment because identity is
  derived server-side and existing collection access policies are retained.
- The UI does not claim that a comment is public until an administrator approves it.

## Testing and acceptance

Each small task follows RED → minimal GREEN → full GitHub Actions verification. Tests must
cover anonymous denial/prompts, reader-owned favorite and progress changes, a continue-reading
link, pending comment creation, and Arabic RTL rendering markers. Existing ownership and
moderation tests remain required. The final branch HEAD must pass Node 26, PostgreSQL,
integration tests, Chrome E2E tests, build, lint, and guardrails in GitHub Actions.

## Execution decomposition

The implementation plan will use one sequential packet:

1. Minimal Payload-native reader login.
2. Reader identity and account-page shell.
3. Favorites and continue-reading UI backed by existing collection access.
4. Progress capture and safe resume behavior.
5. Pending-comment submission and reader feedback.
6. RTL/accessibility/E2E acceptance and exact CI handoff.

No step may introduce production infrastructure or expand into a recommendation, payment,
author, or deployment system.
