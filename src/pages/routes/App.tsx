import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/ROUTES'
import { AppShell } from './AppShell'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { PageLoader } from '@/components/moduls/PageLoader'
import { PrivateRoute } from './PrivateRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { RouteErrorBoundary } from './RouteErrorBoundary'

// FR-LAZY-01: authentication screens and the Explorer ship in the main chunk;
// everything else is split out.
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage'
import { ExplorerPage } from '@/pages/rooms/ExplorerPage'

const RoomsPage = lazy(async () => ({
  default: (await import('@/pages/rooms/RoomsPage')).RoomsPage,
}))
const FileViewPage = lazy(async () => ({
  default: (await import('@/pages/rooms/FileViewPage')).FileViewPage,
}))
const SharedExplorerPage = lazy(async () => ({
  default: (await import('@/pages/share/SharedExplorerPage'))
    .SharedExplorerPage,
}))
const SharedWithMeFilePage = lazy(async () => ({
  default: (await import('@/pages/share/SharedWithMeFilePage'))
    .SharedWithMeFilePage,
}))
const SharedFilePage = lazy(async () => ({
  default: (await import('@/pages/share/SharedFilePage')).SharedFilePage,
}))
const ForbiddenPage = lazy(async () => ({
  default: (await import('@/pages/system/ForbiddenPage')).ForbiddenPage,
}))
const NotFoundPage = lazy(async () => ({
  default: (await import('@/pages/system/NotFoundPage')).NotFoundPage,
}))
const LinkExpiredPage = lazy(async () => ({
  default: (await import('@/pages/system/LinkExpiredPage')).LinkExpiredPage,
}))

/** FR-LAZY-01: every split page renders inside its own Suspense boundary. */
const suspended = (Component: ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    // FR-ERR-05: a render failure is contained to the routed screen.
    errorElement: <RouteErrorBoundary />,
    children: [
      // ── guest only ──────────────────────────────────────────────────
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: ROUTES.login, element: <LoginPage /> },
              { path: ROUTES.register, element: <RegisterPage /> },
            ],
          },
        ],
      },
      // Reachable while signed out — it is what establishes the session.
      { path: ROUTES.authCallback, element: <AuthCallbackPage /> },

      // ── authenticated ───────────────────────────────────────────────
      {
        element: <PrivateRoute />,
        children: [
          {
            path: ROUTES.home,
            element: <Navigate to={ROUTES.rooms} replace />,
          },
          { path: ROUTES.rooms, element: suspended(RoomsPage) },
          {
            path: ROUTES.room,
            element: <ExplorerPage />,
            children: [
              // FR-VIEW-01: the viewer is a modal layered over the explorer.
              {
                path: 'file/:fileId',
                element: suspended(FileViewPage),
              },
            ],
          },
          { path: ROUTES.roomFolder, element: <ExplorerPage /> },

          /**
           * A file held by a share of its own. Deliberately a sibling of the
           * room routes rather than a child: mounting the explorer behind it
           * would list a data room the viewer has no right to read.
           */
          { path: ROUTES.sharedFile, element: suspended(SharedWithMeFilePage) },
        ],
      },

      // ── share links ─────────────────────────────────────────────────
      // FR-PUB-01: deliberately outside the auth guard. The token is the
      // credential, and the endpoints behind these screens are anonymous —
      // requiring a session here would make a public link private, which is
      // the one thing it exists not to be. A signed-in visitor is welcome too.
      {
        path: ROUTES.share,
        element: suspended(SharedExplorerPage),
        children: [
          { path: 'file/:fileId', element: suspended(SharedFilePage) },
        ],
      },
      {
        path: ROUTES.shareFolder,
        element: suspended(SharedExplorerPage),
      },

      // ── system ──────────────────────────────────────────────────────
      { path: ROUTES.forbidden, element: suspended(ForbiddenPage) },
      { path: ROUTES.notFound, element: suspended(NotFoundPage) },
      { path: ROUTES.linkExpired, element: suspended(LinkExpiredPage) },
      { path: '*', element: suspended(NotFoundPage) },
    ],
  },
])

export default router
