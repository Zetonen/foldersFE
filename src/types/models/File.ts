import { z } from 'zod'
import { roleSchema } from './Permission'

/** `FileDto`. */
export const fileSchema = z.object({
  id: z.uuid(),
  dataRoomId: z.uuid(),
  /** `null` places the file at the data room root. */
  folderId: z.uuid().nullable(),
  name: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  mimeType: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  myRole: roleSchema,
})

export type DataFile = z.infer<typeof fileSchema>

/**
 * `DownloadUrlDto`. FR-VIEW-04: the viewer reads the PDF through a short-lived
 * signed URL fetched separately from the metadata.
 */
export const downloadUrlSchema = z.object({
  url: z.url(),
  /** Seconds until the link stops working. */
  expiresIn: z.number().int().positive(),
})

export type DownloadUrl = z.infer<typeof downloadUrlSchema>

/**
 * `UploadUrlDto` — step one of the upload. The bytes then go straight to
 * `uploadUrl` in blob storage, which is where the progress events come from.
 */
export const uploadUrlSchema = z.object({
  uploadUrl: z.url(),
  /**
   * The signing key on its own. `uploadUrl` already carries it as a query
   * parameter, so the transfer does not use this — it is here for a future
   * move to the storage SDK's `uploadToSignedUrl()`.
   */
  token: z.string(),
  /** Opaque key that `POST /files/confirm` turns into a file record. */
  storageKey: z.string(),
  /** The name the server settled on, which may differ from what was asked. */
  name: z.string(),
})

export type UploadUrl = z.infer<typeof uploadUrlSchema>
