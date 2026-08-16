import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useExchangeGoogleCodeMutation } from '@/api'
import { PageLoader } from '@/components/moduls/PageLoader'
import { QUERY_PARAMS } from '@/shared/constants/QUERY_PARAMS'
import { ROUTES } from '@/shared/constants/ROUTES'
import {
  sanitizeNextPath,
  withNextParam,
} from '@/shared/helpers/auth/nextParam'
import {
  isForeignOAuthState,
  takeOAuthHandoff,
} from '@/shared/helpers/auth/oauthState'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { useAuthSuccess } from '@/shared/hooks/useAuthSuccess'
import {
  GOOGLE_AUTH_CANCELLED,
  GOOGLE_AUTH_ERROR,
} from '@/features/auth/GoogleAuthButton/constants/messages'

/**
 * FR-AUTH-11: nothing but a centred loader while the code is redeemed.
 * FR-AUTH-12: a failure or a cancelled consent screen returns to `/login`.
 */
export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const [exchangeCode] = useExchangeGoogleCodeMutation()
  const onAuthSuccess = useAuthSuccess()
  const navigate = useNavigate()
  // The code is single-use, so StrictMode must not redeem it twice.
  const startedRef = useRef(false)

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  // Google reports a declined or failed consent here, with no `code` alongside.
  const oauthError = searchParams.get('error')
  const nextFromUrl = searchParams.get(QUERY_PARAMS.next)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    /**
     * Taken exactly once, and before any branch can return: whatever happens
     * next, this callback has been spent and its parked values must not be
     * left behind for the following one to pick up.
     */
    const handoff = takeOAuthHandoff()
    // The URL wins if it carries one, but on the way back from Google it never
    // does — the destination survives in what `start` parked.
    const next = sanitizeNextPath(nextFromUrl) ?? handoff.next

    const returnToLogin = (message: string) => {
      showErrorToast(message)
      // `next` is carried through so the deep link survives a failed attempt.
      navigate(next ? withNextParam(ROUTES.login, next) : ROUTES.login, {
        replace: true,
      })
    }

    // Consent was declined, or the provider sent us back with an error. There
    // is nothing to redeem, so the backend is not troubled with it.
    if (oauthError || !code) {
      returnToLogin(
        oauthError === 'access_denied'
          ? GOOGLE_AUTH_CANCELLED
          : GOOGLE_AUTH_ERROR
      )
      return
    }

    /**
     * A `state` this tab never issued means the code belongs to somebody
     * else's sign-in. Redeeming it would quietly put the visitor inside that
     * account, so the flow stops here rather than at the backend.
     */
    if (isForeignOAuthState(state, handoff.state)) {
      returnToLogin(GOOGLE_AUTH_ERROR)
      return
    }

    exchangeCode({ code, state: state ?? undefined })
      .unwrap()
      .then((response) => onAuthSuccess(response, next))
      .catch(() => returnToLogin(GOOGLE_AUTH_ERROR))
  }, [
    code,
    state,
    oauthError,
    nextFromUrl,
    exchangeCode,
    onAuthSuccess,
    navigate,
  ])

  return (
    <main className="flex min-h-full items-center justify-center bg-page">
      <PageLoader label="Signing you in…" />
    </main>
  )
}
