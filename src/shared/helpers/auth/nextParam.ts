import { QUERY_PARAMS } from '@/shared/constants/QUERY_PARAMS'
import { ROUTES } from '@/shared/constants/ROUTES'

/**
 * FR-ROUTE-01 / FR-AUTH-13: the path the user was heading for is parked in the
 * `next` query param, then replayed after a successful sign-in.
 */
export function withNextParam(loginPath: string, currentPath: string): string {
  const params = new URLSearchParams({ [QUERY_PARAMS.next]: currentPath })
  return `${loginPath}?${params.toString()}`
}

/**
 * Accepts only same-origin absolute paths, so a crafted link cannot bounce the
 * user off-site after login. `//evil.com` is a protocol-relative URL, not a
 * path, which is why a second leading slash is rejected too.
 *
 * Returns `null` rather than a default, so callers that need to know whether a
 * destination was actually asked for can tell.
 */
export function sanitizeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null

  return value
}

/** Reads `next` back, falling back to the post-login home. */
export function readNextParam(search: string): string {
  const value = new URLSearchParams(search).get(QUERY_PARAMS.next)

  return sanitizeNextPath(value) ?? ROUTES.rooms
}
