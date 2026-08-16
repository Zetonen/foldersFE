import { useAppDispatch } from './useAppDispatch'
import { batchQueued, conflictsDetected } from '@/store'
import { buildUniqueName } from '@/shared/helpers/nodeName/buildUniqueName'
import { registerFile } from '@/shared/helpers/upload/fileRegistry'
import { validateUploadFiles } from '@/shared/helpers/upload/validateUploadFiles'
import { describeRejectedUploads } from '@/shared/helpers/upload/describeRejectedUploads'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { UPLOAD_LIMITS } from '@/shared/constants/UPLOAD'
import type { UploadConflict, UploadItem } from '@/types'

export interface UploadTarget {
  dataRoomId: string
  folderId: string | null
  folderName: string
  /** FR-UPL-09: names already in the target folder, for the pre-flight check. */
  existingNames: string[]
}

/**
 * FR-UPL-01/07/09: turns a set of dropped or picked files into queue entries.
 *
 * The conflict check happens here, before a byte moves, so the user answers
 * the question up front rather than after waiting for an upload to fail.
 */
export function useUploadEnqueue() {
  const dispatch = useAppDispatch()

  return (files: File[], target: UploadTarget) => {
    const { accepted, rejected, failed, overflowCount } =
      validateUploadFiles(files)

    // FR-UPL-07: one toast, stating the rule that turned the files away.
    if (rejected.length > 0) {
      showErrorToast(describeRejectedUploads(rejected))
    }

    if (overflowCount > 0) {
      showErrorToast(
        `Only the first ${UPLOAD_LIMITS.maxFilesPerBatch} files were added to the queue`
      )
    }

    const batchId = crypto.randomUUID()
    const items: UploadItem[] = []
    const conflicts: UploadConflict[] = []

    // FR-UPL-13: names repeated inside one batch collide just like existing ones.
    const takenNames = [...target.existingNames]

    const toItem = (
      name: string,
      size: number,
      error: string | null
    ): UploadItem => ({
      id: crypto.randomUUID(),
      batchId,
      dataRoomId: target.dataRoomId,
      folderId: target.folderId,
      folderName: target.folderName,
      name,
      size,
      status: error ? 'failed' : 'waiting',
      progress: 0,
      bytesSent: 0,
      fileId: null,
      error,
      attempt: 0,
      replace: null,
    })

    for (const entry of failed) {
      items.push(toItem(entry.name, 0, entry.reason))
    }

    for (const file of accepted) {
      const item = toItem(file.name, file.size, null)
      registerFile(item.id, file)
      items.push(item)

      const clash = takenNames.some(
        (existing) => existing.toLowerCase() === file.name.toLowerCase()
      )

      if (clash) {
        conflicts.push({
          uploadId: item.id,
          name: file.name,
          suggestedName: buildUniqueName(file.name, takenNames),
          targetFolderName: target.folderName,
        })
      }

      takenNames.push(file.name)
    }

    if (items.length === 0) return

    dispatch(batchQueued(items))
    if (conflicts.length > 0) dispatch(conflictsDetected(conflicts))
  }
}
