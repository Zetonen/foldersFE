import { useDropzone } from 'react-dropzone'
import { UploadIcon } from 'lucide-react'
import { cn } from '@/shared/helpers/cn'
import { UPLOAD_LIMITS } from '@/shared/constants/UPLOAD'
import type { ReactNode } from 'react'

interface NodeDropzoneProps {
  children: ReactNode
  /** FR-UPL-06: a viewer gets no drop zone at all. */
  disabled: boolean
  /** Named in the overlay so the user can see where the files will land. */
  folderName: string
  onFilesDropped: (files: File[]) => void
}

/**
 * FR-UPL-01/03/05: the whole list area accepts files. `noClick` keeps a click
 * on a row from opening the file picker; the explicit upload actions do that.
 *
 * react-dropzone also calls `preventDefault` on the window's own drag events,
 * which is what stops a stray drop from navigating the tab to the PDF.
 */
export function NodeDropzone({
  children,
  disabled,
  folderName,
  onFilesDropped,
}: NodeDropzoneProps) {
  const { getRootProps, isDragActive } = useDropzone({
    disabled,
    noClick: true,
    noKeyboard: true,
    // Validation proper happens on enqueue; this only filters the picker.
    accept: { 'application/pdf': [...UPLOAD_LIMITS.acceptedExtensions] },
    onDrop: (accepted, rejected) =>
      onFilesDropped([
        ...accepted,
        // Refused files still travel on, so the queue can explain why.
        ...rejected.map((entry) => entry.file),
      ]),
  })

  return (
    <div {...getRootProps()} className="relative flex min-h-0 flex-1 flex-col">
      {children}

      {/* FR-UPL-03: the overlay names the destination and vanishes on leave. */}
      {isDragActive ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-2 z-10 border-brand bg-selected/80',
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed'
          )}
        >
          <UploadIcon className="size-8 text-brand" strokeWidth={1.5} />
          <p className="text-sm font-medium text-brand">
            Drop files into {folderName}
          </p>
        </div>
      ) : null}
    </div>
  )
}
