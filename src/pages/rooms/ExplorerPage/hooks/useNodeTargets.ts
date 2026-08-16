import { useState } from 'react'
import type { ShareTarget } from '@/widgets/ShareModal'
import type { FolderItem, NodeRef } from '@/types'

/**
 * A node together with the listing its row belongs to.
 *
 * Rename and delete can act on a list row or on the folder currently open
 * (FR-EXP-06), and those live in different listings — so the parent whose cache
 * must be patched travels with the target rather than being assumed to be the
 * folder on screen.
 */
export interface NodeTarget {
  item: NodeRef
  parentId: string | null
}

/** What each dialog is currently aimed at, and how it is dismissed. */
export interface ExplorerDialogState {
  createFolderOpen: boolean
  setCreateFolderOpen: (open: boolean) => void
  moveTarget: FolderItem | null
  closeMove: () => void
  renameTarget: NodeTarget | null
  closeRename: () => void
  deleteTarget: NodeTarget | null
  closeDelete: () => void
  shareTarget: ShareTarget | null
  closeShare: () => void
}

interface UseNodeTargetsArgs {
  /** FR-PERM-03: a viewer gets none of the mutating affordances. */
  isOwner: boolean
  roomId: string
  roomName: string | undefined
  currentFolderId: string | null
  currentFolderName: string
  /** The parent of the folder on screen — the listing its own row lives in. */
  openFolderParentId: string | null
}

/**
 * Which node each of the modals is acting on.
 *
 * The same four actions are reachable from three places — a row's menu, the
 * breadcrumbs (FR-EXP-06) and the header — so the aiming is kept here and the
 * three call sites are left holding nothing but a handler. Every one of them is
 * `undefined` for a viewer, which is what makes the affordance absent rather
 * than present and disabled (FR-PERM-03).
 */
export function useNodeTargets({
  isOwner,
  roomId,
  roomName,
  currentFolderId,
  currentFolderName,
  openFolderParentId,
}: UseNodeTargetsArgs) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [moveTarget, setMoveTarget] = useState<FolderItem | null>(null)
  const [renameTarget, setRenameTarget] = useState<NodeTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NodeTarget | null>(null)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)

  const rowActions = isOwner
    ? {
        onRename: (item: FolderItem) =>
          setRenameTarget({ item, parentId: currentFolderId }),
        onShare: (item: FolderItem) =>
          setShareTarget({
            resourceType: item.type === 'FOLDER' ? 'FOLDER' : 'FILE',
            resourceId: item.id,
            name: item.name,
          }),
        onMove: setMoveTarget,
        onDelete: (item: FolderItem) =>
          setDeleteTarget({ item, parentId: currentFolderId }),
      }
    : {}

  /**
   * FR-EXP-06: the open folder is acted on from the breadcrumbs. It has no row
   * of its own, and states its parent itself — `null` there means it sits at
   * the data room root.
   */
  const openFolderTarget: NodeTarget | null =
    currentFolderId !== null
      ? {
          item: {
            id: currentFolderId,
            name: currentFolderName,
            type: 'FOLDER',
          },
          parentId: openFolderParentId,
        }
      : null

  const canActOnOpenFolder = isOwner && openFolderTarget !== null

  const currentFolderActions = {
    onRename: canActOnOpenFolder
      ? () => setRenameTarget(openFolderTarget)
      : undefined,
    onShare: canActOnOpenFolder
      ? () =>
          setShareTarget({
            resourceType: 'FOLDER',
            resourceId: openFolderTarget.item.id,
            name: openFolderTarget.item.name,
          })
      : undefined,
    onDelete: canActOnOpenFolder
      ? () => setDeleteTarget(openFolderTarget)
      : undefined,
  }

  /**
   * FR-SHR-01: the header shares whatever the screen is showing — the folder
   * the user is standing in, or the data room itself at the root.
   */
  const shareCurrentScope = isOwner
    ? () =>
        setShareTarget(
          currentFolderId
            ? {
                resourceType: 'FOLDER',
                resourceId: currentFolderId,
                name: currentFolderName,
              }
            : {
                resourceType: 'DATA_ROOM',
                resourceId: roomId,
                name: roomName ?? '',
              }
        )
    : undefined

  const dialogs: ExplorerDialogState = {
    createFolderOpen,
    setCreateFolderOpen,
    moveTarget,
    closeMove: () => setMoveTarget(null),
    renameTarget,
    closeRename: () => setRenameTarget(null),
    deleteTarget,
    closeDelete: () => setDeleteTarget(null),
    shareTarget,
    closeShare: () => setShareTarget(null),
  }

  return {
    rowActions,
    currentFolderActions,
    shareCurrentScope,
    openCreateFolder: isOwner ? () => setCreateFolderOpen(true) : undefined,
    dialogs,
  }
}
