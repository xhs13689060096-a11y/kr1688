# C02 Raw Comment Patch Rejection Design

## Problem

Payload applies field-access handling during an update by retaining the stored value for a
reader-supplied protected relation. That prevents a persisted mutation, but the C02 contract
requires an explicit rejection for attempted changes to `author`, `story`, `chapter`, or
`parent`.

## Decision

Use the Comments collection `beforeOperation` hook for `update` operations. The hook receives
the original `args.data` before Payload merges it with the stored document. For a non-admin
reader, it calls `assertReaderCommentPatch` against that raw object and throws on any protected
field. It returns the unchanged operation arguments for all allowed updates and all administrators.

## Boundaries

- Create still sets the comment author from `req.user` and sets reader comments to `pending`.
- Field access remains the second authorization boundary; the hook adds explicit rejection rather
  than replacing access control.
- Administrator approval preserves authorship and writes the existing structured moderation log.
- No provider, deployment, database role, or Phase 3A change is included.

## Verification

The existing four C02 reader relation-mutation tests must reject, while reader body updates,
administrator moderation, and the complete GitHub Actions quality gate remain green.
