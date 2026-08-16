const STORAGE_KEY = 'oauth_state'

/**
 * The `state` handed out by `GET /auth/google`, parked across the round trip
 * through Google's consent screen.
 *
 * `sessionStorage` rather than the store: the redirect is a full navigation,
 * so nothing in memory survives it, and the value must not outlive the tab.
 *
 * The backend signs `state` and verifies it, so this copy is not what makes
 * the flow safe. What it adds is the check on *this* side: a callback carrying
 * a `state` that this tab never asked for is an authorisation code someone
 * else obtained, and redeeming it would sign the visitor into that person's
 * account. Storage failing (private mode, disabled) must not block sign-in, so
 * a missing value is not treated as a mismatch.
 */
export function rememberOAuthState(state: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, state)
  } catch {
    // Nothing to do — the backend still verifies its own signature.
  }
}

/** Reads and clears the stored value; it is good for exactly one callback. */
export function takeOAuthState(): string | null {
  try {
    const state = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return state
  } catch {
    return null
  }
}

/**
 * True only for a callback this tab can prove it did not start. An absent
 * stored value is inconclusive, not a failure.
 */
export function isForeignOAuthState(
  returned: string | null,
  stored: string | null
): boolean {
  return stored !== null && returned !== stored
}
