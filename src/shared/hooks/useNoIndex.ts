import { useEffect } from 'react'

/**
 * FR-PUB-08: pages reachable through a share link ask search engines to stay
 * away. The tag is added on mount and removed on leave, so it never lingers
 * on the owner's own screens.
 */
export function useNoIndex(): void {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    return () => {
      document.head.removeChild(meta)
    }
  }, [])
}
