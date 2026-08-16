import { useDeleteDataRoomMutation } from '@/api'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { showSuccessToast } from '@/shared/helpers/toasts/showSuccessToast'
import { isAppError } from '@/types'

interface UseDeleteRoomArgs {
  room: { id: string; name: string } | null
  onOpenChange: (open: boolean) => void
}

/** FR-ROOMS-07: removes the room and everything under it. */
export function useDeleteRoom({ room, onOpenChange }: UseDeleteRoomArgs) {
  const [deleteRoom, { isLoading }] = useDeleteDataRoomMutation()

  const confirm = async () => {
    if (!room) return

    try {
      await deleteRoom(room.id).unwrap()
      showSuccessToast(`Deleted “${room.name}”`)
      onOpenChange(false)
    } catch (error) {
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }

  return { confirm, isLoading }
}
