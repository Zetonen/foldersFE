import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/moduls/ErrorState'
import { ROUTES } from '@/shared/constants/ROUTES'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectUserEmail } from '@/store'

/** FR-PERM-05 / FR-PUB-06. */
export function ForbiddenPage() {
  const navigate = useNavigate()
  const email = useAppSelector(selectUserEmail)

  return (
    <main className="flex min-h-full items-center justify-center bg-page">
      <ErrorState
        title="You need permission to view this item"
        // Naming the account explains the most common cause: the wrong one.
        description={email ? `You are signed in as ${email}.` : undefined}
        actionLabel="Back to home"
        onAction={() => navigate(ROUTES.rooms)}
      />
    </main>
  )
}
