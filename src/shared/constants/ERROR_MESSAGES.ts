/**
 * FR-ERR-01: every error class has exactly one wording across the whole app.
 * FR-ERR-04: no field names, stack traces or raw payloads leak into these.
 */
export const ERROR_MESSAGES = {
  network: 'Connection lost. Check your internet and try again.',
  unauthorized: 'Your session expired. Please log in again.',
  forbidden: "You don't have permission to do this.",
  notFound: 'This item no longer exists.',
  conflict: 'An item with this name already exists here.',
  payloadTooLarge: 'File is too large.',
  unsupportedType: 'This file type is not supported.',
  tooManyRequests: 'Too many requests. Try again later.',
  server: 'Something went wrong. Try again.',
  /** Fallback when the failure matches nothing above. */
  default: 'Something went wrong. Try again.',
  /** A response that fails its Zod schema is treated as a server error. */
  invalidResponse: 'Something went wrong. Try again.',
  /** Aborted requests are silent — never surfaced as a toast. */
  abort: 'canceled',
} as const

/** HTTP statuses the app reacts to by name rather than by number. */
export const HTTP_STATUS = {
  /** Validation lives here — the backend does not use 422. */
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  payloadTooLarge: 413,
  unsupportedMediaType: 415,
  tooManyRequests: 429,
  /** Google sign-in with no credentials configured on the server. */
  serviceUnavailable: 503,
} as const

/** FR-UPL-20: these outcomes are permanent — retrying them cannot help. */
export const NON_RETRYABLE_UPLOAD_STATUSES: readonly number[] = [
  HTTP_STATUS.badRequest,
  HTTP_STATUS.forbidden,
  HTTP_STATUS.payloadTooLarge,
  HTTP_STATUS.unsupportedMediaType,
]
