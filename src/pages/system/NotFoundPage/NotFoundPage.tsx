import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/moduls/ErrorState'
import { ROUTES } from '@/shared/constants/ROUTES'

/** Edge case 11: an unknown address, or a node that has been deleted. */
export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-full items-center justify-center bg-page">
      <ErrorState
        title="This item no longer exists"
        description="It may have been deleted, or the address may be wrong."
        actionLabel="Back to home"
        onAction={() => navigate(ROUTES.rooms)}
      />
    </main>
  )
}
