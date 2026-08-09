export function getAdmin2FALaunchState() {
  return {
    requiredBeforePublicLaunch: true as const,
    enabledInApplication: false as const,
  }
}
