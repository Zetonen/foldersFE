import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/shared/helpers/cn'

/** The accessibility props the field computes for whatever control it wraps. */
export interface FieldControlProps {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

interface FormFieldProps {
  /** Doubles as the control id and the stem of the hint / error ids. */
  name: string
  label: string
  hint?: ReactNode
  /** FR-AUTH-05: rich enough to carry a link back to the sign-in screen. */
  error?: ReactNode
  className?: string
  children: (props: FieldControlProps) => ReactNode
}

/**
 * FR-AUTH-03: the control is labelled, marked `aria-invalid` when it fails,
 * and pointed at its error text through `aria-describedby`.
 *
 * The control is supplied as a function rather than cloned, so the wiring is
 * explicit at the call site and works with any input component.
 */
export function FormField({
  name,
  label,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${name}-error`
  const hintId = `${name}-hint`

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={name}>{label}</Label>

      {children({
        id: name,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}

      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
