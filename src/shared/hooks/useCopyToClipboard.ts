import { useCallback, useEffect, useRef, useState } from 'react'

const RESET_DELAY_MS = 2000

/**
 * FR-SHR-10: "Copy link" swaps its icon for a success mark for two seconds.
 */
export function useCopyToClipboard(): {
  copied: boolean
  copy: (value: string) => Promise<boolean>
} {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const copy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), RESET_DELAY_MS)
      return true
    } catch {
      return false
    }
  }, [])

  return { copied, copy }
}
