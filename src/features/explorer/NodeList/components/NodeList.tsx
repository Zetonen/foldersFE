import { Skeleton } from '@/components/ui/skeleton'
import { ListSkeleton } from '@/components/moduls/ListSkeleton'
import { cn } from '@/shared/helpers/cn'
import { formatItemCount } from '@/shared/helpers/formatItemCount'
import { LIST } from '@/shared/constants/LIST'
import { NODE_COLUMNS } from '../constants/columns'
import { useListDropTarget } from '../hooks/useListDropTarget'
import type { FolderItem, ViewMode } from '@/types'
import type { NodeActions } from '../types/NodeActions'
import type { NodeDndState } from '../types/NodeDndState'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { NodeGrid } from './NodeGrid'
import { NodeGridSkeleton } from './NodeGridSkeleton'
import { NodeRow } from './NodeRow'
import { VirtualNodeRows } from './VirtualNodeRows'
import { NodeListEmpty } from './NodeListEmpty'
import { NodeListError } from './NodeListError'

interface NodeListProps {
  items: FolderItem[]
  /**
   * FR-EXP-18: how many children the folder has in all. `items` holds the
   * pages fetched so far, which is the smaller number while there are more to
   * come — stating both is the point. Absent where the listing does not carry
   * a total, and the strip is then simply not rendered.
   */
  totalItems?: number
  /** FR-EXP-11: table rows or grid cards. */
  viewMode: ViewMode
  /** FR-EXP-12: "me" for your own rooms; the API has no owner field yet. */
  ownerLabel: string
  selectedId: string | null
  actions: NodeActions
  onSelect: (item: FolderItem) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onUpload?: () => void
  /** FR-UPL-04: dropping OS files onto a folder row uploads into that folder. */
  onFilesDroppedOnFolder?: (folder: FolderItem, files: File[]) => void
  dnd: NodeDndState
}

export function NodeList({
  items,
  totalItems,
  viewMode,
  ownerLabel,
  selectedId,
  actions,
  onSelect,
  isLoading,
  isError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onUpload,
  onFilesDroppedOnFolder,
  dnd,
}: NodeListProps) {
  const { scrollRef, handleScroll } = useInfiniteScroll({
    hasNextPage,
    isFetching: isFetchingNextPage,
    onLoadMore,
  })

  // FR-MOV-02/06: the space around the rows drops into the open folder.
  const listDrop = useListDropTarget({
    currentParentId: dnd.currentParentId,
    ancestorIds: dnd.ancestorIds,
  })

  // FR-EXP-17: only large folders pay for virtualisation.
  const isVirtual = items.length > LIST.virtualizationThreshold
  const isGrid = viewMode === 'grid'

  /**
   * FR-EXP-18: what is on screen out of what is there. An optimistic removal
   * leaves the cached total one ahead of the rows for as long as the refetch
   * takes; the loaded count is never allowed to overshoot it, so the strip
   * cannot read "51 of 50" in that window.
   */
  const knownTotal =
    totalItems === undefined ? undefined : Math.max(totalItems, items.length)
  const countLabel =
    knownTotal === undefined || isLoading || isError || knownTotal === 0
      ? null
      : items.length < knownTotal
        ? `Showing ${items.length} of ${formatItemCount(knownTotal)}`
        : formatItemCount(knownTotal)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* FR-EXP-12: column headings belong to the table layout alone. */}
      {isGrid ? null : (
        <div className="flex h-9 shrink-0 items-center border-b border-border px-4 text-[13px] font-medium text-muted-foreground">
          <span className={NODE_COLUMNS.name}>Name</span>
          <span className={NODE_COLUMNS.owner}>Owner</span>
          {/*
            The box is kept and only its text is hidden: `sr-only` on the
            column itself would take it out of the flow, and the two headings
            would sit a column's width to the right of the values below them.
          */}
          <span className={NODE_COLUMNS.actions}>
            <span className="sr-only">Actions</span>
          </span>
        </div>
      )}

      <div
        // One element, two owners: the scroll listener reads it, and dnd-kit
        // measures it as the drop target for the folder on screen.
        ref={(element) => {
          scrollRef.current = element
          listDrop.setNodeRef(element)
        }}
        onScroll={handleScroll}
        className={cn(
          'min-h-0 flex-1 overflow-auto',
          // FR-MOV-03: the same highlight a folder row gets.
          listDrop.isOver && 'bg-selected/40 ring-2 ring-brand ring-inset'
        )}
      >
        {isLoading ? (
          // FR-EXP-22: placeholders in the shape of what is coming, rather
          // than a full-screen spinner.
          isGrid ? (
            <NodeGridSkeleton />
          ) : (
            <ListSkeleton />
          )
        ) : isError ? (
          <NodeListError onRetry={onRetry} />
        ) : items.length === 0 ? (
          <NodeListEmpty onUpload={onUpload} />
        ) : isGrid ? (
          <NodeGrid
            items={items}
            selectedId={selectedId}
            actions={actions}
            onSelect={onSelect}
            onFilesDropped={onFilesDroppedOnFolder}
            dnd={dnd}
          />
        ) : isVirtual ? (
          <VirtualNodeRows
            items={items}
            scrollRef={scrollRef}
            ownerLabel={ownerLabel}
            selectedId={selectedId}
            actions={actions}
            onSelect={onSelect}
            onFilesDropped={onFilesDroppedOnFolder}
            dnd={dnd}
          />
        ) : (
          items.map((item) => (
            <NodeRow
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              ownerLabel={ownerLabel}
              actions={actions}
              onSelect={onSelect}
              onFilesDropped={onFilesDroppedOnFolder}
              {...dnd}
            />
          ))
        )}

        {/* FR-EXP-18: a skeleton row marks the page being fetched. */}
        {isFetchingNextPage ? (
          <div
            className={cn(
              'flex items-center gap-3 px-4',
              // In the grid the strip would read as a stray row, so it loses
              // the rule that separates rows from one another.
              isGrid ? 'pb-4' : 'border-b border-border'
            )}
            style={{ height: LIST.rowHeight }}
          >
            <Skeleton className="size-5 shrink-0 rounded" />
            <Skeleton className="h-3.5 w-1/3" />
          </div>
        ) : null}
      </div>

      {/* FR-EXP-18: the list is paged, so it says how much of the folder the
          user is actually looking at. It sits outside the scroll container so
          the answer stays visible while they scroll towards the rest. */}
      {countLabel ? (
        <div className="flex h-8 shrink-0 items-center border-t border-border px-4 text-xs text-muted-foreground">
          {countLabel}
        </div>
      ) : null}
    </div>
  )
}
