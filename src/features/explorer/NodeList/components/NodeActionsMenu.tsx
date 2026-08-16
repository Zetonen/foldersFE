import type { ComponentType } from 'react'
import {
  FolderOpenIcon,
  InfoIcon,
  MoveIcon,
  PencilIcon,
  Share2Icon,
  Trash2Icon,
} from 'lucide-react'
import type { FolderItem } from '@/types'
import type { NodeActions } from '../types/NodeActions'

interface MenuSlots {
  Item: ComponentType<{
    onSelect?: () => void
    variant?: 'default' | 'destructive'
    children: React.ReactNode
  }>
  Separator: ComponentType
}

interface NodeActionsMenuProps extends MenuSlots {
  item: FolderItem
  actions: NodeActions
}

/**
 * The shared item list behind both the row button and the right-click menu.
 * The two menus come from different Radix primitives, so the components that
 * render an item are injected rather than hard-coded.
 */
export function NodeActionsMenu({
  item,
  actions,
  Item,
  Separator,
}: NodeActionsMenuProps) {
  const { onOpen, onDetails, onShare, onRename, onMove, onDelete } = actions
  const hasDestructive = Boolean(onDelete)
  const hasEdits = Boolean(onShare || onRename || onMove)

  return (
    <>
      <Item onSelect={() => onOpen(item)}>
        <FolderOpenIcon strokeWidth={1.75} />
        Open
      </Item>

      {/* FR-EXP-19: the details panel is asked for here, and nowhere else. */}
      {onDetails ? (
        <Item onSelect={() => onDetails(item)}>
          <InfoIcon strokeWidth={1.75} />
          Details
        </Item>
      ) : null}

      {onShare ? (
        <Item onSelect={() => onShare(item)}>
          <Share2Icon strokeWidth={1.75} />
          Share
        </Item>
      ) : null}

      {onRename ? (
        <Item onSelect={() => onRename(item)}>
          <PencilIcon strokeWidth={1.75} />
          Rename
        </Item>
      ) : null}

      {onMove ? (
        <Item onSelect={() => onMove(item)}>
          <MoveIcon strokeWidth={1.75} />
          Move to…
        </Item>
      ) : null}

      {hasEdits && hasDestructive ? <Separator /> : null}

      {onDelete ? (
        <Item variant="destructive" onSelect={() => onDelete(item)}>
          <Trash2Icon strokeWidth={1.75} />
          Delete
        </Item>
      ) : null}
    </>
  )
}
