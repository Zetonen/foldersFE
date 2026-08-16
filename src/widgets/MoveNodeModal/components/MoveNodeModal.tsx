import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserText } from '@/components/moduls/UserText'
import { FolderPicker } from '@/features/explorer/FolderPicker'
import { useMoveDestination } from '../hooks/useMoveDestination'
import type { FolderItem } from '@/types'

interface MoveNodeModalProps {
  /** `null` keeps the dialog closed. */
  item: FolderItem | null
  onOpenChange: (open: boolean) => void
  dataRoomId: string
  /** The folder the node lives in — moving it there would be a no-op. */
  currentFolderId: string | null
  currentFolderName: string
  onMove: (
    item: FolderItem,
    toFolderId: string | null,
    toFolderName: string
  ) => void
}

/** FR-MOV-11: the dialog behind the "Move to…" menu item. */
export function MoveNodeModal({
  item,
  onOpenChange,
  dataRoomId,
  currentFolderId,
  currentFolderName,
  onMove,
}: MoveNodeModalProps) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Move “<UserText>{item?.name}</UserText>”
          </DialogTitle>
          <DialogDescription>
            Choose a folder, then confirm the move.
          </DialogDescription>
        </DialogHeader>

        {item ? (
          <MovePicker
            // Browsing restarts from the node's own folder on every opening.
            key={item.id}
            item={item}
            dataRoomId={dataRoomId}
            currentFolderId={currentFolderId}
            currentFolderName={currentFolderName}
            onConfirm={(toFolderId, toFolderName) => {
              onMove(item, toFolderId, toFolderName)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

interface MovePickerProps {
  item: FolderItem
  dataRoomId: string
  currentFolderId: string | null
  currentFolderName: string
  onConfirm: (toFolderId: string | null, toFolderName: string) => void
  onCancel: () => void
}

function MovePicker({
  item,
  dataRoomId,
  currentFolderId,
  currentFolderName,
  onConfirm,
  onCancel,
}: MovePickerProps) {
  const { destination, setDestination, unchanged } = useMoveDestination({
    currentFolderId,
    currentFolderName,
  })

  return (
    <>
      <FolderPicker
        dataRoomId={dataRoomId}
        initialFolderId={currentFolderId}
        excludeId={item.id}
        value={destination.id}
        onChange={(id, name) => setDestination({ id, name })}
      />

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={unchanged}
          onClick={() => onConfirm(destination.id, destination.name)}
        >
          Move here
        </Button>
      </DialogFooter>
    </>
  )
}
