import { useEffect, useRef, useState } from 'react'
import {
  PLACEHOLDER_HEIGHT,
  SCROLL_SETTLE_MS,
  ZOOM,
} from '../constants/pdfWorker'
import { findVisiblePage } from '../helpers/findVisiblePage'

/** What react-pdf hands back once a page has been drawn. */
interface LoadedPage {
  originalHeight: number
}

/** FR-VIEW-05..09: paging, zoom and load failure, without any markup. */
export function usePdfViewer(onRetry: () => void) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(0)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState<number>(ZOOM.default)
  const [failed, setFailed] = useState(false)
  /**
   * FR-VIEW-07: unscaled height of each page that has been drawn at least
   * once. A placeholder is only honest about the space it holds if it knows
   * how tall the page really is — an A4 guess is half a screen out on a slide
   * deck, and every page entering or leaving the render window would then
   * shove the document up or down under the reader.
   */
  const [pageHeights, setPageHeights] = useState<Record<number, number>>({})

  /**
   * A jump moves through every page between here and there. Tracking the page
   * from those intermediate positions would swing the render window across the
   * whole document on the way — so the scroll handler stands down until the
   * scrolling stops.
   */
  const jumpingRef = useRef(false)
  const settleRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(settleRef.current), [])

  const endJumpWhenSettled = () => {
    clearTimeout(settleRef.current)
    settleRef.current = setTimeout(() => {
      jumpingRef.current = false
    }, SCROLL_SETTLE_MS)
  }

  const goToPage = (target: number) => {
    setPage(target)

    jumpingRef.current = true
    // Armed here too: a target already in view produces no scroll event at
    // all, and the flag would otherwise never be lowered.
    endJumpWhenSettled()

    scrollRef.current
      ?.querySelector(`[data-page="${target}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /**
   * FR-VIEW-06: scrolling keeps the page number in step with the document.
   * Read from the real element positions rather than from an assumed page
   * height, so a document of mixed page sizes still reports the right number.
   */
  const handleScroll = () => {
    if (jumpingRef.current) {
      endJumpWhenSettled()
      return
    }

    const container = scrollRef.current
    if (!container || pageCount === 0) return

    const visible = findVisiblePage(container)
    if (visible !== null) setPage(visible)
  }

  /** Records what a page measures, so its placeholder can match it later. */
  const onPageLoad = (number: number, loaded: LoadedPage) => {
    setPageHeights((current) =>
      current[number] === loaded.originalHeight
        ? current
        : { ...current, [number]: loaded.originalHeight }
    )
  }

  /**
   * The height page `number` occupies on screen. Pages not yet drawn borrow
   * the first page's measurements, which is exact for the documents that have
   * one page size — that is nearly all of them — and a far better guess than a
   * constant for the rest.
   */
  const pageHeight = (number: number) =>
    (pageHeights[number] ?? pageHeights[1] ?? PLACEHOLDER_HEIGHT) * scale

  const retry = () => {
    setFailed(false)
    onRetry()
  }

  return {
    scrollRef,
    pageCount,
    page,
    scale,
    failed,
    setPageCount,
    setScale,
    onLoadError: () => setFailed(true),
    onPageLoad,
    pageHeight,
    goToPage,
    handleScroll,
    retry,
  }
}
