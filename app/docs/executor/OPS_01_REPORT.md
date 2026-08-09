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

The full verifier cannot start because Playwright browser installation does not finish:

- `af388f2` / [31289189324](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289189324): cancelled during post-download installation.
- `9d7130e` / [31289471984](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289471984): cancelled during post-download installation.
- `4cb0761` / [31292436633](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31292436633): ran 30m16s; Chromium download completed, Playwright installation was automatically cancelled at the 30-minute job limit, and Verify was skipped.

This is a demonstrated Playwright post-download installation blocker. The two permitted
minimal repairs are exhausted. A04 remains blocked; no A05 or security-baseline task may begin.
