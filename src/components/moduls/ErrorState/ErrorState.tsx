import { TriangleAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/helpers/cn'

interface ErrorStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

/**
 * FR-ERR-02: the inline block used wherever a screen's data failed to load —
 * an explanation plus a single retry affordance. Mutation failures use toasts
 * instead; this is for content that is missing from the page.
 */
export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center',
        className
      )}
    >
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon
          className="size-6"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </span>

      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {actionLabel && onAction ? (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
