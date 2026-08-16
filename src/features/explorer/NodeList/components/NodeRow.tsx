import { MoreVerticalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NodeIcon } from '@/components/moduls/NodeIcon'
import { UserText } from '@/components/moduls/UserText'
import { cn } from '@/shared/helpers/cn'
import { LIST } from '@/shared/constants/LIST'
import { NODE_COLUMNS } from '../constants/columns'
import type { FolderItem } from '@/types'
import type { NodeActions } from '../types/NodeActions'
import type { NodeDndState } from '../types/NodeDndState'
import { useFileDropTarget } from '../hooks/useFileDropTarget'
import { useNodeRowDnd } from '../hooks/useNodeRowDnd'
import { NodeActionsMenu } from './NodeActionsMenu'

interface NodeRowProps extends NodeDndState {
  item: FolderItem
  selected: boolean
  ownerLabel: string
  actions: NodeActions
  onSelect: (item: FolderItem) => void
  /** FR-UPL-04: files dropped from the desktop onto this folder row. */
  onFilesDropped?: (folder: FolderItem, files: File[]) => void
}

export function NodeRow({
  item,
  selected,
  ownerLabel,
  actions,
  onSelect,
  onFilesDropped,
  ...dnd
}: NodeRowProps) {
  const { setNodeRef, dragProps, isDragging, isOver, refusesDrop } =
    useNodeRowDnd({ item, ...dnd })
  const fileDrop = useFileDropTarget(item, onFilesDropped)

  return (
    <ContextMenu>
      {/* FR-EXP-16: right-click offers exactly the same set as the button. */}
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          {...dragProps}
          {...fileDrop.handlers}
          role="button"
          tabIndex={0}
          // `aria-selected` is not valid on a button; `aria-current` conveys
          // "this is the row the details panel is describing".
          aria-current={selected ? true : undefined}
          style={{ height: LIST.rowHeight }}
          // FR-EXP-14: a single click selects, and only ever one row.
          onClick={() => onSelect(item)}
          // FR-EXP-15: double click opens.
          onDoubleClick={() => actions.onOpen(item)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            actions.onOpen(item)
          }}
          className={cn(
            'group flex items-center border-b border-border px-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            selected
              ? 'bg-selected'
              : 'hover:bg-accent focus-visible:bg-accent',
            // A row sets no cursor of its own: at rest it reads as a list row,
            // and during a drag it inherits the closed hand from `<body>`.
            // FR-MOV-03: a folder lights up when it would take the drop.
            (isOver || fileDrop.isOver) &&
              'bg-selected ring-2 ring-brand ring-inset',
            // FR-MOV-03: the row stays in place, greyed out, while its copy
            // travels with the cursor.
            isDragging && 'opacity-40',
            // FR-MOV-04: last, so it outranks the grab on a refused target.
            refusesDrop && 'cursor-not-allowed'
          )}
        >
          <div className={cn('flex items-center gap-3', NODE_COLUMNS.name)}>
            <NodeIcon type={item.type} className="size-5 shrink-0" />
            {/* FR-EXP-12 / edge case 15: truncated, full name in the tooltip. */}
            <UserText
              className="truncate text-sm text-foreground"
              title={item.name}
            >
              {item.name}
            </UserText>
          </div>

          {/* FR-EXP-12: the owner column folds away below 900px. */}
          <span
            className={cn(
              'truncate text-sm text-muted-foreground',
              NODE_COLUMNS.owner
            )}
          >
            {ownerLabel}
          </span>

          <div className={cn('flex justify-end', NODE_COLUMNS.actions)}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More actions"
                  // The row is draggable, so the menu must not start a drag.
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelect(item)
                  }}
                  className={cn(
                    'text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100',
                    selected && 'opacity-100'
                  )}
                >
                  <MoreVerticalIcon strokeWidth={1.75} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <NodeActionsMenu
                  item={item}
                  actions={actions}
                  Item={DropdownMenuItem}
                  Separator={DropdownMenuSeparator}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <NodeActionsMenu
          item={item}
          actions={actions}
          Item={ContextMenuItem}
          Separator={ContextMenuSeparator}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}
