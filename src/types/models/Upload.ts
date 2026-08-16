import { z } from 'zod'
import { CONFLICT_RESOLUTIONS } from '@/shared/constants/UPLOAD'

/** FR-UPL-18: lifecycle of one queue item. Client-side state only. */
export const uploadStatusSchema = z.enum([
  'waiting',
  'uploading',
  'processing',
  'done',
  'failed',
])

export type UploadStatus = z.infer<typeof uploadStatusSchema>

/** FR-UPL-10 / FR-MOV-11: one shared vocabulary for both conflict flows. */
export const conflictResolutionSchema = z.enum(CONFLICT_RESOLUTIONS)

export type ConflictResolution = z.infer<typeof conflictResolutionSchema>

/**
 * A row of the upload panel. The `File` itself is kept outside the store
 * (it is not serialisable) and looked up by `id` when the transfer starts.
 */
export interface UploadItem {
  id: string
  batchId: string
  dataRoomId: string
  folderId: string | null
  folderName: string
  name: string
  size: number
  status: UploadStatus
  /** 0–100, driven by axios `onUploadProgress` (FR-UPL-19). */
  progress: number
  bytesSent: number
  /** Set once the upload succeeds, so the row can link to the file. */
  fileId: string | null
  /** FR-UPL-18: shown next to the error marker. */
  error: string | null
  /** FR-UPL-20: automatic transport retries already spent. */
  attempt: number
  /**
   * FR-UPL-10 "Replace": the file this upload takes the place of, and the
   * name it should claim once that file is gone. The replacement is finished
   * after the transfer, never before — see `useUploadProcessor`.
   */
  replace: { fileId: string; name: string } | null
}

/**
 * FR-UPL-10 / FR-MOV-11: a collision awaiting the user's decision. Shared by
 * the upload queue and the move flow, which offer the same three choices.
 */
export interface NameConflict {
  name: string
  /** The first free "name (n)" that "Keep both" would use. */
  suggestedName: string
  targetFolderName: string
}

/** A conflict raised by one queued upload. */
export interface UploadConflict extends NameConflict {
  uploadId: string
}
