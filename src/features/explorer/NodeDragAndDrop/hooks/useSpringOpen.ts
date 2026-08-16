import { useCallback, useEffect, useRef } from 'react'
import { DND } from '@/shared/constants/DND'

/**
 * FR-MOV-06: holding a dragged node over a folder row opens that folder, so a
 * node can be carried several levels down in one gesture.
 *
 * The wait is long enough (`DND.springOpenMs`) that crossing a folder on the
 * way somewhere else does not navigate by accident.
 */
export function useSpringOpen(onOpen: (folderId: string) => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const armedForRef = useRef<string | null>(null)

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current)
    armedForRef.current = null
  }, [])

  useEffect(() => cancel, [cancel])

  /** Called on every drag-over; re-arms only when the target changes. */
  const arm = useCallback(
    (folderId: string | null) => {
      if (folderId === null) {
        cancel()
        return
      }
      // Still hovering the same row — let the running timer finish.
      if (armedForRef.current === folderId) return

      cancel()
      armedForRef.current = folderId
      timerRef.current = setTimeout(() => {
        armedForRef.current = null
        onOpen(folderId)
      }, DND.springOpenMs)
    },
    [cancel, onOpen]
  )

  return { arm, cancel }
}
