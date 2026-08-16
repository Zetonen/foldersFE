import { useEffect, useRef } from 'react'
import { useRefreshMutation } from '@/api'
import { useAppDispatch } from './useAppDispatch'
import { useAppSelector } from './useAppSelector'
import {
  selectAuthStatus,
  sessionCleared,
  sessionLoading,
  sessionStarted,
} from '@/store'

/**
 * FR-STATE-04: the access token is never persisted, so on every fresh load the
 * session is rebuilt from the httpOnly `refresh_token` cookie.
 *
 * Until this settles, `status` stays `idle`/`loading` and the route guards
 * hold a loader — otherwise a reload on a deep link would bounce the user to
 * the login screen before the session had a chance to come back.
 */
export function useSessionBootstrap(): void {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectAuthStatus)
  const [refresh] = useRefreshMutation()
  // StrictMode mounts effects twice in development; the session is restored once.
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || status !== 'idle') return
    startedRef.current = true

    dispatch(sessionLoading())

    refresh()
      .unwrap()
      .then((response) => dispatch(sessionStarted(response)))
      // A missing or expired cookie is the normal signed-out case, not an error.
      .catch(() => dispatch(sessionCleared()))
  }, [dispatch, refresh, status])
}
