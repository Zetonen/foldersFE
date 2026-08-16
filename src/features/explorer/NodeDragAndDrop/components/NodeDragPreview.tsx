import { NodeIcon } from '@/components/moduls/NodeIcon'
import { UserText } from '@/components/moduls/UserText'
import type { FolderItem } from '@/types'

interface NodeDragPreviewProps {
  item: FolderItem
}

/**
 * FR-MOV-03: what the cursor carries during a drag.
 *
 * It is a copy rather than the row itself, which is what lets a drag outlive
 * the listing that started it: a folder that springs open (FR-MOV-06) replaces
 * every row on screen, and the node being carried has to stay visible through
 * that.
 */
export function NodeDragPreview({ item }: NodeDragPreviewProps) {
  return (
    <div className="flex max-w-xs cursor-grabbing items-center gap-2.5 rounded-lg border border-brand/40 bg-card px-3 py-2 shadow-lg">
      <NodeIcon type={item.type} className="size-5 shrink-0" />
      <UserText className="truncate text-sm font-medium text-foreground">
        {item.name}
      </UserText>
    </div>
  )
}
