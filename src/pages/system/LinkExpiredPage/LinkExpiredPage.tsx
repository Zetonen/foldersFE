import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/moduls/ErrorState'
import { ROUTES } from '@/shared/constants/ROUTES'
import { useNoIndex } from '@/shared/hooks/useNoIndex'

/** FR-PUB-05: a revoked or expired share token. */
export function LinkExpiredPage() {
  const navigate = useNavigate()
  // FR-PUB-08: still a share URL, so it stays out of search results.
  useNoIndex()

  return (
    <main className="flex min-h-full items-center justify-center bg-page">
      <ErrorState
        title="This link is no longer available"
        description="The owner turned off sharing, or the link was revoked."
        actionLabel="Back to home"
        onAction={() => navigate(ROUTES.rooms)}
      />
    </main>
  )
}
