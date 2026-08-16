import { toast } from 'sonner'
import { ERROR_MESSAGES } from '@/shared/constants/ERROR_MESSAGES'

interface ShowErrorToastOptions {
  /** FR-ERR-01: a retry affordance for network and 5xx failures. */
  action?: { label: string; onClick: () => void }
}

/**
 * FR-ERR-03: identical toasts are not stacked — the message itself is used as
 * the toast id, so a repeated failure updates the existing toast in place.
 * Aborted requests are swallowed.
 */
export function showErrorToast(
  message: string = ERROR_MESSAGES.default,
  options: ShowErrorToastOptions = {}
) {
  if (message === ERROR_MESSAGES.abort) return

  toast.error(message, { id: message, action: options.action })
}
