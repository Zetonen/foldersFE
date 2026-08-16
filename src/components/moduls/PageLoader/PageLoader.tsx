import { Loader2Icon } from 'lucide-react'
import { cn } from '@/shared/helpers/cn'

interface PageLoaderProps {
  /** FR-AUTH-11: the OAuth callback explains what is being waited on. */
  label?: string
  className?: string
}

/** Suspense fallback for lazily loaded routes (FR-LAZY-01). */
export function PageLoader({ label, className }: PageLoaderProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex h-full min-h-60 flex-col items-center justify-center gap-3',
        className
      )}
    >
      <Loader2Icon
        className="size-6 animate-spin text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span
        className={cn('text-sm text-muted-foreground', !label && 'sr-only')}
      >
        {label ?? 'Loading…'}
      </span>
    </div>
  )
}
