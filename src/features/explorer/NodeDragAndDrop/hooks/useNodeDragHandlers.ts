import { useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  DND,
  type DraggableData,
  type DroppableData,
} from '@/shared/constants/DND'
import { useSpringOpen } from './useSpringOpen'

interface UseNodeDragHandlersArgs {
  getFolderName: (folderId: string | null) => string
  onMove: (
    dragged: DraggableData,
    toFolderId: string | null,
    toFolderName: string
  ) => void
  onSpringOpen: (folderId: string) => void
}

/** FR-MOV-01/06/08/09: the sensors and the drag events that matter. */
export function useNodeDragHandlers({
  getFolderName,
  onMove,
  onSpringOpen,
}: UseNodeDragHandlersArgs) {
  const { arm, cancel } = useSpringOpen(onSpringOpen)
  /**
   * What is being carried. Held here rather than read from dnd-kit's `active`
   * at render time, because the row that started the drag is unmounted the
   * moment a folder springs open — this is the only copy left to draw.
   */
  const [dragged, setDragged] = useState<DraggableData | null>(null)

  const sensors = useSensors(
    // A short travel threshold keeps a plain click selecting the row.
    useSensor(PointerSensor, {
      activationConstraint: { distance: DND.activationDistance },
    }),
    // FR-MOV-08: Space grabs, arrows move, Space drops, Esc cancels.
    useSensor(KeyboardSensor)
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDragged((active.data.current as DraggableData | undefined) ?? null)
  }

  const handleDragOver = ({ over }: DragOverEvent) => {
    const data = over?.data.current as DroppableData | undefined
    // Only list rows spring open; breadcrumbs and the sidebar do not.
    arm(data?.springOpen ? data.folderId : null)
  }

  const handleDragEnd = ({ over }: DragEndEvent) => {
    cancel()
    setDragged(null)

    // FR-MOV-09: released outside a valid target — nothing changes.
    if (!over) return

    const target = over.data.current as DroppableData | undefined
    /**
     * Deliberately not `active.data`: dnd-kit reads that off the mounted row,
     * and after a spring-open the row is gone and the payload with it. What
     * was captured on drag start is the copy that survives.
     */
    const source = dragged
    if (!target || !source) return

    // FR-MOV-06: after a spring-open the node is already where it was dropped.
    if (target.folderId === source.fromFolderId) return

    onMove(source, target.folderId, getFolderName(target.folderId))
  }

  const handleDragCancel = () => {
    cancel()
    setDragged(null)
  }

  return {
    sensors,
    dragged,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}
