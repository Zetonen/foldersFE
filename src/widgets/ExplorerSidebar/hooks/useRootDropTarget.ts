import { isDropTargetDisabled } from '@/shared/helpers/dnd/isDropTargetDisabled'
import {
  useDraggedFromFolderId,
  useDraggedNodeId,
  useDroppableFolder,
  useInsideDraggedSubtree,
} from '@/shared/hooks/useNodeDnd'

interface UseRootDropTargetArgs {
  ancestorIds: string[]
}

/**
 * FR-MOV-02: "All files" is a drop target that moves a node to the data room
 * root — except when the node is already there.
 */
export function useRootDropTarget({ ancestorIds }: UseRootDropTargetArgs) {
  const draggedNodeId = useDraggedNodeId()
  const draggedFromFolderId = useDraggedFromFolderId()
  const insideDraggedSubtree = useInsideDraggedSubtree(ancestorIds)

  return useDroppableFolder({
    folderId: null,
    scope: 'sidebar',
    disabled: isDropTargetDisabled({
      targetFolderId: null,
      activeItemId: draggedNodeId,
      fromFolderId: draggedFromFolderId,
      insideDraggedSubtree,
    }),
  })
}
