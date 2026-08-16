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
 * Reads `next` back. Only same-origin absolute paths are accepted, so a
 * crafted link cannot bounce the user off-site after login.
 */
export function readNextParam(search: string): string {
  const value = new URLSearchParams(search).get(QUERY_PARAMS.next)

  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return ROUTES.rooms
  }

  return value
}
