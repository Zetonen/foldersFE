import { useEffect } from 'react'

/**
 * FR-UPL-22: closing the tab while a transfer is in flight triggers the
 * browser's own confirmation prompt.
 */
export function useBeforeUnload(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled])
}
