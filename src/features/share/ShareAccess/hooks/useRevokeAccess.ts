import { useRevokeShareMutation } from '@/api'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { isAppError } from '@/types'

/** FR-SHR-06: takes one person's access away. */
export function useRevokeAccess(resourceId: string) {
  const [revokeShare] = useRevokeShareMutation()

  return async (shareId: string) => {
    try {
      await revokeShare({ id: shareId, resourceId }).unwrap()
    } catch (error) {
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }
}
