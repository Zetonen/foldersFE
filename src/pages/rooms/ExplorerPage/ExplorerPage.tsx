import { Outlet, useParams } from 'react-router-dom'
import { ExplorerLayout } from '@/components/layout/ExplorerLayout'
import { NodeList } from '@/features/explorer/NodeList'
import { NodeDropzone } from '@/features/explorer/NodeDropzone'
import { NodeDragProvider } from '@/features/explorer/NodeDragAndDrop'
import { ExplorerHeader } from '@/widgets/ExplorerHeader'
import { ExplorerSidebar } from '@/widgets/ExplorerSidebar'
import { ExplorerBreadcrumbs } from '@/widgets/ExplorerBreadcrumbs'
import { NodeDetailsPanel } from '@/widgets/NodeDetailsPanel'
import { ViewModeSwitch } from '@/widgets/ViewModeSwitch'
import { pickFiles } from '@/shared/helpers/upload/pickFiles'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { useMoveNode } from '@/shared/hooks/useMoveNode'
import { useNodeSelection } from '@/shared/hooks/useNodeSelection'
import { useUploadEnqueue } from '@/shared/hooks/useUploadEnqueue'
import { useUploadConflicts } from '@/shared/hooks/useUploadConflicts'
import type { DraggableData } from '@/shared/constants/DND'
import {
  selectSidebarOpen,
  selectViewMode,
  sidebarClosed,
  sidebarToggled,
  viewModeChanged,
} from '@/store'
import { ExplorerDialogs } from './components/ExplorerDialogs'
import { useExplorerListing } from './hooks/useExplorerListing'
import { useExplorerNavigation } from './hooks/useExplorerNavigation'
import { useNodeTargets } from './hooks/useNodeTargets'

