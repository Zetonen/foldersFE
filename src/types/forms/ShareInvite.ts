import { z } from 'zod'
import { emailSchema } from './Credentials'
import { roleSchema } from '@/types/models/Permission'

/**
 * FR-SHR-02: one chip per recipient, at least one required.
 *
 * The `shares` table has no message column, so the optional note from the
 * requirements is left out until the backend can carry it — an input that
 * silently discards what the user typed would be worse than no input.
 */
export const shareInviteSchema = z.object({
  emails: z
    .array(emailSchema)
    .min(1, 'Enter a valid email address')
    /** Duplicates are silently collapsed rather than rejected. */
    .transform((emails) => [...new Set(emails)]),
  role: roleSchema.extract(['VIEWER']),
})

export type ShareInviteValues = z.infer<typeof shareInviteSchema>
