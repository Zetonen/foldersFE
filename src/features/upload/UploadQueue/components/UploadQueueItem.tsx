import { CheckCircle2Icon, RotateCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { NodeIcon } from '@/components/moduls/NodeIcon'
import { UserText } from '@/components/moduls/UserText'
import type { UploadItem } from '@/types'
import { describeUploadItem } from '../helpers/describeUploadItem'

interface UploadQueueItemProps {
  item: UploadItem
  /** FR-UPL-18: a finished row links to the file it produced. */
  onOpen: (item: UploadItem) => void
  onRetry: (item: UploadItem) => void
}

/** FR-UPL-17/18: one row per file, with its own indicator and status. */
export function UploadQueueItem({
  item,
  onOpen,
  onRetry,
}: UploadQueueItemProps) {
  const inFlight = item.status === 'uploading' || item.status === 'processing'

  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <NodeIcon type="FILE" className="size-4 shrink-0" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <UserText
            className="truncate text-sm text-foreground"
            title={item.name}
          >
            {item.name}
          </UserText>
          <span className="shrink-0 text-xs text-muted-foreground">
            {describeUploadItem(item)}
          </span>
        </div>

        {/* An indeterminate bar while the server is still registering it. */}
        {inFlight ? (
          <Progress
            value={item.status === 'processing' ? undefined : item.progress}
            className="h-1"
          />
        ) : null}
      </div>

      <div className="flex w-8 shrink-0 justify-end">
        {item.status === 'done' ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Open ${item.name}`}
            onClick={() => onOpen(item)}
          >
            <CheckCircle2Icon className="text-success" strokeWidth={1.75} />
          </Button>
        ) : item.status === 'failed' ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Retry ${item.name}`}
            onClick={() => onRetry(item)}
          >
            <RotateCwIcon strokeWidth={1.75} />
          </Button>
        ) : null}
      </div>
    </li>
  )
}
