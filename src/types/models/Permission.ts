import { z } from 'zod'

/**
 * FR-PERM-02: the backend now ships the caller's role alongside every folder,
 * file and listing (`myRole`), so the client never derives rights on its own —
 * it only reflects what it was told.
 */
export const roleSchema = z.enum(['OWNER', 'VIEWER'])

export type Role = z.infer<typeof roleSchema>

/** FR-PERM-03: gates whether an action is rendered at all, not disabled. */
export const isOwnerRole = (role: Role | undefined): boolean => role === 'OWNER'
