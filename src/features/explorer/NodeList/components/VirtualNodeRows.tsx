import type { RefObject } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { LIST } from '@/shared/constants/LIST'
import type { FolderItem } from '@/types'
import type { NodeActions } from '../types/NodeActions'
import type { NodeDndState } from '../types/NodeDndState'
import { NodeRow } from './NodeRow'

interface VirtualNodeRowsProps {
  items: FolderItem[]
  scrollRef: RefObject<HTMLDivElement | null>
  ownerLabel: string
  selectedId: string | null
  actions: NodeActions
  onSelect: (item: FolderItem) => void
  onFilesDropped?: (folder: FolderItem, files: File[]) => void
  dnd: NodeDndState
}

/**
 * FR-EXP-17: the windowed branch of the content list, used past 200 rows.
 *
 * Kept in its own component so that React Compiler only skips memoising this
 * one — `useVirtualizer` returns fresh functions on every render, which the
 * compiler cannot safely memoise.
 */
export function VirtualNodeRows({
  items,
  scrollRef,
  ownerLabel,
  selectedId,
  actions,
  onSelect,
  onFilesDropped,
  dnd,
}: VirtualNodeRowsProps) {
  // Expected: React Compiler cannot memoise the virtualizer's functions, so it
  // opts this component out. That is contained here by design — see above.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    // Row height is fixed by the shared token, so no measurement is needed.
    estimateSize: () => LIST.rowHeight,
    overscan: 8,
  })

  return (
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const item = items[virtualRow.index]
        if (!item) return null

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <NodeRow
              item={item}
              selected={selectedId === item.id}
              ownerLabel={ownerLabel}
              actions={actions}
              onSelect={onSelect}
              onFilesDropped={onFilesDropped}
              {...dnd}
            />
          </div>
        )
      })}
    </div>
  )
}
