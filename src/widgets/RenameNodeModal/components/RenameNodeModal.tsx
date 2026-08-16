import { useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getNameSelection } from '../helpers/getNameSelection'
import type { NodeRef } from '@/types'
import { RenameNodeForm } from './RenameNodeForm'

interface RenameNodeModalProps {
  /** `null` keeps the dialog closed. */
  item: NodeRef | null
  onOpenChange: (open: boolean) => void
  dataRoomId: string
  parentId: string | null
  takenNames: string[]
}

/** FR-REN-01..06. */
export function RenameNodeModal({
  item,
  onOpenChange,
  dataRoomId,
  parentId,
  takenNames,
}: RenameNodeModalProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent
        /**
         * FR-REN-02: only the base name is selected, so the extension survives
         * a straight retype while staying editable.
         */
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const input = nameInputRef.current
          if (!input || !item) return

          input.focus()
          input.setSelectionRange(0, getNameSelection(item.name, item.type))
        }}
      >
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>

        {item ? (
          <RenameNodeForm
            // A different node means a different form, not a reset one.
            key={item.id}
            item={item}
            dataRoomId={dataRoomId}
            parentId={parentId}
            takenNames={takenNames}
            inputRef={nameInputRef}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
