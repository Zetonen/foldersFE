import { DatabaseIcon } from 'lucide-react'
import { NodeIcon } from '@/components/moduls/NodeIcon'
import { UserText } from '@/components/moduls/UserText'
import type { RoomListItem } from '../types/RoomListItem'
import { DataRoomActionsMenu } from './DataRoomActionsMenu'

interface DataRoomCardProps {
  room: RoomListItem
  onOpen: (room: RoomListItem) => void
  onRename: (room: RoomListItem) => void
  onShare: (room: RoomListItem) => void
  onDelete: (room: RoomListItem) => void
}

/**
 * FR-ROOMS-02: icon and name only — no size, item count or dates.
 * FR-ROOMS-03: the whole card opens the data room.
 */
export function DataRoomCard({
  room,
  onOpen,
  onRename,
  onShare,
  onDelete,
}: DataRoomCardProps) {
  const open = () => onOpen(room)

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          open()
        }}
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors outline-none hover:border-brand/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-selected text-brand"
        >
          {room.type === 'DATA_ROOM' ? (
            <DatabaseIcon className="size-5" strokeWidth={1.75} />
          ) : (
            <NodeIcon
              type={room.type === 'FOLDER' ? 'FOLDER' : 'FILE'}
              className="size-5"
            />
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <UserText
            className="truncate text-sm font-medium text-foreground"
            title={room.name}
          >
            {room.name}
          </UserText>
          {/* Left translatable: this is "me" as often as it is a person. */}
          <span className="truncate text-xs text-muted-foreground">
            {room.ownerLabel}
          </span>
        </span>

        {/* FR-ROOMS-06: the menu exists for the owner only. */}
        {room.canManage && room.type === 'DATA_ROOM' ? (
          <DataRoomActionsMenu
            room={room}
            onRename={onRename}
            onShare={onShare}
            onDelete={onDelete}
          />
        ) : null}
      </div>
    </li>
  )
}
