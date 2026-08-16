import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/helpers/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  /** FR-EXP-24: a viewer sees the message without any call to action. */
  action?: ReactNode
  className?: string
}

/** FR-EXP-23 / FR-ROOMS-08/09: the shared "nothing here yet" panel. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center',
        className
      )}
    >
      {Icon ? (
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-8" strokeWidth={1.5} aria-hidden="true" />
        </span>
      ) : null}

      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {action}
    </div>
  )
}
