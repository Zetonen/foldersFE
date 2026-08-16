import { useState } from 'react'
import {
  useMoveFileMutation,
  useMoveFolderMutation,
  useRenameFileMutation,
  useRenameFolderMutation,
} from '@/api'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { buildUniqueName } from '@/shared/helpers/nodeName/buildUniqueName'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { showSuccessToast } from '@/shared/helpers/toasts/showSuccessToast'
import {
  isAppError,
  type ConflictResolution,
  type FolderItem,
  type NameConflict,
} from '@/types'

interface UseMoveNodeArgs {
  dataRoomId: string
  /** The folder the listing on screen is showing. */
  currentFolderId: string | null
  /** Name of the current folder, used by the Undo toast. */
  currentFolderName: string
}

/** Where a node is being moved from — a folder id and the name to show. */
export interface MoveOrigin {
  id: string | null
  name: string
}

export interface MoveRequest {
  item: FolderItem
  toFolderId: string | null
  toFolderName: string
  /**
   * Defaults to the folder on screen, which is where a node dragged out of the
   * listing comes from. A drag that spring-opened its way into other folders
   * (FR-MOV-06) states its own origin instead: the listing has moved on, the
   * node has not.
   */
  from?: MoveOrigin
}

/**
 * FR-MOV-10..12: runs a move, reports it, and offers a way back.
 *
 * A 409 becomes a pending conflict rather than a toast, so the caller can put
 * `NameConflictModal` in front of the user (FR-MOV-11).
 */
export function useMoveNode({
  dataRoomId,
  currentFolderId,
  currentFolderName,
}: UseMoveNodeArgs) {
  const [moveFolder] = useMoveFolderMutation()
  const [moveFile] = useMoveFileMutation()
  const [renameFolder] = useRenameFolderMutation()
  const [renameFile] = useRenameFileMutation()

  const [pending, setPending] = useState<MoveRequest | null>(null)

  /**
   * A function declaration rather than a `useCallback`, so the undo action can
   * call it recursively without tripping over its own initialiser.
   */
  async function moveNode(
    request: MoveRequest,
    /** Set on a retry and on an undo, both of which skip the undo toast. */
    isRetry = false
  ): Promise<void> {
    const { item, toFolderId, toFolderName } = request
    const from = request.from ?? {
      id: currentFolderId,
      name: currentFolderName,
    }

    try {
      if (item.type === 'FOLDER') {
        await moveFolder({
          id: item.id,
          dataRoomId,
          fromParentId: from.id,
          toParentId: toFolderId,
        }).unwrap()
      } else {
        await moveFile({
          id: item.id,
          dataRoomId,
          fromFolderId: from.id,
          toFolderId,
        }).unwrap()
      }

      setPending(null)

      // FR-MOV-10: the way back is the same move with the two ends swapped.
      if (!isRetry) {
        showSuccessToast(`Moved to ${toFolderName}`, {
          action: {
            label: 'Undo',
            onClick: () => {
              void moveNode(
                {
                  item,
                  toFolderId: from.id,
                  toFolderName: from.name,
                  from: { id: toFolderId, name: toFolderName },
                },
                true
              )
            },
          },
        })
      }
    } catch (error) {
      // The optimistic patch has already put the row back (FR-MOV-12).
      if (isAppError(error) && error.status === HTTP_STATUS.conflict) {
        setPending(request)
        return
      }

      setPending(null)
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }

  /**
   * FR-MOV-11. The move endpoint takes a destination and nothing else, so
   * "keep both" is expressed as a rename followed by the same move — which is
   * exactly what the user asked for, in two steps instead of one.
   *
   * "Replace" is not offered here: it would mean deleting whatever sits at the
   * destination, and the destination listing is not loaded, so the client
   * cannot identify what it would be destroying.
   */
  const resolveConflict = async (resolution: ConflictResolution) => {
    if (!pending) return

    if (resolution !== 'keepBoth') {
      setPending(null)
      return
    }

    const { item } = pending
    const freeName = buildUniqueName(item.name, [item.name])
    // The rename happens where the node still is, which is not necessarily
    // the folder on screen (FR-MOV-06).
    const origin = pending.from ?? {
      id: currentFolderId,
      name: currentFolderName,
    }

    try {
      if (item.type === 'FOLDER') {
        await renameFolder({
          id: item.id,
          name: freeName,
          dataRoomId,
          parentId: origin.id,
        }).unwrap()
      } else {
        await renameFile({
          id: item.id,
          name: freeName,
          dataRoomId,
          folderId: origin.id,
        }).unwrap()
      }

      await moveNode({ ...pending, item: { ...item, name: freeName } }, true)
    } catch (error) {
      setPending(null)
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }

  /** Shape the modal needs; the free name is proposed client-side. */
  const conflict: NameConflict | null = pending
    ? {
        name: pending.item.name,
        suggestedName: buildUniqueName(pending.item.name, [pending.item.name]),
        targetFolderName: pending.toFolderName,
      }
    : null

  return {
    moveNode,
    conflict,
    resolveConflict,
    cancelConflict: () => setPending(null),
  }
}
