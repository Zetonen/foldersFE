/**
 * FR-ERR-01: the Google sign-in copy, in one place. The callback screen reads
 * from here too — it is the second half of the same flow, and the two must not
 * drift into wording the user experiences as different failures.
 */

/** FR-AUTH-12: the same wording whether the flow failed or was rejected. */
export const GOOGLE_AUTH_ERROR = 'Google sign-in failed. Please try again'

/** FR-AUTH-12: consent was declined — a choice, not a failure. */
export const GOOGLE_AUTH_CANCELLED = 'Google sign-in was cancelled'

/**
 * 503 from `GET /auth/google`: the server has no Google credentials. Retrying
 * cannot help, so the user is pointed at the way in that does work.
 */
export const GOOGLE_AUTH_UNAVAILABLE =
  'Google sign-in is unavailable right now. Use your email and password'
