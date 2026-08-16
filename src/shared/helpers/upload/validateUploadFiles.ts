import { UPLOAD_LIMITS } from '@/shared/constants/UPLOAD'
import { describeAcceptedFormats } from './describeAcceptedFormats'

export interface RejectedFile {
  name: string
  reason: string
}

export interface ValidationResult {
  accepted: File[]
  /** FR-UPL-07: refused outright, reported as one toast. */
  rejected: RejectedFile[]
  /** FR-UPL-07: queued anyway, but already marked as failed. */
  failed: RejectedFile[]
  /** FR-UPL-07: dropped because the batch was over the per-drop limit. */
  overflowCount: number
}

/**
 * FR-UPL-07: the client-side gate. It does not replace the server's checks
 * (FR-UPL-08) — it just spares the user a round trip for the obvious cases.
 *
 * A wrong type never enters the queue; a file that is too large or empty does,
 * carrying its error, so the user can see which one was refused and why.
 */
export function validateUploadFiles(files: File[]): ValidationResult {
  const accepted: File[] = []
  const rejected: RejectedFile[] = []
  const failed: RejectedFile[] = []

  const acceptedTypes: readonly string[] = UPLOAD_LIMITS.acceptedMimeTypes
  const withinBatch = files.slice(0, UPLOAD_LIMITS.maxFilesPerBatch)
  const overflowCount = files.length - withinBatch.length

  for (const file of withinBatch) {
    if (!acceptedTypes.includes(file.type)) {
      rejected.push({
        name: file.name,
        reason: `Only ${describeAcceptedFormats()} files are supported`,
      })
      continue
    }

    if (file.size < UPLOAD_LIMITS.minFileSize) {
      failed.push({ name: file.name, reason: 'This file is empty' })
      continue
    }

    if (file.size > UPLOAD_LIMITS.maxFileSize) {
      failed.push({ name: file.name, reason: 'File is too large.' })
      continue
    }

    accepted.push(file)
  }

  return { accepted, rejected, failed, overflowCount }
}
