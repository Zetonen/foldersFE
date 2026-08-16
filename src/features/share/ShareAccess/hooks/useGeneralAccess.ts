import { useState } from 'react'
import { useCreateShareMutation, useRevokeShareMutation } from '@/api'
import { getRoute } from '@/shared/helpers/getRoute'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { isAppError, type Share, type ShareResourceType } from '@/types'
import { GENERAL_ACCESS } from '../constants/generalAccess'

interface UseGeneralAccessArgs {
  resourceType: ShareResourceType
  resourceId: string
  link: Share | undefined
}

/** FR-SHR-07..11: creating and revoking the public link. */
export function useGeneralAccess({
  resourceType,
  resourceId,
  link,
}: UseGeneralAccessArgs) {
  const [createShare, { isLoading: isCreating }] = useCreateShareMutation()
  const [revokeShare, { isLoading: isRevoking }] = useRevokeShareMutation()
  const [confirmRestrict, setConfirmRestrict] = useState(false)

  const isPublic = Boolean(link)

  const linkUrl = link?.token
    ? `${window.location.origin}${getRoute('share', { token: link.token })}`
    : null

  const change = async (next: string) => {
    // FR-SHR-09: losing a link is destructive, so it is confirmed first.
    if (next === GENERAL_ACCESS.restricted) {
      setConfirmRestrict(true)
      return
    }

    // FR-SHR-08: choosing "anyone" mints the link in the same action.
    try {
      await createShare({
        resourceType,
        resourceId,
        kind: 'PUBLIC_LINK',
      }).unwrap()
    } catch (error) {
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }

  const revoke = async () => {
    if (!link) return

    try {
      await revokeShare({ id: link.id, resourceId }).unwrap()
      setConfirmRestrict(false)
    } catch (error) {
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }

  return {
    isPublic,
    linkUrl,
    busy: isCreating || isRevoking,
    isRevoking,
    confirmRestrict,
    setConfirmRestrict,
    change,
    revoke,
  }
}
