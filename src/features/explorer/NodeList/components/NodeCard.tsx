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
import type { FolderItem } from '@/types'
import type { NodeActions } from '../types/NodeActions'
import type { NodeDndState } from '../types/NodeDndState'
import { useFileDropTarget } from '../hooks/useFileDropTarget'
import { useNodeRowDnd } from '../hooks/useNodeRowDnd'
import { NodeActionsMenu } from './NodeActionsMenu'

interface NodeCardProps extends NodeDndState {
  item: FolderItem
  selected: boolean
  actions: NodeActions
  onSelect: (item: FolderItem) => void
  /** FR-UPL-04: files dropped from the desktop onto this folder card. */
  onFilesDropped?: (folder: FolderItem, files: File[]) => void
}

/**
 * FR-EXP-11: one node as a card.
 *
 * The same node as `NodeRow`, laid out differently — select, open, the actions
 * menu, the context menu, dragging and the desktop-file drop all come from the
 * same hooks, so the two views cannot drift apart in what they can do.
 */
export function NodeCard({
  item,
  selected,
  actions,
  onSelect,
  onFilesDropped,
  ...dnd
}: NodeCardProps) {
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
          aria-current={selected ? true : undefined}
          // FR-EXP-14/15: one click selects, two open — as in the list.
          onClick={() => onSelect(item)}
          onDoubleClick={() => actions.onOpen(item)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            actions.onOpen(item)
          }}
          className={cn(
            'group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
            selected ? 'border-brand/40 bg-selected' : 'hover:bg-accent',
            (isOver || fileDrop.isOver) && 'bg-selected ring-2 ring-brand',
            isDragging && 'opacity-40',
            refusesDrop && 'cursor-not-allowed'
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <NodeIcon type={item.type} className="size-4.5 shrink-0" />
            <UserText
              className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
              title={item.name}
            >
              {item.name}
            </UserText>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More actions"
                  // The card is draggable, so the menu must not start a drag.
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelect(item)
                  }}
                  className={cn(
                    '-mr-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100',
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

          {/*
            No thumbnail: a preview costs a signed URL and a render per file,
            and the API has none to give. A large icon says what the node is
            without promising a picture that is not there.
          */}
          <div className="flex h-28 items-center justify-center rounded-lg bg-muted">
            <NodeIcon type={item.type} className="size-9" strokeWidth={1.25} />
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
