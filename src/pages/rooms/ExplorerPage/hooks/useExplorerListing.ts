import { useMemo } from 'react'
import { useGetFolderContentsInfiniteQuery } from '@/api'
import { toBreadcrumbs, trailFolderIds } from '@/api/helpers/toBreadcrumbs'
import { ROUTES, SHARED_WITH_ME_ROUTE } from '@/shared/constants/ROUTES'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectAuthUser } from '@/store'
import { isOwnerRole } from '@/types'

interface UseExplorerListingArgs {
  dataRoomId: string
  /** `null` lists the data room root. */
  folderId: string | null
}

/**
 * One page of the explorer, and everything the screen reads off it.
 *
 * The response answers more than "what is in this folder": it also states who
 * owns the room, what the caller may do there, and the ancestors of the folder
 * on screen. Those answers were previously teased apart in four places of the
 * page; here they are derived once, from the one page that carries them.
 *
 * Every derived flag is deliberately read from the *response* rather than from
 * how the screen was reached, so it keeps holding as the user navigates deeper.
 */
export function useExplorerListing({
  dataRoomId,
  folderId,
}: UseExplorerListingArgs) {
  const query = useGetFolderContentsInfiniteQuery(
    { dataRoomId, folderId },
    { skip: !dataRoomId }
  )

  const pages = query.data?.pages
  /**
   * Every field except `items` is a property of the folder, not of the page, so
   * the first page states them for the whole listing.
   */
  const firstPage = pages?.[0]

  const items = useMemo(
    () => pages?.flatMap((page) => page.items) ?? [],
    [pages]
  )

  /**
   * The path is assembled from three separate fields of the response — the open
   * folder is not part of `breadcrumbs`, and neither is the room name.
   */
  const trail = useMemo(() => toBreadcrumbs(firstPage), [firstPage])

  /** The folder on screen, which is where its own name and parent come from. */
  const openFolder = firstPage?.folder ?? null
  const roomName = firstPage?.dataRoom?.name

  /**
   * FR-EXP-18: how many children the folder has in all, so the list can say
   * how much of it is on screen. It counts direct children only, and it is the
   * same on every page, which is why it is read off the first one.
   */
  const totalItems = firstPage?.totalItems

  /**
   * FR-PERM-04: `dataRoom` is withheld from anyone who arrived through a share
   * below the room, so its absence *is* the signal that this is a guest's view.
   * Nothing above the shared root exists for them — the room root, its listing
   * and every `/rooms/:roomId` URL all answer 404 — so this one flag governs
   * each affordance that would lead there.
   */
  const isGuest = firstPage !== undefined && firstPage.dataRoom === null

  // FR-PERM-02: the backend states the caller's role on the listing itself.
  const isOwner = isOwnerRole(firstPage?.myRole)

  /**
   * FR-EXP-12: the listing states its owner, and everything in it belongs to
   * them. Recognising yourself is a question of identity rather than of role,
   * so it is the id that is compared — `myRole` answers what you may do here,
   * which is not the same question.
   */
  const currentUserId = useAppSelector(selectAuthUser)?.id
  const isMine = firstPage?.ownerId === currentUserId
  const ownerLabel = !firstPage ? '—' : isMine ? 'me' : firstPage.ownerName

  /**
   * FR-EXP-07: the path starts at the list this room was reached from, which is
   * the one it appears in — your own rooms, or the ones shared with you.
   * Withheld until the listing answers, so it cannot name the wrong list for
   * the moment before it does.
   */
  const trailRoot = !firstPage
    ? undefined
    : isMine
      ? { label: 'My data rooms', to: ROUTES.rooms }
      : { label: 'Shared with me', to: SHARED_WITH_ME_ROUTE }

  /**
   * The open folder names itself. It is deliberately not read off the end of
   * `breadcrumbs`, which holds its ancestors — that would name its parent.
   */
  const currentFolderName = openFolder?.name ?? roomName ?? 'this data room'

  /**
   * FR-MOV-05: the path of the folder on screen, itself included. Drop targets
   * compare it against the node being dragged to spot that they are inside its
   * subtree — which is exactly the case once a drag has spring-opened into the
   * dragged folder, and that is only visible if the open folder counts.
   */
  const ancestorIds = trailFolderIds(trail)

  /** FR-CRE-04 / FR-UPL-09: the names a new one would have to avoid. */
  const takenNames = items.map((item) => item.name)

  return {
    query,
    items,
    totalItems,
    trail,
    trailRoot,
    ancestorIds,
    takenNames,
    openFolder,
    roomName,
    currentFolderName,
    ownerLabel,
    isOwner,
    isGuest,
  }
}
