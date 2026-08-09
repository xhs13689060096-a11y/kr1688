# OPS-01 GitHub Actions Evidence

## A04 deliberate RED

- SHA: `1f7abd5e5aebbd9bbfd7db325a503b5bf29e868a`
- Run: https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289127215
- Conclusion: `failure` (expected)
- Command: `pnpm nonexistent-command`
- Result: `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL: Command "nonexistent-command" not found` (exit 1).

This run deliberately omitted the Playwright installation so the workflow reached the
intended missing-command assertion before any browser-installation work. It is RED
evidence only and does not represent a passing quality gate.

## A04 blocker

The full verifier did not start in three successive Actions runs because Playwright
browser installation stalled first:

- `af388f2` / [31289189324](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289189324): cancelled after the install stalled.
- `9d7130e` / [31289471984](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289471984): cancelled after increasing the job timeout from 15 to 30 minutes did not reach Verify.
- `09e31b9` / [31289573947](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289573947): cancelled after switching to the pinned Chromium-only install still did not reach Verify.

This is an infrastructure/Playwright-installation blocker. The task remains blocked;
no A05 or security-baseline task may begin.
