import {
  ChevronDownIcon,
  ChevronUpIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ZOOM } from '../constants/pdfWorker'

interface PdfViewerControlsProps {
  page: number
  pageCount: number
  scale: number
  onGoToPage: (page: number) => void
  onZoom: (scale: number) => void
}

/**
 * FR-VIEW-05: paging, jumping to a page and zooming.
 *
 * Fit-to-width is deliberately absent: its icon is read as "open fullscreen",
 * and a control that promises one thing and does another is worse than not
 * having it. The two zoom buttons cover the same ground.
 */
export function PdfViewerControls({
  page,
  pageCount,
  scale,
  onGoToPage,
  onZoom,
}: PdfViewerControlsProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-center gap-1 border-t border-border bg-card px-3">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onGoToPage(page - 1)}
      >
        <ChevronUpIcon strokeWidth={1.75} />
      </Button>

      {/* FR-VIEW-06: typing a number scrolls the document to that page. */}
      <Input
        type="number"
        min={1}
        max={pageCount}
        value={page}
        aria-label="Page"
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isNaN(next)) return
          onGoToPage(Math.min(Math.max(next, 1), pageCount))
        }}
        className="h-8 w-16 text-center"
      />
      <span className="shrink-0 text-sm text-muted-foreground">
        of {pageCount}
      </span>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onGoToPage(page + 1)}
      >
        <ChevronDownIcon strokeWidth={1.75} />
      </Button>

      <span className="mx-2 h-5 w-px bg-border" aria-hidden="true" />

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Zoom out"
        disabled={scale <= ZOOM.min}
        onClick={() => onZoom(Math.max(scale - ZOOM.step, ZOOM.min))}
      >
        <ZoomOutIcon strokeWidth={1.75} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Zoom in"
        disabled={scale >= ZOOM.max}
        onClick={() => onZoom(Math.min(scale + ZOOM.step, ZOOM.max))}
      >
        <ZoomInIcon strokeWidth={1.75} />
      </Button>
    </div>
  )
}
