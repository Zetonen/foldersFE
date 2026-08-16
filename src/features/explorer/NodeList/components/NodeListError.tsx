import { ErrorState } from '@/components/moduls/ErrorState'

interface NodeListErrorProps {
  onRetry: () => void
}

/** FR-EXP-25: an inline block with a retry that re-runs the request. */
export function NodeListError({ onRetry }: NodeListErrorProps) {
  return (
    <ErrorState
      title="This folder couldn't be loaded"
      description="Check your connection and try again."
      actionLabel="Try again"
      onAction={onRetry}
    />
  )
}
