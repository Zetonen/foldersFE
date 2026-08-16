import { sanitizeNextPath } from './nextParam'

const STATE_KEY = 'oauth_state'
const NEXT_KEY = 'oauth_next'

/** What this tab parked before handing the browser to Google. */
export interface OAuthHandoff {
  state: string | null
  /** FR-ROUTE-01: where the user was originally heading, if anywhere. */
  next: string | null
}

/**
 * The `state` handed out by `GET /auth/google`, plus the deep link the user was
 * heading for, parked across the round trip through Google's consent screen.
 *
 * `sessionStorage` rather than the store: the redirect is a full navigation, so
 * nothing in memory survives it, and neither value must outlive the tab. It is
 * also the only place `next` can travel — the redirect URI is registered with
 * Google and comes back unchanged, and `state` is signed by the backend, so
 * there is nothing of ours to put inside either.
 *
 * The backend signs `state` and verifies it, so this copy is not what makes the
 * flow safe. What it adds is the check on *this* side: a callback carrying a
 * `state` that this tab never asked for is an authorisation code someone else
 * obtained, and redeeming it would sign the visitor into that person's account.
 * Storage failing (private mode, disabled) must not block sign-in, so a missing
 * value is not treated as a mismatch.
 */
export function rememberOAuthHandoff(state: string, next: string | null): void {
  try {
    sessionStorage.setItem(STATE_KEY, state)

    // Absent is the normal case — most sign-ins start from `/login` directly.
    if (next) {
      sessionStorage.setItem(NEXT_KEY, next)
    } else {
      sessionStorage.removeItem(NEXT_KEY)
    }
  } catch {
    // Nothing to do — the backend still verifies its own signature.
  }
}

/** Reads and clears both; they are good for exactly one callback. */
export function takeOAuthHandoff(): OAuthHandoff {
  try {
    const state = sessionStorage.getItem(STATE_KEY)
    const next = sessionStorage.getItem(NEXT_KEY)

    sessionStorage.removeItem(STATE_KEY)
    sessionStorage.removeItem(NEXT_KEY)

    // Re-checked on the way out: sessionStorage is writable by any script that
    // reaches this origin, so what comes back is treated as untrusted input.
    return { state, next: sanitizeNextPath(next) }
  } catch {
    return { state: null, next: null }
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
