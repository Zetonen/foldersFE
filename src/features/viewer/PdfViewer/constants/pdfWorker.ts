import { pdfjs } from 'react-pdf'

/**
 * pdf.js runs its parser in a worker. Resolving it through `import.meta.url`
 * lets Vite fingerprint and serve it from our own origin, rather than relying
 * on a CDN — which the app would otherwise fetch at view time.
 *
 * This module is only ever reached through the viewer's lazy chunk
 * (FR-LAZY-02), so the worker is not requested until a file is opened.
 */
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

/** FR-VIEW-05: zoom bounds and step for the viewer controls. */
export const ZOOM = {
  min: 0.5,
  max: 3,
  step: 0.25,
  default: 1,
} as const

/**
 * FR-VIEW-07: pages outside this window are replaced by a placeholder of a
 * fixed height, so the scrollbar stays honest while nothing is rendered.
 */
export const RENDER_WINDOW = 1

/**
 * Height to assume for a page before any page has been drawn, in CSS pixels
 * (A4 at 96 dpi). Once the first page reports its real size, that is used
 * instead — this only has to hold for the moment before the document loads.
 */
export const PLACEHOLDER_HEIGHT = 1123

/**
 * How long after the last scroll event a programmatic jump counts as finished.
 * Long enough to bridge the gaps between the events of a smooth scroll, short
 * enough that the page number picks up the reader's own scrolling right away.
 */
export const SCROLL_SETTLE_MS = 150

/** FR-VIEW-09: shown when the document cannot be rendered. */
export const PREVIEW_ERROR = {
  title: "Preview isn't available",
  description: 'The document could not be rendered.',
} as const
