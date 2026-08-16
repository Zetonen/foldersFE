import { useEffect, useMemo } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useGetShareViewInfiniteQuery } from '@/api'
import { toBreadcrumbs } from '@/api/helpers/toBreadcrumbs'
import { ExplorerLayout } from '@/components/layout/ExplorerLayout'
import { NodeList } from '@/features/explorer/NodeList'
import { ExplorerHeader } from '@/widgets/ExplorerHeader'
import { ExplorerSidebar } from '@/widgets/ExplorerSidebar'
import { ExplorerBreadcrumbs } from '@/widgets/ExplorerBreadcrumbs'
import { NodeDetailsPanel } from '@/widgets/NodeDetailsPanel'
import { ViewModeSwitch } from '@/widgets/ViewModeSwitch'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { ROUTES } from '@/shared/constants/ROUTES'
import { getRoute } from '@/shared/helpers/getRoute'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { useNodeSelection } from '@/shared/hooks/useNodeSelection'
import { useNoIndex } from '@/shared/hooks/useNoIndex'
import {
  selectSidebarOpen,
  selectViewMode,
  sidebarClosed,
  sidebarToggled,
  viewModeChanged,
} from '@/store'
import { isAppError, type FolderItem } from '@/types'

/**
 * FR-PUB-01..08: the explorer as a viewer sees it.
 *
 * Every mutating affordance is absent rather than disabled (FR-PERM-03), which
 * falls out of simply not passing the handlers the components would need.
 */
export function SharedExplorerPage() {
  const { token, folderId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // FR-PUB-08.
  useNoIndex()

  const currentFolderId = folderId ?? null
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const viewMode = useAppSelector(selectViewMode)

  const query = useGetShareViewInfiniteQuery(
    { token: token ?? '', folderId: currentFolderId },
    { skip: !token }
  )

  const pages = query.data?.pages
  const view = pages?.[0]

  /**
   * FR-PERM-04: the same assembly as the owner's explorer. Through a share
   * there is no `dataRoom`, so the trail simply starts at the shared root
   * instead of at a room name the visitor is not entitled to.
   */
  const trail = useMemo(() => toBreadcrumbs(view), [view])

  const allItems = useMemo(
    () => pages?.flatMap((page) => page.items) ?? [],
    [pages]
  )

  const selection = useNodeSelection({
    items: allItems,
    listingKey: `${token ?? ''}/${currentFolderId ?? ''}`,
  })

  /**
   * FR-PUB-05/06: a token that no longer works and a resource the signed-in
   * account was never granted are different answers to the user.
   */
  useEffect(() => {
    const error = query.error
    if (!isAppError(error)) return

    if (error.status === HTTP_STATUS.notFound) {
      navigate(ROUTES.linkExpired, { replace: true })
    }
    if (error.status === HTTP_STATUS.forbidden) {
      navigate(ROUTES.forbidden, { replace: true })
    }
  }, [query.error, navigate])

  /** FR-PUB-04: a link to a single file opens the viewer, with no list behind. */
  useEffect(() => {
    if (!token || view?.resourceType !== 'FILE' || !view.file) return
    navigate(getRoute('shareFile', { token, fileId: view.file.id }), {
      replace: true,
    })
  }, [token, view?.resourceType, view?.file, navigate])

  if (!token) return null

  const navigateToFolder = (targetId: string | null) => {
    dispatch(sidebarClosed())
    navigate(
      targetId
        ? getRoute('shareFolder', { token, folderId: targetId })
        : getRoute('share', { token })
    )
  }

  const openItem = (item: FolderItem) => {
    if (item.type === 'FOLDER') {
      navigateToFolder(item.id)
      return
    }
    navigate(getRoute('shareFile', { token, fileId: item.id }))
  }

  // FR-PERM-04: the trail is rooted at what was shared, not at the data room.
  const rootName = view?.folder?.name ?? view?.dataRoom?.name

  return (
    <>
      <ExplorerLayout
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => dispatch(sidebarClosed())}
        header={
          <ExplorerHeader
            roomName={rootName}
            onToggleSidebar={() => dispatch(sidebarToggled())}
            // FR-PUB-02.
            badge="Read-only"
          />
        }
        sidebar={
          <ExplorerSidebar
            atRoot={currentFolderId === null}
            onGoToRoot={() => navigateToFolder(null)}
            ancestorIds={[]}
          />
        }
        breadcrumbs={
          <ExplorerBreadcrumbs
            trail={trail}
            isLoading={query.isLoading}
            onNavigate={navigateToFolder}
            currentFolderId={currentFolderId}
            ancestorIds={[]}
          />
        }
        // FR-PUB-03: a visitor gets the same choice of layout.
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
              ownerLabel="—"
              shareToken={token}
              // FR-PERM-02: a viewer is not told who else was invited.
              canViewAccess={false}
              onClose={selection.closeDetails}
            />
          ) : undefined
        }
      >
        <NodeList
          items={allItems}
          viewMode={viewMode}
          ownerLabel="—"
          selectedId={selection.selectedId}
          onSelect={selection.select}
          // FR-EXP-16: a viewer's menu holds "Open" and "Details", no more.
          actions={{
            onOpen: openItem,
            onDetails: selection.openDetails,
          }}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={query.refetch}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={query.fetchNextPage}
          // FR-MOV-13 / FR-UPL-06: no dragging, no dropping.
          dnd={{
            canDrag: false,
            currentParentId: currentFolderId,
            currentParentName: rootName ?? '',
            ancestorIds: [],
          }}
        />
      </ExplorerLayout>

      <Outlet />
    </>
  )
}
