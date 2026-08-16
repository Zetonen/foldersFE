import { useEffect, useState } from 'react'
import { useAppDispatch } from './useAppDispatch'
import { useAppSelector } from './useAppSelector'
import { rateLimitCleared, selectRateLimitedUntil } from '@/store'

/**
 * FR-ERR-01 (429): true while the server's cooldown is still running, so a
 * submit button can hold itself back instead of firing a request that can
 * only fail again.
 */
export function useRateLimit(): { blocked: boolean; secondsLeft: number } {
  const dispatch = useAppDispatch()
  const until = useAppSelector(selectRateLimitedUntil)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!until) return

    // A one-second tick is enough to count down and to notice the end.
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= until) dispatch(rateLimitCleared())
    }, 1000)

    return () => clearInterval(timer)
  }, [until, dispatch])

  if (!until) return { blocked: false, secondsLeft: 0 }

  const secondsLeft = Math.max(0, Math.ceil((until - now) / 1000))
  return { blocked: secondsLeft > 0, secondsLeft }
}
