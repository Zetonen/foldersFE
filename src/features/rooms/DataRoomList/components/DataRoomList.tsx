import type { ReactNode } from 'react'
import { DatabaseIcon, InboxIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/moduls/EmptyState'
import { ErrorState } from '@/components/moduls/ErrorState'
import type { RoomsTab } from '@/types'
import type { RoomListItem } from '../types/RoomListItem'
import { DataRoomCard } from './DataRoomCard'

interface DataRoomListProps {
  tab: RoomsTab
  rooms: RoomListItem[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onOpen: (room: RoomListItem) => void
  onRename: (room: RoomListItem) => void
  onShare: (room: RoomListItem) => void
  onDelete: (room: RoomListItem) => void
  /** FR-ROOMS-08: the empty "My data rooms" tab offers a way to create one. */
  emptyAction?: ReactNode
}

export function DataRoomList({
  tab,
  rooms,
  isLoading,
  isError,
  onRetry,
  onOpen,
  onRename,
  onShare,
  onDelete,
  emptyAction,
}: DataRoomListProps) {
  if (isLoading) return <DataRoomListSkeleton />

  if (isError) {
    return (
      <ErrorState
        title="Your data rooms couldn't be loaded"
        description="Check your connection and try again."
        actionLabel="Try again"
        onAction={onRetry}
      />
    )
  }

  if (!rooms || rooms.length === 0) {
    // FR-ROOMS-09: the "Shared with me" tab has nothing to offer, so no button.
    return tab === 'shared' ? (
      <EmptyState icon={InboxIcon} title="Nothing shared with you yet" />
    ) : (
      <EmptyState
        icon={DatabaseIcon}
        title="No data rooms yet"
        description="Create a data room to start collecting documents."
        action={emptyAction}
      />
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <DataRoomCard
          key={room.id}
          room={room}
          onOpen={onOpen}
          onRename={onRename}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

function DataRoomListSkeleton() {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index}>
          <Skeleton className="h-18.5 rounded-xl" />
        </li>
      ))}
    </ul>
  )
}
