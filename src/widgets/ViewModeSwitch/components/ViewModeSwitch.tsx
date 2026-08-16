import { VIEW_MODES } from '@/shared/constants/LIST'
import { cn } from '@/shared/helpers/cn'
import type { ViewMode } from '@/types'
import { VIEW_MODE_OPTIONS } from '../constants/modes'

interface ViewModeSwitchProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

/**
 * FR-EXP-11: list or grid, for the folder contents.
 *
 * A radio group rather than a single toggle button: with two modes a toggle
 * would still work, but it could not say which mode is current — and that is
 * the one thing a reader coming back to the screen needs to know.
 */
export function ViewModeSwitch({ value, onChange }: ViewModeSwitchProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Layout"
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-card p-0.5"
    >
      {VIEW_MODES.map((mode) => {
        const { label, Icon } = VIEW_MODE_OPTIONS[mode]
        const active = mode === value

        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(mode)}
            className={cn(
              'inline-flex size-7 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              active
                ? 'bg-selected text-brand'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
