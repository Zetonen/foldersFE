import { useState, type DragEvent } from 'react'
import type { FolderItem } from '@/types'

/**
 * FR-UPL-04: files dragged in from the operating system arrive as native drag
 * events, which dnd-kit's pointer sensor never sees — so a row can accept both
 * kinds of drag without the two interfering.
 */
export function useFileDropTarget(
  item: FolderItem,
  onFilesDropped?: (folder: FolderItem, files: File[]) => void
) {
  const [isOver, setIsOver] = useState(false)

  const accepts = item.type === 'FOLDER' && Boolean(onFilesDropped)

  if (!accepts) return { isOver: false, handlers: {} }

  return {
    isOver,
    handlers: {
      onDragOver: (event: DragEvent<HTMLElement>) => {
        if (!event.dataTransfer.types.includes('Files')) return
        event.preventDefault()
        event.stopPropagation()
        setIsOver(true)
      },
      onDragLeave: () => setIsOver(false),
      onDrop: (event: DragEvent<HTMLElement>) => {
        const files = Array.from(event.dataTransfer.files)
        if (files.length === 0) return
        event.preventDefault()
        event.stopPropagation()
        setIsOver(false)
        onFilesDropped?.(item, files)
      },
    },
  }
}
