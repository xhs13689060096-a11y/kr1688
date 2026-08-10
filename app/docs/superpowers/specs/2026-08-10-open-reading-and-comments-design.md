# KR1688 Open Reading and Comments Design

## Decision

KR1688 is a freely accessible Chinese-story website. Published stories and chapters
are readable without an account. A reader signs in only to leave a comment, save a
favorite, or retain reading progress. A signed-in reader's comment is visible
immediately after submission; it does not wait for editorial approval.

There are no external authors, author submissions, revenue sharing, religious
filters, or jurisdiction-specific content rules in this product. The existing
Arabic-native RTL presentation remains a reader-language decision, not a content
restriction.

## Scope

Included:

- Simplify internal story publishing to the two meaningful states: `draft` and
  `published`.
- Keep all published reading routes public and preserve the current reader login
  requirement for state-changing actions.
- Change reader-created comments from pending moderation to immediate public
  visibility.
- Retain only a small operator safety valve: an administrator can hide or delete a
  comment after it appears. No approval queue, AI recommendation, moderation reason,
  or reader-facing review promise is part of the experience.
- Update integration and browser coverage so anonymous reading, authenticated
  immediate commenting, and hidden-comment exclusion are proven in GitHub Actions.

Excluded:

- Anonymous posting, CAPTCHA, third-party moderation, email verification delivery,
  social login, author workflows, payments, search, recommendation, deployment,
  Cloudflare/R2, production credentials, SEO work, native apps, and Phase 3A.

## Product flow

1. The operator creates or edits a story and its chapters in Payload admin. `draft`
   keeps it private; choosing `published` makes it public. There is no review,
   rights, risk, or editorial-status gate.
2. Anyone can open a published story and chapter. Draft stories and chapters remain
   unavailable through public frontend routes and reader state APIs.
3. A signed-in reader submits a valid comment for a published chapter. The server
   derives the author, chapter, and story from the request and stores the comment as
   `published` immediately.
4. The same response confirms publication in Arabic. Refreshing the public chapter
   displays the new comment.
5. If the operator later hides or deletes a comment, it disappears from public
   listings. This is reactive cleanup, never a pre-publication gate.

## Architecture

The existing Payload collections remain the single data source. `Stories` reduces
its operator-facing lifecycle to `contentStatus: draft | published`; legacy
editorial, rights, and risk metadata is removed from the configuration rather than
reinterpreted as a hidden approval process. `Chapters` already has the required
draft/published distinction and continues to depend on its parent story being
published for public frontend access.

`Comments` keeps request-derived authorship and its collection access boundary.
The reader comment helper becomes an immediate-publication helper: it may create
only on a published chapter belonging to a published story, and creates an exposed
comment state. The public comment query returns exposed comments only; any retained
hidden state is unavailable to readers. Existing reader ownership controls continue
to prohibit authors, stories, chapters, parent relationships, and status changes
from browser input.

## Comment lifecycle

| State | Reader can see | Created by | Purpose |
| --- | --- | --- | --- |
| `published` | Yes | Server helper for a signed-in reader | Normal immediate comment |
| `hidden` | No | Administrator only | Reactive removal from public view |

The historical `pending`, `approved`, and `rejected` states are not part of new
behavior. The implementation will first determine whether existing test data and
database schema require them to remain as legacy values; if so, legacy comments do
not become visible accidentally. New comments always use `published` and public
queries never rely on a pre-approval rule.

## Error handling and safety

- Reading remains public only for stories and chapters explicitly published.
- Commenting still requires a valid reader session, which prevents unauthenticated
  posting without adding a content-review workflow.
- Server code validates body length and published story/chapter ownership, then
  derives all identities from the authenticated request.
- The user interface returns concise Arabic success or safe generic errors; it does
  not expose collection internals.
- Hiding/deleting is the only operator intervention. It adds no legal, religious,
  or editorial screening rule.

## Verification

Each implementation task follows RED → smallest GREEN repair → GitHub Actions for
the exact commit SHA. Tests must prove: public published reading; anonymous posting
denial; an authenticated reader's comment is immediately returned and visible on a
public refresh; a hidden comment is absent; drafts cannot be read or commented on;
and foreign users cannot alter protected comment context. The final branch HEAD
must pass the existing Node 26 + PostgreSQL quality workflow, including integration
tests, Chrome E2E, build, lint, and guardrails.

## Stop conditions

- Stop after two minimal repairs fail for the same root cause and record the CI
  evidence.
- Stop after final exact-SHA CI succeeds for product acceptance; do not start
  deployment, Phase 3A, or merge `main`.
