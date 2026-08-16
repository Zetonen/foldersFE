/**
 * Query-string keys. FR-ROUTE-04: list display state lives in the URL so a
 * link to a screen reproduces what the sender was looking at.
 */
export const QUERY_PARAMS = {
  /** FR-ROUTE-01: path to return to after a successful sign-in. */
  next: 'next',
  /** FR-ROOMS-01: active tab of the data room list. */
  tab: 'tab',
} as const
