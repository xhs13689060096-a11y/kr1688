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

## A04 retry note

The full verifier has not yet reached a conclusion because prior runs were cancelled
during Playwright browser installation:

- `af388f2` / [31289189324](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289189324): cancelled during post-download installation.
- `9d7130e` / [31289471984](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289471984): cancelled during post-download installation.
- `09e31b9` / [31289573947](https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31289573947): Chromium download reached 100%, then the run was manually cancelled after 3 minutes 33 seconds.

No installation failure has been demonstrated. A04 remains in progress and requires
one uncancelled quality-gate run; no A05 or security-baseline task may begin yet.
