import axios from 'axios'
import type { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { ENDPOINTS } from '@/shared/constants/ENDPOINTS'
import type { RootState } from '@/types'

const API_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

if (!API_URL) {
  // Fails loudly at boot rather than silently issuing requests to the origin.
  throw new Error('VITE_API_BASE_URL is not set')
}

export const api = axios.create({
  baseURL: API_URL.replace(/\/?$/, '/'),
  timeout: 30_000,
  withCredentials: true,
})

/**
 * FR-STATE-04: the access token lives in memory only. The store is injected
 * once at boot so this module keeps no import cycle back into `src/store`.
 */
let getReduxState: (() => RootState) | null = null
let handleUnauthorized: (() => void) | null = null

export const initApiWithStore = (getState: () => RootState) => {
  getReduxState = getState
}

/**
 * FR-AUTH-13: registered by the app shell — clears `auth` and sends the user
 * to `/login` with the current path saved in `next`.
 */
export const setUnauthorizedHandler = (handler: () => void) => {
  handleUnauthorized = handler
}

let handleRateLimited: ((retryAfterMs: number) => void) | null = null

/** FR-ERR-01 (429): registered by the app shell to open a cooldown window. */
export const setRateLimitedHandler = (
  handler: (retryAfterMs: number) => void
) => {
  handleRateLimited = handler
}

/** Default cooldown when the server does not send `Retry-After`. */
const DEFAULT_RETRY_AFTER_MS = 30_000

/**
 * The cooldown the server asked for, in milliseconds.
 *
 * `Retry-After` is the standard header and is what the backend will settle on.
 * Until then its named auth limiter emits `Retry-After-auth` instead, which is
 * the only header present on a throttled sign-in — so both are read, and a
 * response carrying neither falls back to a fixed window.
 */
const readRetryAfterMs = (
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders
) => {
  const header = headers['retry-after'] ?? headers['retry-after-auth']
  const seconds = Number(header)

  return Number.isFinite(seconds) && seconds > 0
    ? seconds * 1000
    : DEFAULT_RETRY_AFTER_MS
}

api.interceptors.request.use((config) => {
  const token = getReduxState?.().auth.accessToken

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

/**
 * A 401 from these means "these credentials are wrong" or "there is no session
 * to restore" — not "your session expired". Bouncing the user to the login
 * screen from the login screen would be nonsense, so they opt out of the
 * global handler and report the failure themselves.
 */
const SELF_HANDLED_401 = [
  ENDPOINTS.login,
  ENDPOINTS.register,
  ENDPOINTS.refresh,
]

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === HTTP_STATUS.unauthorized
    ) {
      const url = error.config?.url ?? ''
      const selfHandled = SELF_HANDLED_401.some((endpoint) =>
        url.includes(endpoint)
      )

      if (!selfHandled) handleUnauthorized?.()
    }

    if (
      axios.isAxiosError(error) &&
      error.response?.status === HTTP_STATUS.tooManyRequests
    ) {
      handleRateLimited?.(readRetryAfterMs(error.response.headers))
    }

    return Promise.reject(error)
  }
)
