import { WifiOffIcon } from 'lucide-react'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'

/** FR-EXP-26: shown while the connection is down; uploads pause meanwhile. */
export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div
      role="status"
      className="flex shrink-0 items-center justify-center gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive"
    >
      <WifiOffIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
      Connection lost. Check your internet and try again.
    </div>
  )
}
