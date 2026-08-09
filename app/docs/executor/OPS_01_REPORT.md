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
