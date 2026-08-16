import { z } from 'zod'

/** `RegisterDto` / `LoginDto`: email format, at most 255 characters. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255, 'Enter a valid email address')
  .pipe(z.email('Enter a valid email address'))

const PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include a letter and a number'

/**
 * `RegisterDto` caps the password at 8–72 characters. FR-AUTH-02 additionally
 * asks for one letter and one digit, which the server accepts as a subset.
 */
export const newPasswordSchema = z
  .string()
  .min(8, PASSWORD_MESSAGE)
  .max(72, PASSWORD_MESSAGE)
  .regex(/[A-Za-z]/, PASSWORD_MESSAGE)
  .regex(/\d/, PASSWORD_MESSAGE)

export const loginSchema = z.object({
  email: emailSchema,
  /** `LoginDto`: 1–72, complexity is not re-checked on sign-in (FR-AUTH-08). */
  password: z.string().min(1, 'Enter your password').max(72),
})

export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    email: emailSchema,
    /** `RegisterDto` requires a display name of 1–120 characters. */
    name: z
      .string()
      .trim()
      .min(1, 'Enter your name')
      .max(120, 'Name is too long'),
    password: newPasswordSchema,
    /** Client-side only — the server never sees this field. */
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterValues = z.infer<typeof registerSchema>
