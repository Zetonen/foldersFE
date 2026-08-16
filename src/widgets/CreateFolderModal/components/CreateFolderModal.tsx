import { useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreateFolderForm } from './CreateFolderForm'

interface CreateFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataRoomId: string
  parentId: string | null
  /** Names already in this folder, used to propose a free one on a 409. */
  takenNames: string[]
  /** FR-FLD-04: the new folder becomes the selected row. */
  onCreated?: (folderId: string) => void
}

/** FR-FLD-01..04. */
export function CreateFolderModal({
  open,
  onOpenChange,
  dataRoomId,
  parentId,
  takenNames,
  onCreated,
}: CreateFolderModalProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // FR-FLD-02: the default name arrives selected, ready to be typed over.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          nameInputRef.current?.focus()
          nameInputRef.current?.select()
        }}
      >
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
        </DialogHeader>

        <CreateFolderForm
          dataRoomId={dataRoomId}
          parentId={parentId}
          takenNames={takenNames}
          inputRef={nameInputRef}
          onCreated={onCreated}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
