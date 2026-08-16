import { toast } from 'sonner'

interface ShowSuccessToastOptions {
  /** FR-MOV-10: a move reports where it landed and offers an undo. */
  action?: { label: string; onClick: () => void }
}

export function showSuccessToast(
  message: string,
  options: ShowSuccessToastOptions = {}
) {
  toast.success(message, { id: message, action: options.action })
}
