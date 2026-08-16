import { z } from 'zod'

/** `UserDto`. `password_hash` never leaves the backend. */
export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  createdAt: z.iso.datetime(),
})

export type User = z.infer<typeof userSchema>

/**
 * `AuthResponseDto`. FR-STATE-04: the access token is held in memory only —
 * the refresh token lives in an httpOnly `refresh_token` cookie.
 */
export const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  /** Lifetime of the access token, in seconds. */
  expiresIn: z.number().int().positive(),
  user: userSchema,
})

export type AuthResponse = z.infer<typeof authResponseSchema>
