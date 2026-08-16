import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { RouterProvider } from 'react-router-dom'

import '@/styles/index.css'

import { setRateLimitedHandler, setUnauthorizedHandler } from '@/api'
import { persistor, store } from '@/store'
import { sessionCleared } from '@/store/slices/auth/auth.slice'
import { rateLimited } from '@/store'
import { router } from '@/pages/routes'
import { ERROR_MESSAGES } from '@/shared/constants/ERROR_MESSAGES'
import { ROUTES } from '@/shared/constants/ROUTES'
import { withNextParam } from '@/shared/helpers/auth/nextParam'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { PageLoader } from '@/components/moduls/PageLoader'
import type { NullableElement } from '@/types'

/**
 * FR-AUTH-13: a 401 on any request clears the session, explains why, and
 * bounces to the login screen with the current path saved in `next`.
 */
setUnauthorizedHandler(() => {
  store.dispatch(sessionCleared())
  showErrorToast(ERROR_MESSAGES.unauthorized)

  const { pathname, search } = window.location
  void router.navigate(withNextParam(ROUTES.login, `${pathname}${search}`), {
    replace: true,
  })
})

/**
 * FR-ERR-01 (429): the server asked for a pause, so every action that would
 * hit it is held back until the window closes.
 */
setRateLimitedHandler((retryAfterMs) => {
  store.dispatch(rateLimited(Date.now() + retryAfterMs))
  showErrorToast(ERROR_MESSAGES.tooManyRequests)
})

const rootElement: NullableElement<HTMLDivElement> =
  document.querySelector('div#root')

if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<PageLoader />} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>
)
