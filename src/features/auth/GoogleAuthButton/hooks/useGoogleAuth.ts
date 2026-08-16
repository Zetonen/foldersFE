import { useLocation } from 'react-router-dom'
import { useLazyGetGoogleAuthUrlQuery } from '@/api'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { QUERY_PARAMS } from '@/shared/constants/QUERY_PARAMS'
import { sanitizeNextPath } from '@/shared/helpers/auth/nextParam'
import { rememberOAuthHandoff } from '@/shared/helpers/auth/oauthState'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { isAppError } from '@/types'
import {
  GOOGLE_AUTH_ERROR,
  GOOGLE_AUTH_UNAVAILABLE,
} from '../constants/messages'

/**
 * FR-AUTH-07: fetches the consent-screen URL and hands the browser over.
 * One flow for both sign-up and sign-in — the account is created on first use.
 */
export function useGoogleAuth() {
  const [getAuthUrl, { isFetching }] = useLazyGetGoogleAuthUrlQuery()
  const location = useLocation()

  const start = async () => {
    const result = await getAuthUrl()

    if (result.data) {
      /**
       * FR-ROUTE-01: the round trip through Google leaves this origin entirely,
       * so `?next=` on the current URL does not survive it. Parked here and
       * picked up by the callback, it is what makes a deep link hold across an
       * OAuth sign-in the same way it does across a password one.
       */
      const next = sanitizeNextPath(
        new URLSearchParams(location.search).get(QUERY_PARAMS.next)
      )

      // Parked for the callback to hand back, so this tab can tell that the
      // flow it is finishing is the one it began.
      rememberOAuthHandoff(result.data.state, next)
      // Full navigation, not a router push — the consent screen is off-origin.
      window.location.assign(result.data.url)
      return
    }

    // 503 means the server has no Google credentials, not that the attempt
    // failed — telling the user to try again would send them in a circle.
    const unavailable =
      isAppError(result.error) &&
      result.error.status === HTTP_STATUS.serviceUnavailable

    showErrorToast(unavailable ? GOOGLE_AUTH_UNAVAILABLE : GOOGLE_AUTH_ERROR)
  }

  return { start, isFetching }
}
