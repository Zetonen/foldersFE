import { type ReactNode } from 'react'
import { DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import type { DraggableData } from '@/shared/constants/DND'
import { DraggedNodeContext } from '@/shared/contexts/DraggedNodeContext'
import { useGrabbingCursor } from '../hooks/useGrabbingCursor'
import { useNodeDragHandlers } from '../hooks/useNodeDragHandlers'
import { NodeDragPreview } from './NodeDragPreview'

interface NodeDragProviderProps {
  children: ReactNode
  /** FR-MOV-02: resolves the destination name for the confirmation toast. */
  getFolderName: (folderId: string | null) => string
  onMove: (
    dragged: DraggableData,
    toFolderId: string | null,
    toFolderName: string
  ) => void
  /** FR-MOV-06: navigate into a folder held under the cursor. */
  onSpringOpen: (folderId: string) => void
}

/**
 * FR-MOV-01: the drag-and-drop context for the whole explorer — the list, the
 * breadcrumbs and the sidebar are all inside it.
 *
 * FR-MOV-03: a `DragOverlay` carries a copy of the node under the cursor, and
 * the row it came from is dimmed in place. The overlay is not only decoration:
 * it is what lets a drag continue after a folder springs open (FR-MOV-06) and
 * replaces every row on screen, the original among them.
 *
 * FR-MOV-07: `autoScroll` is dnd-kit's default and handles the list edges.
 */
export function NodeDragProvider({
  children,
  getFolderName,
  onMove,
  onSpringOpen,
}: NodeDragProviderProps) {
  const {
    sensors,
    dragged,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useNodeDragHandlers({ getFolderName, onMove, onSpringOpen })

  useGrabbingCursor(dragged !== null)

  return (
    <DndContext
      sensors={sensors}
      /**
       * A spring-open swaps the whole listing mid-drag, so the drop targets
       * dnd-kit measured at drag start no longer exist. Measuring again on
       * every change is what makes the new folder's rows droppable at once.
       */
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      /**
       * The preview rides on the cursor rather than at the offset where the
       * row happened to be grabbed. Applied here rather than on the overlay so
       * that the box used for collisions is the same one the user can see.
       */
      modifiers={[snapCenterToCursor]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/*
        Every drop target reads what is being carried from here, not from
        dnd-kit: dnd-kit drops the payload as soon as the dragged row unmounts,
        which is the first thing a spring-open does.
      */}
      <DraggedNodeContext.Provider value={dragged}>
        {children}
      </DraggedNodeContext.Provider>

      {/*
        No drop animation: it flies the preview back to the row it started
        from, and after a spring-open that row is not on screen any more.
      */}
      <DragOverlay
        dropAnimation={null}
        // dnd-kit sizes the overlay to the row it came from; the preview is a
        // small card, and it should be the card that follows the cursor.
        style={{ width: 'auto', height: 'auto' }}
      >
        {dragged ? <NodeDragPreview item={dragged.item} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
