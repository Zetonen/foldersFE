import {
  MoreVerticalIcon,
  PencilIcon,
  Share2Icon,
  Trash2Icon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { RoomListItem } from '../types/RoomListItem'

interface DataRoomActionsMenuProps {
  room: RoomListItem
  onRename: (room: RoomListItem) => void
  onShare: (room: RoomListItem) => void
  onDelete: (room: RoomListItem) => void
}

/** FR-ROOMS-06: owner-only actions on a data room card. */
export function DataRoomActionsMenu({
  room,
  onRename,
  onShare,
  onDelete,
}: DataRoomActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="More actions"
          // The card itself is the primary click target.
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVerticalIcon strokeWidth={1.75} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem onSelect={() => onRename(room)}>
          <PencilIcon strokeWidth={1.75} />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onShare(room)}>
          <Share2Icon strokeWidth={1.75} />
          Manage access
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(room)}>
          <Trash2Icon strokeWidth={1.75} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