/** FR-EXP-01..27 plus the create / rename / move / delete flows of §11. */
export function ExplorerPage() {
  const { roomId, folderId } = useParams()
  const dispatch = useAppDispatch()

  const currentFolderId = folderId ?? null
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const viewMode = useAppSelector(selectViewMode)

  const listing = useExplorerListing({
    dataRoomId: roomId ?? '',
    folderId: currentFolderId,
  })
  const {
    query,
    items,
    totalItems,
    trail,
    ancestorIds,
    takenNames,
    openFolder,
    roomName,
    currentFolderName,
    isOwner,
    isGuest,
  } = listing

  const selection = useNodeSelection({
    items,
    listingKey: `${roomId ?? ''}/${currentFolderId ?? ''}`,
  })

  const { navigateToFolder, openItem } = useExplorerNavigation({
    roomId: roomId ?? '',
    currentFolderId,
    isGuest,
    error: query.error,
  })

  const targets = useNodeTargets({
    isOwner,
    roomId: roomId ?? '',
    roomName,
    currentFolderId,
    currentFolderName,
    openFolderParentId: openFolder?.parentId ?? null,
  })

  const { moveNode, conflict, resolveConflict, cancelConflict } = useMoveNode({
    dataRoomId: roomId ?? '',
    currentFolderId,
    currentFolderName,
  })

  const enqueueUploads = useUploadEnqueue()
  const uploads = useUploadConflicts({ items })

  if (!roomId) return null

  const startUpload = (files: File[], target?: { id: string; name: string }) =>
    enqueueUploads(files, {
      dataRoomId: roomId,
      folderId: target?.id ?? currentFolderId,
      folderName: target?.name ?? currentFolderName,
      existingNames: takenNames,
    })

  /** FR-UPL-01: the "File upload" item opens the operating system picker. */
  const uploadFiles = isOwner
    ? () => pickFiles((files) => startUpload(files))
    : undefined

  /**
   * FR-MOV-06: the drop is answered from what the drag carries, not from the
   * listing. A drag that spring-opened its way here started in a folder that is
   * no longer on screen, so looking the node up in `items` would find nothing
   * and quietly drop the move.
   */
  const handleDrop = (
    dragged: DraggableData,
    toFolderId: string | null,
    toFolderName: string
  ) => {
    void moveNode({
      item: dragged.item,
      toFolderId,
      toFolderName,
      from: { id: dragged.fromFolderId, name: dragged.fromFolderName },
    })
  }

  return (
    <NodeDragProvider
      getFolderName={(targetId) =>
        targetId === null
          ? (roomName ?? 'All files')
          : (items.find((item) => item.id === targetId)?.name ??
            trail.find((crumb) => crumb.id === targetId)?.name ??
            'that folder')
      }
      onMove={handleDrop}
      onSpringOpen={navigateToFolder}
    >
      <ExplorerLayout
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => dispatch(sidebarClosed())}
        header={
          <ExplorerHeader
            // A recipient is not told the room's name, so the shared folder
            // they are standing in is the most specific thing to show.
            roomName={roomName ?? openFolder?.name}
            onToggleSidebar={() => dispatch(sidebarToggled())}
            onShare={targets.shareCurrentScope}
          />
        }
        sidebar={
          <ExplorerSidebar
            atRoot={currentFolderId === null}
            // There is no room root for a guest to go to, so the entry is
            // absent rather than present and broken (FR-PERM-03).
            onGoToRoot={isGuest ? undefined : () => navigateToFolder(null)}
            ancestorIds={ancestorIds}
            onCreateFolder={targets.openCreateFolder}
            onUploadFiles={uploadFiles}
          />
        }
        breadcrumbs={
          <ExplorerBreadcrumbs
            trail={trail}
            root={listing.trailRoot}
            isLoading={query.isLoading}
            onNavigate={navigateToFolder}
            currentFolderId={currentFolderId}
            ancestorIds={ancestorIds}
            // FR-EXP-06: acts on the folder currently open, not on a row.
            onRenameCurrent={targets.currentFolderActions.onRename}
            onShareCurrent={targets.currentFolderActions.onShare}
            onDeleteCurrent={targets.currentFolderActions.onDelete}
          />
        }
        // FR-EXP-11: remembered across sessions, so it is set once.
        toolbar={
          <ViewModeSwitch
            value={viewMode}
            onChange={(mode) => dispatch(viewModeChanged(mode))}
          />
        }
        details={
          selection.detailsOpen && selection.selectedItem ? (
            <NodeDetailsPanel
              item={selection.selectedItem}
              ownerLabel={listing.ownerLabel}
              canViewAccess={isOwner}
              onClose={selection.closeDetails}
            />
          ) : undefined
        }
      >
        {/* FR-UPL-01/03/06: the list area is the drop zone, owner only. */}
        <NodeDropzone
          disabled={!isOwner}
          folderName={currentFolderName}
          onFilesDropped={(files) => startUpload(files)}
        >
          <NodeList
            items={items}
            totalItems={totalItems}
            viewMode={viewMode}
            ownerLabel={listing.ownerLabel}
            selectedId={selection.selectedId}
            onSelect={selection.select}
            actions={{
              onOpen: openItem,
              onDetails: selection.openDetails,
              ...targets.rowActions,
            }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={query.refetch}
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            onLoadMore={query.fetchNextPage}
            onUpload={uploadFiles}
            onFilesDroppedOnFolder={
              isOwner
                ? (folder, files) =>
                    startUpload(files, { id: folder.id, name: folder.name })
                : undefined
            }
            dnd={{
              canDrag: isOwner,
              currentParentId: currentFolderId,
              currentParentName: currentFolderName,
              ancestorIds,
            }}
          />
        </NodeDropzone>
      </ExplorerLayout>

      <ExplorerDialogs
        dataRoomId={roomId}
        currentFolderId={currentFolderId}
        currentFolderName={currentFolderName}
        takenNames={takenNames}
        dialogs={targets.dialogs}
        onFolderCreated={selection.selectId}
        onNodeDeleted={(deleted) => {
          // FR-DEL-07: the folder the user was standing in has just gone, so
          // the nearest place that still exists is its parent.
          if (deleted.id !== currentFolderId) return
          navigateToFolder(openFolder?.parentId ?? null)
        }}
        onMove={(item, toFolderId, toFolderName) =>
          void moveNode({ item, toFolderId, toFolderName })
        }
        moveConflict={{
          conflict,
          onResolve: (resolution) => void resolveConflict(resolution),
          onCancel: cancelConflict,
        }}
        uploadConflict={{
          conflict: uploads.conflict,
          onResolve: (resolution, applyToAll) =>
            void uploads.resolve(resolution, applyToAll),
          onCancel: uploads.cancelAll,
        }}
      />

      {/* FR-VIEW-01: the file viewer mounts over the explorer. */}
      <Outlet />
    </NodeDragProvider>
  )
}
