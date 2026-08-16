import { isDropTargetDisabled } from '@/shared/helpers/dnd/isDropTargetDisabled'
import {
  useDraggableNode,
  useDraggedFromFolderId,
  useDraggedNodeId,
  useDroppableFolder,
  useInsideDraggedSubtree,
} from '@/shared/hooks/useNodeDnd'
import type { FolderItem } from '@/types'
import type { NodeDndState } from '../types/NodeDndState'

interface UseNodeRowDndArgs extends NodeDndState {
  item: FolderItem
}

/**
 * FR-MOV-01..05: whether this row can be picked up, whether it can be dropped
 * onto, and how it should look while a drag is in progress.
 */
export function useNodeRowDnd({
  item,
  canDrag,
  currentParentId,
  currentParentName,
  ancestorIds,
}: UseNodeRowDndArgs) {
  const draggedNodeId = useDraggedNodeId()
  const draggedFromFolderId = useDraggedFromFolderId()
  const insideDraggedSubtree = useInsideDraggedSubtree(ancestorIds)

  const drag = useDraggableNode(
    item,
    { folderId: currentParentId, folderName: currentParentName },
    !canDrag
  )

  // Only folders accept a drop; a file row is never a destination.
  const dropDisabled =
    item.type !== 'FOLDER' ||
    isDropTargetDisabled({
      targetFolderId: item.id,
      activeItemId: draggedNodeId,
      fromFolderId: draggedFromFolderId,
      insideDraggedSubtree,
    })

  const drop = useDroppableFolder({
    folderId: item.id,
    scope: 'row',
    disabled: dropDisabled,
    // FR-MOV-06: list rows are the only targets that spring open.
    springOpen: true,
  })

  return {
    /** Both hooks need the same node, so the refs are merged here. */
    setNodeRef: (element: HTMLElement | null) => {
      drag.setNodeRef(element)
      drop.setNodeRef(element)
    },
    dragProps: { ...drag.attributes, ...drag.listeners },
    isDragging: drag.isDragging,
    isOver: drop.isOver,
    // FR-MOV-04: refused targets get the forbidden cursor and no highlight.
    refusesDrop:
      Boolean(draggedNodeId) && item.type === 'FOLDER' && dropDisabled,
  }
}
