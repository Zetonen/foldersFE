import { useEffect, useRef } from 'react'
import {
  useConfirmUploadMutation,
  useCreateUploadUrlMutation,
  useDeleteFileMutation,
  useRenameFileMutation,
  uploadToStorage,
} from '@/api'
import { UPLOAD_RETRY } from '@/shared/constants/UPLOAD'
import { NON_RETRYABLE_UPLOAD_STATUSES } from '@/shared/constants/ERROR_MESSAGES'
import {
  forgetFile,
  getFile,
  retainOnly,
} from '@/shared/helpers/upload/fileRegistry'
import { useAppDispatch } from './useAppDispatch'
import { useAppSelector } from './useAppSelector'
import { useOnlineStatus } from './useOnlineStatus'
import {
  conflictsDetected,
  selectUploadConflicts,
  selectUploadItems,
  uploadProgressed,
  uploadRenamed,
  uploadRetried,
  uploadStatusChanged,
} from '@/store'
import { isAppError } from '@/types'

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Drives the upload queue. Mounted once, in the app shell — FR-UPL-14 requires
 * transfers to survive navigation between folders and between screens.
 *
 * One file at a time: the panel shows a per-file bar (FR-UPL-17), and serial
 * transfers make that number mean something.
 */
export function useUploadProcessor(): void {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectUploadItems)
  const conflicts = useAppSelector(selectUploadConflicts)
  const online = useOnlineStatus()

  const [createUploadUrl] = useCreateUploadUrlMutation()
  const [confirmUpload] = useConfirmUploadMutation()
  const [deleteFile] = useDeleteFileMutation()
  const [renameFile] = useRenameFileMutation()

  // Guards against a second run starting while one is still in flight.
  const busyRef = useRef(false)
  /**
   * FR-UPL-10: an upload asks about a collision once. If the name it settled
   * on is taken as well, it takes whatever the server gives rather than
   * putting the same question again.
   */
  const askedRef = useRef(new Set<string>())

  // FR-UPL-10: an unanswered conflict holds its own file back, not the queue.
  const blocked = new Set(conflicts.map((entry) => entry.uploadId))
  const next = items.find(
    (item) => item.status === 'waiting' && !blocked.has(item.id)
  )

  const id = next?.id
  const name = next?.name
  const dataRoomId = next?.dataRoomId
  const folderId = next?.folderId ?? null
  const folderName = next?.folderName ?? ''
  const attempt = next?.attempt ?? 0
  const replaceFileId = next?.replace?.fileId ?? null
  const replaceName = next?.replace?.name ?? null

  /**
   * Blobs outlive the store entry that points at them, so an upload that left
   * the queue — skipped, cancelled, or cleared with the panel — would keep its
   * file alive for the lifetime of the tab. A failed upload is still in the
   * queue and keeps its blob, which is what makes FR-UPL-21's retry possible.
   */
  useEffect(() => {
    retainOnly(items.map((item) => item.id))
  }, [items])

  useEffect(() => {
    // FR-EXP-26: nothing moves while the connection is down.
    if (!id || !name || !dataRoomId || busyRef.current || !online) return

    const file = getFile(id)
    if (!file) {
      dispatch(
        uploadStatusChanged({ id, status: 'failed', error: 'File unavailable' })
      )
      return
    }

    busyRef.current = true

    const run = async () => {
      try {
        // Step 1 — reserve a slot. A 413/415 stops here, before any bytes move.
        const reservation = await createUploadUrl({
          dataRoomId,
          folderId,
          fileName: name,
          sizeBytes: file.size,
          mimeType: file.type,
        }).unwrap()

        /**
         * FR-UPL-09/10: the server does not refuse a name that is taken, it
         * hands back a free one — so a name that came back changed is the
         * authoritative sign of a collision, and the only one that sees the
         * whole folder rather than the pages this client happens to have.
         *
         * Reserving creates nothing: no record, no object, just a signed URL.
         * Dropping it costs nothing, which is what makes it safe to ask the
         * user before a single byte has moved.
         */
        if (
          reservation.name !== name &&
          !replaceFileId &&
          !askedRef.current.has(id)
        ) {
          askedRef.current.add(id)
          dispatch(
            conflictsDetected([
              {
                uploadId: id,
                name,
                suggestedName: reservation.name,
                targetFolderName: folderName,
              },
            ])
          )
          return
        }

        // Step 2 — the only part the user sees progress for (FR-UPL-19).
        await uploadToStorage({
          uploadUrl: reservation.uploadUrl,
          file,
          onProgress: (progress, bytesSent) =>
            dispatch(uploadProgressed({ id, progress, bytesSent })),
        })

        // Step 3 — the server turns the object into a file record.
        dispatch(uploadStatusChanged({ id, status: 'processing' }))

        const created = await confirmUpload({
          storageKey: reservation.storageKey,
          dataRoomId,
          folderId,
          name: reservation.name,
          sizeBytes: file.size,
          mimeType: file.type,
        }).unwrap()

        /**
         * FR-UPL-10 "Replace", finished in the only order that cannot lose a
         * file: the new one is stored, then the old one goes, then the name
         * changes hands. Breaking off part-way leaves the upload under the
         * server's name — untidy, but nothing is destroyed that was not
         * meant to be.
         */
        let finalName = created.name

        if (replaceFileId && replaceName) {
          try {
            await deleteFile({
              id: replaceFileId,
              dataRoomId,
              folderId,
            }).unwrap()

            const renamed = await renameFile({
              id: created.id,
              name: replaceName,
              dataRoomId,
              folderId,
            }).unwrap()

            finalName = renamed.name
          } catch {
            // The file is up. It simply keeps the name the server gave it.
          }
        }

        forgetFile(id)
        // FR-UPL-18: the panel names the file the server actually stored,
        // which is not always the one that was asked for.
        if (finalName !== name) dispatch(uploadRenamed({ id, name: finalName }))
        dispatch(
          uploadStatusChanged({ id, status: 'done', fileId: created.id })
        )
      } catch (error) {
        const status = isAppError(error) ? error.status : undefined
        const message = isAppError(error) ? error.message : undefined

        /**
         * FR-UPL-20: transport failures are retried twice with a growing
         * delay. A refusal — wrong type, too large, not allowed — is final,
         * because repeating it would produce the same answer.
         */
        const permanent =
          status !== undefined && NON_RETRYABLE_UPLOAD_STATUSES.includes(status)

        if (!permanent && attempt < UPLOAD_RETRY.maxAttempts) {
          await wait(
            UPLOAD_RETRY.baseDelayMs * UPLOAD_RETRY.backoffFactor ** attempt
          )
          dispatch(uploadRetried(id))
          return
        }

        dispatch(uploadStatusChanged({ id, status: 'failed', error: message }))
      }
    }

    void run().finally(() => {
      busyRef.current = false
    })
  }, [
    id,
    name,
    dataRoomId,
    folderId,
    folderName,
    attempt,
    replaceFileId,
    replaceName,
    online,
    dispatch,
    createUploadUrl,
    confirmUpload,
    deleteFile,
    renameFile,
  ])
}
