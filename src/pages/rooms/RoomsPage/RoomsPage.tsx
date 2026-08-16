import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlusIcon } from 'lucide-react'
import { useGetDataRoomsQuery, useGetSharedWithMeQuery } from '@/api'
import { Button } from '@/components/ui/button'
import { DataRoomList, type RoomListItem } from '@/features/rooms/DataRoomList'
import { RoomsHeader } from '@/widgets/RoomsHeader'
import { RoomNameModal } from '@/widgets/RoomNameModal'
import { DeleteRoomDialog } from '@/widgets/DeleteRoomDialog'
import { ShareModal, type ShareTarget } from '@/widgets/ShareModal'
import { QUERY_PARAMS } from '@/shared/constants/QUERY_PARAMS'
import { useOpenSharedRoot } from '@/shared/hooks/useOpenSharedRoot'
import { roomsTabSchema, type RoomsTab } from '@/types'

/** FR-ROOMS-01..09: the workspace picker the app opens on. */
export function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // FR-ROOMS-01 / FR-ROUTE-04: the active tab lives in the URL.
  const tab: RoomsTab =
    roomsTabSchema.safeParse(searchParams.get(QUERY_PARAMS.tab)).data ?? 'my'

  const [createOpen, setCreateOpen] = useState(false)
  const [roomToRename, setRoomToRename] = useState<RoomListItem | null>(null)
  const [roomToDelete, setRoomToDelete] = useState<RoomListItem | null>(null)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)
  const openRoot = useOpenSharedRoot()

  // Both tabs are mounted as queries but only the active one runs.
  const owned = useGetDataRoomsQuery(undefined, { skip: tab !== 'my' })
  const shared = useGetSharedWithMeQuery(undefined, { skip: tab !== 'shared' })
  const query = tab === 'my' ? owned : shared

  /**
   * `GET /data-rooms` returns only rooms you own, so those are always
   * manageable. `GET /shared-with-me` returns every kind of shared root, of
   * which this screen shows the data rooms.
   */
  const rooms: RoomListItem[] | undefined =
    tab === 'my'
      ? owned.data?.map((room) => ({
          id: room.id,
          name: room.name,
          type: 'DATA_ROOM' as const,
          ownerLabel: 'me',
          canManage: true,
        }))
      : // A share root can be a room, a folder or a single file — all three
        // are listed, since otherwise they would only be reachable by link.
        shared.data?.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          ownerLabel: item.ownerName,
          canManage: item.myRole === 'OWNER',
        }))

  const handleTabChange = (next: RoomsTab) => {
    setSearchParams(
      (params) => {
        params.set(QUERY_PARAMS.tab, next)
        return params
      },
      { replace: true }
    )
  }

  return (
    <main className="min-h-full bg-page">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <RoomsHeader
          activeTab={tab}
          onTabChange={handleTabChange}
          onCreate={() => setCreateOpen(true)}
        />

        <DataRoomList
          tab={tab}
          rooms={rooms}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={query.refetch}
          onOpen={openRoot}
          onRename={setRoomToRename}
          onShare={(room) =>
            setShareTarget({
              resourceType: 'DATA_ROOM',
              resourceId: room.id,
              name: room.name,
            })
          }
          onDelete={setRoomToDelete}
          emptyAction={
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon strokeWidth={2} />
              New data room
            </Button>
          }
        />
      </div>

      <RoomNameModal open={createOpen} onOpenChange={setCreateOpen} />
      <RoomNameModal
        open={roomToRename !== null}
        onOpenChange={(open) => !open && setRoomToRename(null)}
        room={roomToRename}
      />
      <DeleteRoomDialog
        room={roomToDelete}
        onOpenChange={(open) => !open && setRoomToDelete(null)}
      />
      <ShareModal
        target={shareTarget}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />
    </main>
  )
}
