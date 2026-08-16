import { useContext } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { DraggedNodeContext } from '@/shared/contexts/DraggedNodeContext'
import {
  draggableId,
  droppableId,
  type DraggableData,
  type DropScope,
  type DroppableData,
} from '@/shared/constants/DND'
import type { FolderItem } from '@/types'

/**
 * Everything the drag is carrying, if one is in progress.
 *
 * Read from the drag rather than drilled down as props, because after a
 * spring-open (FR-MOV-06) the screen no longer shows the folder the node came
 * from — the drag is the only thing that still knows.
 */
export function useDraggedNode(): DraggableData | null {
  return useContext(DraggedNodeContext)
}

/** The node currently being dragged, if any. */
export function useDraggedNodeId(): string | undefined {
  return useDraggedNode()?.item.id
}

/** The folder that node still lives in — never a destination for itself. */
export function useDraggedFromFolderId(): string | null | undefined {
  return useDraggedNode()?.fromFolderId
}

/**
 * FR-MOV-05: true once the folder being dragged appears in the path of the
 * folder on screen — everything visible is then inside its own subtree.
 *
 * Computed here rather than passed down, because only components inside the
 * `DndContext` can know what is being dragged.
 */
export function useInsideDraggedSubtree(ancestorIds: string[]): boolean {
  const draggedNodeId = useDraggedNodeId()
  return Boolean(draggedNodeId && ancestorIds.includes(draggedNodeId))
}

/**
 * FR-MOV-01: a row becomes draggable. Disabled for a viewer (FR-MOV-13) and
 * while no move handler exists, so the pointer behaves normally.
 */
export function useDraggableNode(
  item: FolderItem,
  /** Where the node lives — carried along so a drop can move it from there. */
  from: { folderId: string | null; folderName: string },
  disabled: boolean
) {
  const data: DraggableData = {
    item,
    fromFolderId: from.folderId,
    fromFolderName: from.folderName,
  }

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableId(item.id),
    data,
    disabled,
  })

  return { attributes, listeners, setNodeRef, isDragging }
}

interface DroppableFolderArgs {
  /** `null` targets the data room root. */
  folderId: string | null
  /** The surface this target belongs to, which keeps its id unique. */
  scope: DropScope
  /** FR-MOV-05: the node itself, its current parent and its subtree. */
  disabled: boolean
  /** FR-MOV-06: list rows open on hover; breadcrumbs and the sidebar do not. */
  springOpen?: boolean
}

/** FR-MOV-02: a folder row, a breadcrumb or the sidebar's "All files". */
export function useDroppableFolder({
  folderId,
  scope,
  disabled,
  springOpen = false,
}: DroppableFolderArgs) {
  const data: DroppableData = { folderId, springOpen }

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId(folderId, scope),
    data,
    disabled,
  })

  // FR-MOV-04: a disabled target never highlights.
  return { setNodeRef, isOver: isOver && !disabled }
}
