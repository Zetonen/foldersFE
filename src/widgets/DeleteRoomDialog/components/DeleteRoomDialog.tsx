import { ConfirmDialog } from '@/components/moduls/ConfirmDialog'
import { DELETE_ROOM_COPY } from '../constants/copy'
import { useDeleteRoom } from '../hooks/useDeleteRoom'

interface DeleteRoomDialogProps {
  room: { id: string; name: string } | null
  onOpenChange: (open: boolean) => void
}

/**
 * FR-ROOMS-07: spells out both consequences — the contents go, and everyone
 * it was shared with loses access.
 */
export function DeleteRoomDialog({
  room,
  onOpenChange,
}: DeleteRoomDialogProps) {
  const { confirm, isLoading } = useDeleteRoom({ room, onOpenChange })

  return (
    <ConfirmDialog
      open={room !== null}
      onOpenChange={onOpenChange}
      title={DELETE_ROOM_COPY.title}
      description={
        <>
          <b>{room?.name}</b> — {DELETE_ROOM_COPY.description}
        </>
      }
      confirmLabel={DELETE_ROOM_COPY.confirm}
      destructive
      pending={isLoading}
      onConfirm={confirm}
    />
  )
}
