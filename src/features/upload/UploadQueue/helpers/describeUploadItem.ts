import { formatBytes } from '@/shared/helpers/formatBytes'
import type { UploadItem } from '@/types'

/** FR-UPL-17/18: the status line to the right of a queue row. */
export function describeUploadItem(item: UploadItem): string {
  switch (item.status) {
    case 'waiting':
      return 'Waiting…'
    case 'uploading':
      // FR-UPL-17: bytes moved against the total, not just a percentage.
      return `${formatBytes(item.bytesSent)} of ${formatBytes(item.size)}`
    case 'processing':
      return 'Processing…'
    case 'done':
      return formatBytes(item.size)
    case 'failed':
      return item.error ?? 'Failed'
  }
}
