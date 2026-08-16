import { useNavigate, useParams } from 'react-router-dom'
import { useGetFileDownloadUrlQuery, useGetFileQuery } from '@/api'
import { ErrorState } from '@/components/moduls/ErrorState'
import { FileViewerModal } from '@/widgets/FileViewerModal'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { getRoute } from '@/shared/helpers/getRoute'
import { useNoIndex } from '@/shared/hooks/useNoIndex'
import { isAppError } from '@/types'

/**
 * FR-PUB-04: the viewer behind a share link. Authorisation travels as the
 * share token, so no ownership is involved and no actions are offered.
 */
export function SharedFilePage() {
  const { token, fileId } = useParams()
  const navigate = useNavigate()

  // FR-PUB-08.
  useNoIndex()

  const file = useGetFileQuery(
    { fileId: fileId ?? '', shareToken: token },
    { skip: !fileId || !token }
  )
  const link = useGetFileDownloadUrlQuery(
    { fileId: fileId ?? '', shareToken: token },
    { skip: !fileId || !token || file.isError }
  )

  if (!token || !fileId) return null

  const close = () => navigate(getRoute('share', { token }), { replace: true })

  // FR-PUB-07: the item was deleted while it was being looked at.
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
            title="This item has been deleted"
            actionLabel="Back"
            onAction={close}
          />
        ) : undefined
      }
    />
  )
}
