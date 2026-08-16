import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { ErrorState } from '@/components/moduls/ErrorState'
import { PREVIEW_ERROR, RENDER_WINDOW } from '../constants/pdfWorker'
import { usePdfViewer } from '../hooks/usePdfViewer'
import { PdfPagePlaceholder } from './PdfPagePlaceholder'
import { PdfViewerControls } from './PdfViewerControls'

interface PdfViewerProps {
  /** Short-lived signed URL from `GET /files/{id}/download-url`. */
  url: string
  /** Edge case 16: re-requests the link and reloads the document. */
  onRetry: () => void
}

/** FR-VIEW-04..09: the document body plus its control bar. */
export function PdfViewer({ url, onRetry }: PdfViewerProps) {
  const {
    scrollRef,
    pageCount,
    page,
    scale,
    failed,
    setPageCount,
    setScale,
    onLoadError,
    onPageLoad,
    pageHeight,
    goToPage,
    handleScroll,
    retry,
  } = usePdfViewer(onRetry)

  // FR-VIEW-09: a document that will not render offers a way to try again.
  if (failed) {
    return (
      <ErrorState
        title={PREVIEW_ERROR.title}
        description={PREVIEW_ERROR.description}
        actionLabel="Try again"
        onAction={retry}
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-auto bg-muted p-4"
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setPageCount(numPages)}
          onLoadError={onLoadError}
          // FR-VIEW-08: a page-shaped skeleton, not an empty area.
          loading={<PdfPagePlaceholder height={pageHeight(1)} />}
          error={null}
          className="flex flex-col items-center gap-4"
        >
          {Array.from({ length: pageCount }, (_, index) => {
            const number = index + 1
            /**
             * FR-VIEW-07: only the visible page and one neighbour on each side
             * are drawn. Everything else keeps its space with a placeholder.
             */
            const rendered = Math.abs(number - page) <= RENDER_WINDOW

            return (
              <div key={number} data-page={number} className="w-full">
                {rendered ? (
                  <Page
                    pageNumber={number}
                    scale={scale}
                    // FR-VIEW-07: what it measures is what its placeholder
                    // will hold once it leaves the window again.
                    onLoadSuccess={(loaded) => onPageLoad(number, loaded)}
                    loading={<PdfPagePlaceholder height={pageHeight(number)} />}
                    className="mx-auto shadow-sm"
                  />
                ) : (
                  <PdfPagePlaceholder height={pageHeight(number)} />
                )}
              </div>
            )
          })}
        </Document>
      </div>

      {pageCount > 0 ? (
        <PdfViewerControls
          page={page}
          pageCount={pageCount}
          scale={scale}
          onGoToPage={goToPage}
          onZoom={setScale}
        />
      ) : null}
    </div>
  )
}
