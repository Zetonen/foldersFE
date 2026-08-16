import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { GoogleGlyph } from './GoogleGlyph'

/**
 * FR-AUTH-07: the same button on both screens — an account is created on the
 * first sign-in, so there is no separate "sign up with Google" path.
 */
export function GoogleAuthButton() {
  const { start, isFetching } = useGoogleAuth()

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={isFetching}
      onClick={start}
    >
      {isFetching ? (
        <Loader2Icon className="animate-spin" aria-hidden="true" />
      ) : (
        <GoogleGlyph />
      )}
      {/* Wrapped so the swap of glyph for spinner has a stable anchor. */}
      <span>Continue with Google</span>
    </Button>
  )
}
