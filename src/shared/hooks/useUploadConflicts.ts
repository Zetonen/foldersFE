import { useRef } from 'react'
import { useAppDispatch } from './useAppDispatch'
import { useAppSelector } from './useAppSelector'
import {
  batchCancelled,
  conflictResolved,
  replaceTargetSet,
  selectUploadConflicts,
  selectUploadItems,
  uploadItemRemoved,
  uploadRenamed,
} from '@/store'
import type { ConflictResolution, FolderItem } from '@/types'

interface UseUploadConflictsArgs {
  /** The current listing, used to find what a "Replace" would overwrite. */
  items: FolderItem[]
}

/**
 * FR-UPL-10..13: answers one collision at a time, oldest first.
 *
 * "Apply to all" is remembered in a ref rather than in the store — it is a
 * decision about the batch in progress, not state anyone else reads.
 *
 * Nothing here talks to the API. A resolution only records what the transfer
 * should do, and `useUploadProcessor` carries it out — which is what keeps
 * "Replace" from deleting a file before its replacement exists.
 */
export function useUploadConflicts({ items }: UseUploadConflictsArgs) {
  const dispatch = useAppDispatch()
  const conflicts = useAppSelector(selectUploadConflicts)
  const queue = useAppSelector(selectUploadItems)

  const blanketChoice = useRef<ConflictResolution | null>(null)

  const current = conflicts[0] ?? null

  const apply = (
    uploadId: string,
    name: string,
    suggestedName: string,
    resolution: ConflictResolution
  ) => {
    if (resolution === 'skip') {
      dispatch(uploadItemRemoved(uploadId))
      return
    }

    if (resolution === 'keepBoth') {
      dispatch(uploadRenamed({ id: uploadId, name: suggestedName }))
      dispatch(conflictResolved(uploadId))
      return
    }

    // "Replace": the file that is in the way, if this screen can see it.
    const existing = items.find(
      (item) => item.type === 'FILE' && item.name === name
    )

    if (!existing) {
      /**
       * It is not in the pages loaded here, so there is no id to replace and
       * no way to name one safely. The upload goes ahead under the free name
       * instead — and the panel will show whichever name it ends up with.
       */
      dispatch(conflictResolved(uploadId))
      return
    }

    /**
     * The new file goes up first, under the free name the server offered, and
     * only then does the old one go and the name change hands. Deleting first
     * would open a window where a failed transfer leaves neither file.
     */
    dispatch(replaceTargetSet({ id: uploadId, fileId: existing.id, name }))
    dispatch(uploadRenamed({ id: uploadId, name: suggestedName }))
    dispatch(conflictResolved(uploadId))
  }

  const resolve = (resolution: ConflictResolution, applyToAll: boolean) => {
    if (!current) return

    if (applyToAll) blanketChoice.current = resolution

    apply(current.uploadId, current.name, current.suggestedName, resolution)

    // FR-UPL-11: the remaining collisions take the same answer without asking.
    if (!applyToAll) return

    for (const pending of conflicts.slice(1)) {
      apply(pending.uploadId, pending.name, pending.suggestedName, resolution)
    }
  }

  /** FR-UPL-12: cancelling drops the whole set, not just this file. */
  const cancelAll = () => {
    if (!current) return
    const batchId = queue.find((item) => item.id === current.uploadId)?.batchId
    blanketChoice.current = null
    if (batchId) dispatch(batchCancelled(batchId))
  }

  return { conflict: current, resolve, cancelAll }
}
