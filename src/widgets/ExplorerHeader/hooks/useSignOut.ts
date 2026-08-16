import { useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/api'
import { ROUTES } from '@/shared/constants/ROUTES'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { sessionCleared } from '@/store'

/** Ends the session and returns to the sign-in screen. */
export function useSignOut(): () => Promise<void> {
  const [logout] = useLogoutMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return async () => {
    // The cookie is best-effort; the local session is cleared either way.
    await logout()
      .unwrap()
      .catch(() => undefined)

    dispatch(sessionCleared())
    navigate(ROUTES.login, { replace: true })
  }
}
