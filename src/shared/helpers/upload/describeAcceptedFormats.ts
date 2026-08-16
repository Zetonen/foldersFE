import { UPLOAD_LIMITS } from '@/shared/constants/UPLOAD'

/**
 * FR-UPL-07: the accepted formats, spelled out for a human — "PDF" today, and
 * "PDF, DOCX or XLSX" the day the list grows. Derived from the same constant
 * the validator and the file picker use, so the three can never disagree.
 */
export function describeAcceptedFormats(): string {
  const labels = UPLOAD_LIMITS.acceptedExtensions.map((extension) =>
    extension.replace('.', '').toUpperCase()
  )

  if (labels.length <= 1) return labels[0] ?? ''

  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`
}
