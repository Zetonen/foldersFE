import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from './useAppDispatch'
import { sessionStarted } from '@/store'
import { readNextParam } from '@/shared/helpers/auth/nextParam'
import type { AuthResponse } from '@/types'

/**
 * FR-AUTH-06: a session that has just been established sends the user to the
 * path saved in `next`, or to `/rooms`. Shared by sign-in, sign-up and the
 * OAuth callback so all three land in the same place.
 *
 * `nextPath` is for the callers whose destination is not in the current URL —
 * the OAuth callback arrives at `?code=…&state=…`, having left this origin and
 * come back, and carries what it parked instead.
 */
export function useAuthSuccess(): (
  response: AuthResponse,
  nextPath?: string | null
) => void {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (response: AuthResponse, nextPath?: string | null) => {
      dispatch(sessionStarted(response))
      navigate(nextPath ?? readNextParam(location.search), { replace: true })
    },
    [dispatch, navigate, location.search]
  )
}
