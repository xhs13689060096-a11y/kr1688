export type RateLimitCategory =
  | 'login'
  | 'registration'
  | 'password-reset'
  | 'comment-create'
  | 'public-read'

export type RateLimitResult = {
  allowed: boolean
  category: RateLimitCategory
  reason?: 'denied' | 'unavailable'
}

export function assertStateChangeAllowed(result: RateLimitResult): void {
  if (result.category !== 'public-read' && !result.allowed) {
    throw new Error(`Rate limit denied ${result.category}: ${result.reason ?? 'denied'}`)
  }
}
