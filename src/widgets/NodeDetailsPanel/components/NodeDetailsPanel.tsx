import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NodeDetails } from '@/features/explorer/NodeDetails'
import type { FolderItem } from '@/types'

interface NodeDetailsPanelProps {
  item: FolderItem
  ownerLabel: string
  /** FR-PUB-03: present when the panel is open behind a share link. */
  shareToken?: string
  /** FR-EXP-20: only an owner may ask who else has access. */
  canViewAccess: boolean
  onClose: () => void
}

/**
 * FR-EXP-19/21: opened from "Details" in the actions menu — never by clicking
 * a row — after which it describes whichever row is selected. Closing it leaves
 * the selection alone; navigating away closes it.
 */
export function NodeDetailsPanel({
  item,
  ownerLabel,
  shareToken,
  canViewAccess,
  onClose,
}: NodeDetailsPanelProps) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border pr-2 pl-4">
        <span className="text-sm font-medium text-foreground">Details</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close details"
          onClick={onClose}
        >
          <XIcon strokeWidth={1.75} />
        </Button>
      </div>

      <NodeDetails
        item={item}
        ownerLabel={ownerLabel}
        shareToken={shareToken}
        canViewAccess={canViewAccess}
      />
    </aside>
  )
}
