import { Skeleton } from '@/components/ui/skeleton'

interface PdfPagePlaceholderProps {
  /** Height in CSS pixels, already scaled — see `usePdfViewer.pageHeight`. */
  height: number
}

/**
 * FR-VIEW-07/08: stands in for a page that is out of the render window, and
 * for one still being drawn.
 *
 * It is given the height its page will actually occupy, so a page appearing or
 * being dropped from the window changes nothing above or below it — that is
 * what keeps the document from jumping while paging through it.
 */
export function PdfPagePlaceholder({ height }: PdfPagePlaceholderProps) {
  return <Skeleton className="mx-auto w-full max-w-3xl" style={{ height }} />
}
