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
 */
export function useAuthSuccess(): (response: AuthResponse) => void {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (response: AuthResponse) => {
      dispatch(sessionStarted(response))
      navigate(readNextParam(location.search), { replace: true })
    },
    [dispatch, navigate, location.search]
  )
}
