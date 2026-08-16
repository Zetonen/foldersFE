import { isDropTargetDisabled } from '@/shared/helpers/dnd/isDropTargetDisabled'
import {
  useDraggedFromFolderId,
  useDraggedNodeId,
  useDroppableFolder,
  useInsideDraggedSubtree,
} from '@/shared/hooks/useNodeDnd'

interface UseListDropTargetArgs {
  /** The folder whose contents are on screen; `null` is the room root. */
  currentParentId: string | null
  ancestorIds: string[]
}

/**
 * FR-MOV-02/06: the listing itself is a drop target for the folder it shows.
 *
 * Without it a spring-open would be a dead end — the user carries a node into
 * a folder, and then has nowhere to put it down except a subfolder. The empty
 * space around the rows is "here", which is the destination they just chose.
 */
export function useListDropTarget({
  currentParentId,
  ancestorIds,
}: UseListDropTargetArgs) {
  const draggedNodeId = useDraggedNodeId()
  const draggedFromFolderId = useDraggedFromFolderId()
  const insideDraggedSubtree = useInsideDraggedSubtree(ancestorIds)

  return useDroppableFolder({
    folderId: currentParentId,
    scope: 'list',
    // Refused while the node already lives here, so the listing does not light
    // up under a drag that has nowhere to go.
    disabled: isDropTargetDisabled({
      targetFolderId: currentParentId,
      activeItemId: draggedNodeId,
      fromFolderId: draggedFromFolderId,
      insideDraggedSubtree,
    }),
  })
}
