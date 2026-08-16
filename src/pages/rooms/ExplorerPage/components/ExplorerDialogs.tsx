import { Suspense, lazy } from 'react'
import { CreateFolderModal } from '@/widgets/CreateFolderModal'
import { RenameNodeModal } from '@/widgets/RenameNodeModal'
import { DeleteNodeDialog } from '@/widgets/DeleteNodeDialog'
import { NameConflictModal } from '@/widgets/NameConflictModal'
import type {
  ConflictResolution,
  FolderItem,
  NameConflict,
  NodeRef,
} from '@/types'
import type { ExplorerDialogState } from '../hooks/useNodeTargets'

// FR-LAZY-03: the move and share dialogs ship in their own chunks.
const MoveNodeModal = lazy(async () => ({
  default: (await import('@/widgets/MoveNodeModal')).MoveNodeModal,
}))
const ShareModal = lazy(async () => ({
  default: (await import('@/widgets/ShareModal')).ShareModal,
}))

/** One collision, whoever raised it, and the two ways out of it. */
interface ConflictSlot {
  conflict: NameConflict | null
  onResolve: (resolution: ConflictResolution, applyToAll: boolean) => void
  onCancel: () => void
}

interface ExplorerDialogsProps {
  dataRoomId: string
  /** The folder on screen: where a new folder lands, and whose names collide. */
  currentFolderId: string | null
  currentFolderName: string
  takenNames: string[]
  dialogs: ExplorerDialogState
  onFolderCreated: (folderId: string) => void
  onNodeDeleted: (item: NodeRef) => void
  onMove: (
    item: FolderItem,
    toFolderId: string | null,
    toFolderName: string
  ) => void
  /** FR-MOV-11: raised by a move already under way. */
  moveConflict: ConflictSlot
  /** FR-UPL-10..13: found before the batch starts moving. */
  uploadConflict: ConflictSlot
}

/**
 * Every modal the explorer can put in front of the user.
 *
 * They are gathered here because none of them is part of the screen — each one
 * is dormant until a target is set, and mixing seven of them into the layout
 * buried the layout. What they share is the shape of that dormancy: a `null`
 * target means closed, so none of them mounts anything until it is aimed.
 *
 * It is a page-local component rather than a widget on purpose: it composes
 * widgets, and a widget may not import another widget (FR-ARCH-02).
 */
export function ExplorerDialogs({
  dataRoomId,
  currentFolderId,
  currentFolderName,
  takenNames,
  dialogs,
  onFolderCreated,
  onNodeDeleted,
  onMove,
  moveConflict,
  uploadConflict,
}: ExplorerDialogsProps) {
  return (
    <>
      <CreateFolderModal
        open={dialogs.createFolderOpen}
        onOpenChange={dialogs.setCreateFolderOpen}
        dataRoomId={dataRoomId}
        parentId={currentFolderId}
        takenNames={takenNames}
        onCreated={onFolderCreated}
      />

      <RenameNodeModal
        item={dialogs.renameTarget?.item ?? null}
        onOpenChange={(open) => !open && dialogs.closeRename()}
        dataRoomId={dataRoomId}
        parentId={dialogs.renameTarget?.parentId ?? null}
        takenNames={takenNames}
      />

      {/* Nothing to show while the chunk loads — the dialog is not open yet. */}
      <Suspense fallback={null}>
        {dialogs.moveTarget ? (
          <MoveNodeModal
            item={dialogs.moveTarget}
            onOpenChange={(open) => !open && dialogs.closeMove()}
            dataRoomId={dataRoomId}
            currentFolderId={currentFolderId}
            currentFolderName={currentFolderName}
            onMove={onMove}
          />
        ) : null}
      </Suspense>

      <DeleteNodeDialog
        item={dialogs.deleteTarget?.item ?? null}
        onOpenChange={(open) => !open && dialogs.closeDelete()}
        dataRoomId={dataRoomId}
        parentId={dialogs.deleteTarget?.parentId ?? null}
        onDeleted={onNodeDeleted}
      />

      {/* FR-MOV-11: moving cannot replace, so it offers two of the three. */}
      <NameConflictModal
        conflict={moveConflict.conflict}
        resolutions={['keepBoth', 'skip']}
        onResolve={moveConflict.onResolve}
        onCancel={moveConflict.onCancel}
      />

      <NameConflictModal
        conflict={uploadConflict.conflict}
        showApplyToAll
        onResolve={uploadConflict.onResolve}
        onCancel={uploadConflict.onCancel}
      />

      {/* FR-SHR-01: shares a row, the open folder or the data room itself. */}
      <Suspense fallback={null}>
        {dialogs.shareTarget ? (
          <ShareModal
            target={dialogs.shareTarget}
            onOpenChange={(open) => !open && dialogs.closeShare()}
          />
        ) : null}
      </Suspense>
    </>
  )
}
