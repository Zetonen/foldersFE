import { GRID } from '@/shared/constants/LIST'
import type { FolderItem } from '@/types'
import type { NodeActions } from '../types/NodeActions'
import type { NodeDndState } from '../types/NodeDndState'
import { NodeCard } from './NodeCard'

interface NodeGridProps {
  items: FolderItem[]
  selectedId: string | null
  actions: NodeActions
  onSelect: (item: FolderItem) => void
  onFilesDropped?: (folder: FolderItem, files: File[]) => void
  dnd: NodeDndState
}

/**
 * FR-EXP-11: the grid layout of the folder contents.
 *
 * Folders are not separated from files into their own band: the server already
 * returns folders first (FR-EXP-13), so they lead the grid on their own, and a
 * second heading would only cost a row of vertical space.
 *
 * Deliberately not virtualised, unlike the table (FR-EXP-17): the number of
 * columns depends on the width of the container, so a windowed grid would have
 * to measure and re-measure it on every resize. Paging still caps what is in
 * the DOM — the list grows 50 nodes at a time as the user scrolls.
 */
export function NodeGrid({
  items,
  selectedId,
  actions,
  onSelect,
  onFilesDropped,
  dnd,
}: NodeGridProps) {
  return (
    <div
      className="grid gap-3 p-4"
      // Cards claim a minimum width and share out the rest, so the column
      // count follows the container rather than a list of breakpoints.
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${GRID.minCardWidth}px, 1fr))`,
      }}
    >
      {items.map((item) => (
        <NodeCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          actions={actions}
          onSelect={onSelect}
          onFilesDropped={onFilesDropped}
          {...dnd}
        />
      ))}
    </div>
  )
}
