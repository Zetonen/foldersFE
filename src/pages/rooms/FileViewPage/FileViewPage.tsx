import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useGetFileDownloadUrlQuery,
  useGetFileQuery,
  useGetFolderContentsInfiniteQuery,
} from '@/api'
import { ErrorState } from '@/components/moduls/ErrorState'
import { FileViewerModal } from '@/widgets/FileViewerModal'
import { RenameNodeModal } from '@/widgets/RenameNodeModal'
import { DeleteNodeDialog } from '@/widgets/DeleteNodeDialog'
import { ShareModal, type ShareTarget } from '@/widgets/ShareModal'
import { MoveNodeModal } from '@/widgets/MoveNodeModal'
import { NameConflictModal } from '@/widgets/NameConflictModal'
import { useMoveNode } from '@/shared/hooks/useMoveNode'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { getRoute } from '@/shared/helpers/getRoute'
import { isAppError, isOwnerRole, type NodeRef } from '@/types'

/** FR-VIEW-01..12. */
export function FileViewPage() {
  const { roomId, fileId } = useParams()
  const navigate = useNavigate()

  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)
  const [moveOpen, setMoveOpen] = useState(false)

  const file = useGetFileQuery({ fileId: fileId ?? '' }, { skip: !fileId })
  const link = useGetFileDownloadUrlQuery(
    { fileId: fileId ?? '' },
    { skip: !fileId || file.isError }
  )

  const folderId = file.data?.folderId ?? null

  /**
   * FR-VIEW-10: stepping between files needs the folder's listing, which is
   * already in cache whenever the viewer was opened from the explorer.
   */
  const siblings = useGetFolderContentsInfiniteQuery(
    { dataRoomId: roomId ?? '', folderId },
    { skip: !roomId || !file.data }
  )

  const folderName = siblings.data?.pages[0]?.folder?.name ?? 'this folder'
  const { moveNode, conflict, resolveConflict, cancelConflict } = useMoveNode({
    dataRoomId: file.data?.dataRoomId ?? '',
    currentFolderId: folderId,
    currentFolderName: folderName,
  })

  if (!roomId || !fileId) return null

  const closeTo = folderId
    ? getRoute('roomFolder', { roomId, folderId })
    : getRoute('room', { roomId })

  // FR-VIEW-02: a direct hit has no history to go back to.
  const close = () => navigate(closeTo, { replace: true })

  // FR-VIEW-12 / edge case 11: the file was deleted while it was open.
  const isGone =
    isAppError(file.error) && file.error.status === HTTP_STATUS.notFound

  const files =
    siblings.data?.pages
      .flatMap((page) => page.items)
      .filter((item) => item.type === 'FILE') ?? []
  const index = files.findIndex((item) => item.id === fileId)

  const goTo = (offset: number) => {
    const target = files[index + offset]
    if (!target) return
    navigate(getRoute('roomFile', { roomId, fileId: target.id }))
  }

  const isOwner = isOwnerRole(file.data?.myRole)

  const openFile = file.data
  const node: NodeRef | null = openFile
    ? { id: openFile.id, name: openFile.name, type: 'FILE' }
    : null

  return (
    <>
      <FileViewerModal
        name={file.data?.name ?? ''}
        sizeBytes={file.data?.sizeBytes ?? 0}
        url={link.data?.url}
        isLoading={file.isLoading || link.isFetching}
        onRetry={link.refetch}
        onClose={close}
        position={
          index >= 0 && files.length > 1
            ? { index: index + 1, total: files.length }
            : undefined
        }
        onPrevious={index > 0 ? () => goTo(-1) : undefined}
        onNext={
          index >= 0 && index < files.length - 1 ? () => goTo(1) : undefined
        }
        onShare={
          isOwner && openFile
            ? () =>
                setShareTarget({
                  resourceType: 'FILE',
                  resourceId: openFile.id,
                  name: openFile.name,
                })
            : undefined
        }
        onRename={isOwner ? () => setRenameOpen(true) : undefined}
        onMove={isOwner ? () => setMoveOpen(true) : undefined}
        onDelete={isOwner ? () => setDeleteOpen(true) : undefined}
        body={
          isGone ? (
            <ErrorState
              title="This file has been deleted"
              actionLabel="Back to folder"
              onAction={close}
            />
          ) : undefined
        }
      />

      <RenameNodeModal
        item={renameOpen ? node : null}
        onOpenChange={setRenameOpen}
        dataRoomId={roomId}
        parentId={folderId}
        takenNames={files.map((item) => item.name)}
      />

      {/* FR-VIEW-11: deleting from the viewer returns to the folder. */}
      <DeleteNodeDialog
        item={deleteOpen ? node : null}
        onOpenChange={setDeleteOpen}
        dataRoomId={roomId}
        parentId={folderId}
        onDeleted={close}
      />

      <ShareModal
        target={shareTarget}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />

      <MoveNodeModal
        item={moveOpen ? (files[index] ?? null) : null}
        onOpenChange={setMoveOpen}
        dataRoomId={file.data?.dataRoomId ?? ''}
        currentFolderId={folderId}
        currentFolderName={folderName}
        onMove={(item, toFolderId, toFolderName) =>
          void moveNode({ item, toFolderId, toFolderName })
        }
      />

      <NameConflictModal
        conflict={conflict}
        resolutions={['keepBoth', 'skip']}
        onResolve={(resolution) => void resolveConflict(resolution)}
        onCancel={cancelConflict}
      />
    </>
  )
}
