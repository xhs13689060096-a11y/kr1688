# Content Access Boundary Repair Design

## Purpose

Close the Phase 2D final-review finding that authenticated readers can manage story content
through generic Payload APIs and can read unpublished content. KR1688 has no external author
workflow: only administrators manage stories and chapters, while readers consume published
content.

## Decision

Use collection-level Payload access control as the single enforcement boundary.

- `stories`: only administrators may create, update, or delete. Administrators may read all
  stories; everyone else may read only `contentStatus: published`.
- `chapters`: only administrators may create, update, or delete. Administrators may read all
  chapters; everyone else may read a chapter only when its own `status` is `published` and its
  related `story.contentStatus` is `published`.

The relationship constraint uses Payload's supported nested-property query syntax. This secures
the generic REST, GraphQL, Admin, and Local API operations that respect access control without
adding a parallel custom endpoint or duplicating publication state.

## Alternatives considered

1. Rely on the existing public page queries. Rejected: generic Payload APIs bypass page-level
   query conditions.
2. Add a duplicated `storyPublished` flag to chapters. Rejected: it can drift from the story and
   introduces unnecessary synchronization behavior.
3. Enforce only `chapter.status: published`. Rejected: a published chapter belonging to a draft
   story would still be exposed.

## Error handling and compatibility

Readers receive standard Payload authorization denial for writes and no matching documents for
unpublished reads. Admin behavior remains unchanged. Existing reader helpers already use
`overrideAccess: false`; they continue to resolve only public content and therefore stay aligned
with this boundary.

## Verification

Integration tests will create both reader and administrator fixtures plus published and draft
story/chapter combinations. Before the repair, reader writes and unpublished reads must succeed,
forming the remote GitHub Actions RED evidence. After the repair, the same test proves reader
write denial, non-admin published-only visibility, and retained administrator management.

## Scope

This does not add editorial workflow, author submissions, moderation policy, deployment,
external services, payments, search, SEO, Cloudflare, or Phase 3A.
