import { useState } from 'react'
import { useCreateShareMutation } from '@/api'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { showSuccessToast } from '@/shared/helpers/toasts/showSuccessToast'
import { isAppError, type ShareResourceType } from '@/types'
import { formatSharedWithCount } from '../helpers/formatSharedWithCount'

interface UseShareInviteArgs {
  resourceType: ShareResourceType
  resourceId: string
}

/** FR-SHR-02/03: collecting recipients and granting them access. */
export function useShareInvite({
  resourceType,
  resourceId,
}: UseShareInviteArgs) {
  const [emails, setEmails] = useState<string[]>([])
  const [createShare, { isLoading }] = useCreateShareMutation()

  const submit = async () => {
    try {
      // One share row per recipient, so each can be revoked on its own.
      for (const granteeEmail of emails) {
        await createShare({
          resourceType,
          resourceId,
          kind: 'USER',
          granteeEmail,
        }).unwrap()
      }

      showSuccessToast(formatSharedWithCount(emails.length))
      setEmails([])
    } catch (error) {
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }

  return {
    emails,
    setEmails,
    submit,
    isLoading,
    /** FR-SHR-03: inert until there is at least one valid recipient. */
    canSubmit: emails.length > 0 && !isLoading,
  }
}
