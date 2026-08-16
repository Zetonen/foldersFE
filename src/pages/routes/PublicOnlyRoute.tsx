import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { readNextParam } from '@/shared/helpers/auth/nextParam'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectAuthStatus } from '@/store'
import { PageLoader } from '@/components/moduls/PageLoader'

/**
 * FR-AUTH-06: a signed-in user has no business on `/login` or `/register` —
 * they are forwarded to `next`, or to `/rooms`.
 */
export function PublicOnlyRoute() {
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()

  if (status === 'idle' || status === 'loading') return <PageLoader />

  if (status === 'authenticated') {
    return <Navigate to={readNextParam(location.search)} replace />
  }

  return <Outlet />
}
