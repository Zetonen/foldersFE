import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { OfflineBanner } from '@/components/moduls/OfflineBanner'
import { useSessionBootstrap } from '@/shared/hooks/useSessionBootstrap'

/**
 * App shell: restores the session, then renders the routed screen with the
 * connection banner and the toast host above it.
 */
export function RootLayout() {
  useSessionBootstrap()

  return (
    <div className="flex h-full flex-col">
      <OfflineBanner />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
      <Toaster />
    </div>
  )
}
