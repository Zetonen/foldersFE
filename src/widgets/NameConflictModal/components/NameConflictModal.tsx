import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserText } from '@/components/moduls/UserText'
import type { ConflictResolution, NameConflict } from '@/types'
import { ALL_CONFLICT_RESOLUTIONS, CONFLICT_COPY } from '../constants/copy'

interface NameConflictModalProps {
  /** `null` keeps the dialog closed. */
  conflict: NameConflict | null
  /** FR-UPL-11: only a batch offers "Apply to all". */
  showApplyToAll?: boolean
  /**
   * Which choices this flow can honestly carry out. Moving cannot offer
   * "Replace", because the destination listing is not loaded and the client
   * would not know what it is about to destroy.
   */
  resolutions?: ConflictResolution[]
  onResolve: (resolution: ConflictResolution, applyToAll: boolean) => void
  /** FR-UPL-12: cancelling drops the whole set, not just this item. */
  onCancel: () => void
}

/**
 * FR-UPL-10..13 and FR-MOV-11: one dialog for both flows, because the choice
 * a user faces is identical whether the collision came from an upload or a move.
 */
export function NameConflictModal({
  conflict,
  showApplyToAll = false,
  resolutions = ALL_CONFLICT_RESOLUTIONS,
  onResolve,
  onCancel,
}: NameConflictModalProps) {
  return (
    <Dialog
      open={conflict !== null}
      onOpenChange={(open) => !open && onCancel()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{CONFLICT_COPY.title}</DialogTitle>
          <DialogDescription>
            “<UserText>{conflict?.name}</UserText>” already exists in{' '}
            <UserText>{conflict?.targetFolderName}</UserText>.
          </DialogDescription>
        </DialogHeader>

        {conflict ? (
          <ConflictChoices
            // Each new collision starts from an unchecked box.
            key={`${conflict.targetFolderName}/${conflict.name}`}
            showApplyToAll={showApplyToAll}
            resolutions={resolutions}
            onResolve={onResolve}
            onCancel={onCancel}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

interface ConflictChoicesProps {
  showApplyToAll: boolean
  resolutions: ConflictResolution[]
  onResolve: (resolution: ConflictResolution, applyToAll: boolean) => void
  onCancel: () => void
}

function ConflictChoices({
  showApplyToAll,
  resolutions,
  onResolve,
  onCancel,
}: ConflictChoicesProps) {
  const [applyToAll, setApplyToAll] = useState(false)

  return (
    <>
      {showApplyToAll ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id="apply-to-all"
            checked={applyToAll}
            onCheckedChange={(checked) => setApplyToAll(checked === true)}
          />
          <Label htmlFor="apply-to-all" className="font-normal">
            {CONFLICT_COPY.applyToAll}
          </Label>
        </div>
      ) : null}

      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        {resolutions.includes('skip') ? (
          <Button
            variant="outline"
            onClick={() => onResolve('skip', applyToAll)}
          >
            Skip
          </Button>
        ) : null}
        {resolutions.includes('replace') ? (
          <Button
            variant="outline"
            onClick={() => onResolve('replace', applyToAll)}
          >
            Replace
          </Button>
        ) : null}
        {/* FR-UPL-10: keeping both is the default, least destructive choice. */}
        {resolutions.includes('keepBoth') ? (
          <Button onClick={() => onResolve('keepBoth', applyToAll)}>
            Keep both
          </Button>
        ) : null}
      </DialogFooter>
    </>
  )
}
