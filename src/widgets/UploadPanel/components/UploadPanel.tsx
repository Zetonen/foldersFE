import { ChevronDownIcon, ChevronUpIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UploadQueue } from '@/features/upload/UploadQueue'
import { useUploadPanel } from '../hooks/useUploadPanel'

/**
 * FR-UPL-14: docked bottom-right, never blocking the explorer, and mounted in
 * the app shell so it outlives navigation.
 */
export function UploadPanel() {
  const {
    items,
    visible,
    collapsed,
    hasActive,
    overallProgress,
    title,
    toggleCollapsed,
    close,
    retry,
    open,
  } = useUploadPanel()

  if (!visible) return null

  return (
    <section
      aria-label="Uploads"
      className="fixed right-4 bottom-4 z-30 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    >
      <header className="flex h-11 items-center gap-1 border-b border-border pr-1 pl-3">
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          {title}
        </span>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <ChevronUpIcon strokeWidth={1.75} />
          ) : (
            <ChevronDownIcon strokeWidth={1.75} />
          )}
        </Button>

        {/* FR-UPL-16: closing is only offered once nothing is in flight. */}
        {hasActive ? null : (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close upload panel"
            onClick={close}
          >
            <XIcon strokeWidth={1.75} />
          </Button>
        )}
      </header>

      {/* FR-UPL-19: bytes sent against the whole batch, not a file count. */}
      {hasActive ? (
        <Progress value={overallProgress} className="h-1 rounded-none" />
      ) : null}

      {collapsed ? null : (
        <UploadQueue items={items} onOpen={open} onRetry={retry} />
      )}
    </section>
  )
}
