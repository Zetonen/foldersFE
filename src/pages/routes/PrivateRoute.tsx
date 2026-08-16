import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/ROUTES'
import { withNextParam } from '@/shared/helpers/auth/nextParam'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectAuthStatus } from '@/store'
import { PageLoader } from '@/components/moduls/PageLoader'

/**
 * FR-PERM-01 / FR-ROUTE-01: guards everything under `/rooms` and `/share`.
 * An anonymous visitor is sent to `/login` with the path they wanted parked
 * in `next`, so the deep link survives the round trip.
 */
export function PrivateRoute() {
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()

  // `idle` and `loading` mean the boot-time session restore has not settled.
  if (status === 'idle' || status === 'loading') return <PageLoader />

  if (status !== 'authenticated') {
    const target = `${location.pathname}${location.search}`
    return <Navigate to={withNextParam(ROUTES.login, target)} replace />
  }

  return <Outlet />
}
