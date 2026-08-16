import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useGetFileDownloadUrlQuery, useGetFileQuery } from '@/api'
import { ErrorState } from '@/components/moduls/ErrorState'
import { FileViewerModal } from '@/widgets/FileViewerModal'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { SHARED_WITH_ME_ROUTE } from '@/shared/constants/ROUTES'
import { isAppError } from '@/types'

/**
 * Where to return on close. A file reached from inside a shared folder goes
 * back to that folder; one opened straight from the list goes back to the list.
 */
const readReturnPath = (state: unknown): string => {
  if (typeof state !== 'object' || state === null) return SHARED_WITH_ME_ROUTE

  const { from } = state as { from?: unknown }
  return typeof from === 'string' ? from : SHARED_WITH_ME_ROUTE
}

/**
 * A file someone shared directly, opened on its own.
 *
 * A share is held on the file and nothing else: the room answers 404, and so
 * does the folder the file sits in. That rules out everything the viewer
 * normally borrows from its surroundings — there is no listing behind it, no
 * previous/next among siblings, and no folder to move the file into. Two
 * requests are all this screen needs, and all it is entitled to.
 *
 * Ownership never reaches here either. A share always grants `VIEWER`, so no
 * mutating action is offered rather than being offered and refused.
 */
export function SharedWithMeFilePage() {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const file = useGetFileQuery({ fileId: fileId ?? '' }, { skip: !fileId })
  const link = useGetFileDownloadUrlQuery(
    { fileId: fileId ?? '' },
    { skip: !fileId || file.isError }
  )

  if (!fileId) return null

  const close = () =>
    navigate(readReturnPath(location.state), { replace: true })

  // FR-VIEW-12: the file went away while it was open, or the share was revoked.
  const isGone =
    isAppError(file.error) && file.error.status === HTTP_STATUS.notFound

  return (
    <FileViewerModal
      name={file.data?.name ?? ''}
      sizeBytes={file.data?.sizeBytes ?? 0}
      url={link.data?.url}
      isLoading={file.isLoading || link.isFetching}
      onRetry={link.refetch}
      onClose={close}
      body={
        isGone ? (
          <ErrorState
            title="This file is no longer available"
            actionLabel="Back"
            onAction={close}
          />
        ) : undefined
      }
    />
  )
}
