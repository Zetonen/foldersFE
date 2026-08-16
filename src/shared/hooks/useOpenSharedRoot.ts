import { useNavigate } from 'react-router-dom'
import { useLazyResolveFolderRoomQuery } from '@/api'
import { getRoute } from '@/shared/helpers/getRoute'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { isAppError, type ShareResourceType } from '@/types'

interface SharedRoot {
  id: string
  type: ShareResourceType
}

/**
 * Opens whatever `/shared-with-me` handed back.
 *
 * A data room can be addressed directly, but a shared folder or file only
 * carries its own id — and every explorer URL needs the data room too, so it
 * takes one lookup to build the address.
 *
 * The room is read off `folder.dataRoomId`, not off the `dataRoom` reference:
 * for a recipient the latter is deliberately `null`, because the name of a
 * room above the shared root is not theirs to see. The id on the folder is
 * always populated and is all the URL needs.
 */
export function useOpenSharedRoot(): (root: SharedRoot) => Promise<void> {
  const navigate = useNavigate()
  const [resolveFolder] = useLazyResolveFolderRoomQuery()

  return async (root) => {
    try {
      if (root.type === 'DATA_ROOM') {
        navigate(getRoute('room', { roomId: root.id }))
        return
      }

      if (root.type === 'FOLDER') {
        const contents = await resolveFolder(root.id).unwrap()
        const roomId = contents.folder?.dataRoomId

        if (!roomId) {
          showErrorToast()
          return
        }

        navigate(getRoute('roomFolder', { roomId, folderId: root.id }))
        return
      }

      /**
       * A file needs no lookup at all. It used to be resolved to its data
       * room so the viewer could open over that room's explorer — but a share
       * on a file grants nothing above the file, so the room answered 404 and
       * took the whole screen down with it. Its own route needs no room id.
       */
      navigate(getRoute('sharedFile', { fileId: root.id }))
    } catch (error) {
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }
}
