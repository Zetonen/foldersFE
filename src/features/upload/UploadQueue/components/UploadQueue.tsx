import type { UploadItem } from '@/types'
import { UploadQueueItem } from './UploadQueueItem'

interface UploadQueueProps {
  items: UploadItem[]
  onOpen: (item: UploadItem) => void
  onRetry: (item: UploadItem) => void
}

/** FR-UPL-17: the body of the upload panel. */
export function UploadQueue({ items, onOpen, onRetry }: UploadQueueProps) {
  return (
    <ul className="max-h-64 overflow-auto">
      {items.map((item) => (
        <UploadQueueItem
          key={item.id}
          item={item}
          onOpen={onOpen}
          onRetry={onRetry}
        />
      ))}
    </ul>
  )
}
