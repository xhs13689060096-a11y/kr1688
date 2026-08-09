# Phase 3A launch security gate

This document is a launch gate, not an implementation record. Phase 2C does not
enable Cloudflare, HTTPS, Turnstile, an edge limiter, bot controls, or administrator
two-factor authentication.

Before a public Phase 3A launch, the operator must provide evidence that:

- Cloudflare proxying is enabled for the production hostname and DNS is correct.
- HTTPS is configured as Full (strict), including a valid origin certificate.
- Edge rate limits cover login, registration, password reset, comment creation,
  and public reads, with state-changing categories failing closed on provider failure.
- Turnstile and bot controls protect the applicable public state-changing flows.
- Every administrator has enrolled in the selected administrator 2FA solution.
- The production configuration, access review, rate-limit policy, and 2FA enrollment
  have been tested and retained as launch evidence.

No public launch may proceed while any item above is incomplete.
