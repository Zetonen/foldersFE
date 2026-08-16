import { z } from 'zod'
import { roleSchema } from './Permission'
import { dataRoomRefSchema } from './DataRoom'
import { breadcrumbSchema, folderItemSchema, folderSchema } from './Folder'
import { fileSchema } from './File'

/** `CreateShareDto.resourceType` / `ShareDto.resourceType`. */
export const shareResourceTypeSchema = z.enum(['DATA_ROOM', 'FOLDER', 'FILE'])

export type ShareResourceType = z.infer<typeof shareResourceTypeSchema>

/**
 * FR-SHR-07: the two sharing modes.
 * `PUBLIC_LINK` backs "Anyone with the link", `USER` a permissioned share.
 */
export const shareKindSchema = z.enum(['USER', 'PUBLIC_LINK'])

export type ShareKind = z.infer<typeof shareKindSchema>

/** `ShareDto`. */
export const shareSchema = z.object({
  id: z.uuid(),
  resourceType: shareResourceTypeSchema,
  resourceId: z.uuid(),
  kind: shareKindSchema,
  role: roleSchema,
  granteeEmail: z.email().nullable(),
  /** Set once the invited email matches a registered account. */
  granteeUserId: z.uuid().nullable(),
  /** Present for `PUBLIC_LINK` only — this is what `/share/:token` carries. */
  token: z.string().nullable(),
  /** FUT-12: link expiry. Null means the link does not expire. */
  expiresAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
})

export type Share = z.infer<typeof shareSchema>

/** `SharedWithMeItemDto` — one root someone granted to the current user. */
export const sharedWithMeItemSchema = z.object({
  type: shareResourceTypeSchema,
  id: z.uuid(),
  name: z.string(),
  ownerName: z.string(),
  sharedAt: z.iso.datetime(),
  myRole: roleSchema,
})

export type SharedWithMeItem = z.infer<typeof sharedWithMeItemSchema>

/**
 * `ShareViewDto` — what a share token resolves to. FR-PUB-03/04: the resource
 * type decides whether the link opens a read-only explorer or a file viewer.
 */
export const shareViewSchema = z.object({
  resourceType: shareResourceTypeSchema,
  dataRoom: dataRoomRefSchema.nullable(),
  folder: folderSchema.nullable(),
  file: fileSchema.nullable(),
  /** FR-PERM-04: starts at the shared root, never above it. */
  breadcrumbs: z.array(breadcrumbSchema),
  items: z.array(folderItemSchema),
  nextCursor: z.string().nullable(),
  myRole: roleSchema,
})

export type ShareView = z.infer<typeof shareViewSchema>
