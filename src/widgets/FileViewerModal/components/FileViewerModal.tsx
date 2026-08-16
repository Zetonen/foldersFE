import { lazy, Suspense, type ReactNode } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  MoveIcon,
  PencilIcon,
  Share2Icon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NodeIcon } from '@/components/moduls/NodeIcon'
import { PageLoader } from '@/components/moduls/PageLoader'
import { UserText } from '@/components/moduls/UserText'
import { formatBytes } from '@/shared/helpers/formatBytes'
import { useViewerKeyboard } from '../hooks/useViewerKeyboard'

/** FR-LAZY-02: react-pdf and pdf.js load only when a file is opened. */
const PdfViewer = lazy(async () => ({
  default: (await import('@/features/viewer/PdfViewer')).PdfViewer,
}))

interface FileViewerModalProps {
  name: string
  sizeBytes: number
  /** Undefined while the signed link is being fetched. */
  url: string | undefined
  isLoading: boolean
  onRetry: () => void
  onClose: () => void
  /** FR-VIEW-10: position among the files of the current folder. */
  position?: { index: number; total: number }
  onPrevious?: () => void
  onNext?: () => void
  /** FR-VIEW-03: owner-only actions. */
  onShare?: () => void
  onRename?: () => void
  onMove?: () => void
  onDelete?: () => void
  /** Replaces the document when the file has gone (FR-VIEW-12). */
  body?: ReactNode
}

/**
 * FR-VIEW-01: a modal layered over the explorer, dismissed with Esc or by
 * clicking the backdrop.
 */
export function FileViewerModal({
  name,
  sizeBytes,
  url,
  isLoading,
  onRetry,
  onClose,
  position,
  onPrevious,
  onNext,
  onShare,
  onRename,
  onMove,
  onDelete,
  body,
}: FileViewerModalProps) {
  useViewerKeyboard({ onClose, onPrevious, onNext })

  const hasActions = Boolean(onRename || onMove || onDelete)

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <div className="relative m-auto flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl max-sm:max-h-full max-sm:rounded-none">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3">
          <NodeIcon type="FILE" className="size-5 shrink-0" />
          <div className="flex min-w-0 flex-col leading-tight">
            <UserText className="truncate text-sm font-medium text-foreground">
              {name}
            </UserText>
            <span className="text-xs text-muted-foreground">
              {formatBytes(sizeBytes)}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {onShare ? (
              <Button size="sm" onClick={onShare}>
                <Share2Icon strokeWidth={2} />
                <span className="max-sm:sr-only">Share</span>
              </Button>
            ) : null}

            {hasActions ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="More actions"
                  >
                    <MoreVerticalIcon strokeWidth={1.75} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onRename ? (
                    <DropdownMenuItem onSelect={onRename}>
                      <PencilIcon strokeWidth={1.75} />
                      Rename
                    </DropdownMenuItem>
                  ) : null}
                  {onMove ? (
                    <DropdownMenuItem onSelect={onMove}>
                      <MoveIcon strokeWidth={1.75} />
                      Move to…
                    </DropdownMenuItem>
                  ) : null}
                  {onDelete ? <DropdownMenuSeparator /> : null}
                  {onDelete ? (
                    <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                      <Trash2Icon strokeWidth={1.75} />
                      Delete
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={onClose}
            >
              <XIcon strokeWidth={1.75} />
            </Button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {body ??
            (isLoading || !url ? (
              <PageLoader />
            ) : (
              <Suspense fallback={<PageLoader />}>
                <PdfViewer url={url} onRetry={onRetry} />
              </Suspense>
            ))}

          {/* FR-VIEW-10: side arrows, disabled at the ends of the folder. */}
          {position ? (
            <>
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous file"
                disabled={!onPrevious}
                onClick={onPrevious}
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full shadow-sm"
              >
                <ChevronLeftIcon strokeWidth={1.75} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next file"
                disabled={!onNext}
                onClick={onNext}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full shadow-sm"
              >
                <ChevronRightIcon strokeWidth={1.75} />
              </Button>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-card/90 px-3 py-1 text-xs text-muted-foreground">
                {position.index} of {position.total}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
