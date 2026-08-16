import { UserText } from '@/components/moduls/UserText'
import { cn } from '@/shared/helpers/cn'
import { isDropTargetDisabled } from '@/shared/helpers/dnd/isDropTargetDisabled'
import {
  useDraggedFromFolderId,
  useDraggedNodeId,
  useDroppableFolder,
  useInsideDraggedSubtree,
} from '@/shared/hooks/useNodeDnd'

interface BreadcrumbCrumbProps {
  /** `null` is the data room root. */
  folderId: string | null
  name: string
  ancestorIds: string[]
  onNavigate: (folderId: string | null) => void
}

/**
 * FR-EXP-08 / FR-MOV-02: an ancestor in the trail doubles as a drop target,
 * which is how a node is moved back up the tree.
 */
export function BreadcrumbCrumb({
  folderId,
  name,
  ancestorIds,
  onNavigate,
}: BreadcrumbCrumbProps) {
  const draggedNodeId = useDraggedNodeId()
  const draggedFromFolderId = useDraggedFromFolderId()
  const insideDraggedSubtree = useInsideDraggedSubtree(ancestorIds)

  const disabled = isDropTargetDisabled({
    targetFolderId: folderId,
    activeItemId: draggedNodeId,
    fromFolderId: draggedFromFolderId,
    insideDraggedSubtree,
  })

  // FR-MOV-06: breadcrumbs navigate on click, so they never spring open.
  const { setNodeRef, isOver } = useDroppableFolder({
    folderId,
    scope: 'crumb',
    disabled,
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onNavigate(folderId)}
      title={name}
      className={cn(
        'max-w-[28vw] truncate rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:max-w-48',
        isOver && 'bg-selected text-brand ring-2 ring-brand'
      )}
    >
      <UserText>{name}</UserText>
    </button>
  )
}
