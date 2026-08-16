import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { ROUTES, SHARED_WITH_ME_ROUTE } from '@/shared/constants/ROUTES'
import { getRoute } from '@/shared/helpers/getRoute'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { sidebarClosed } from '@/store'
import { isAppError, type FolderItem } from '@/types'

interface UseExplorerNavigationArgs {
  roomId: string
  currentFolderId: string | null
  /** FR-PERM-04: decides where a dead end sends the user back to. */
  isGuest: boolean
  /** The listing's failure, watched for the folder having gone away. */
  error: unknown
}

/**
 * Every way of leaving the folder on screen: on purpose, and by accident.
 */
export function useExplorerNavigation({
  roomId,
  currentFolderId,
  isGuest,
  error,
}: UseExplorerNavigationArgs) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  /**
   * FR-EXP-27 / edge case 11: the folder went away under the user. Fall back to
   * the closest place that is known to still exist.
   *
   * Which place that is depends on who is asking. For a guest the room root is
   * not a fallback at all — it answers 404 just as readily, so bouncing them
   * there only produces a second failure and a second toast. Their nearest
   * solid ground is the list of what has been shared with them.
   */
  useEffect(() => {
    if (!isAppError(error) || error.status !== HTTP_STATUS.notFound) return

    if (isGuest) {
      showErrorToast('This is no longer shared with you.')
      navigate(SHARED_WITH_ME_ROUTE, { replace: true })
      return
    }

    showErrorToast('That folder no longer exists. Showing the closest one.')
    navigate(currentFolderId ? getRoute('room', { roomId }) : ROUTES.rooms, {
      replace: true,
    })
  }, [error, isGuest, currentFolderId, roomId, navigate])

  const navigateToFolder = (targetId: string | null) => {
    dispatch(sidebarClosed())
    navigate(
      targetId
        ? getRoute('roomFolder', { roomId, folderId: targetId })
        : getRoute('room', { roomId })
    )
  }

  // FR-EXP-15: folders navigate, files open the viewer.
  const openItem = (item: FolderItem) => {
    if (item.type === 'FOLDER') {
      navigateToFolder(item.id)
      return
    }

    /**
     * The viewer normally opens as a modal over this explorer, which means
     * mounting the room route underneath it. A guest cannot read that room, so
     * the file gets its own screen — and a way back to the folder they were in.
     */
    if (isGuest) {
      navigate(getRoute('sharedFile', { fileId: item.id }), {
        state: { from: `${location.pathname}${location.search}` },
      })
      return
    }

    navigate(getRoute('roomFile', { roomId, fileId: item.id }))
  }

  return { navigateToFolder, openItem }
}
