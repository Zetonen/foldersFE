import { z } from 'zod'

/**
 * The single error shape crossing the `src/api` boundary (FR-STATE-06).
 * `status` is kept so callers can branch on 404/409 without re-parsing.
 */
export interface AppError {
  /** FR-ERR-01: the app's own wording for this class of failure. */
  message: string
  status?: number
  /**
   * What the server itself said, kept raw. FR-ERR-04: this is *not* for
   * display by default — `message` is. A screen may reach for it only where
   * the server's text carries information the status code cannot, as with the
   * 401 that says an account signs in through Google.
   */
  serverMessage?: string
  /**
   * FR-ERR-01 (400): per-field messages. The backend has no `fieldErrors` of
   * its own — these are derived from its validation strings, see
   * `parseFieldErrors`.
   */
  fieldErrors?: Record<string, string>
}

/**
 * What the backend actually sends on a failure — the standard NestJS shape,
 * always these three fields.
 *
 * `message` is a plain string for most errors and an array of `class-validator`
 * strings for a failed DTO validation, which arrives as **400**, not 422.
 */
export const apiErrorPayloadSchema = z.object({
  statusCode: z.number().int().optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  error: z.string().optional(),
})

export type ApiErrorPayload = z.infer<typeof apiErrorPayloadSchema>
