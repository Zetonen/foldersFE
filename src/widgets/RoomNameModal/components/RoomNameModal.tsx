import { useRef } from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormField } from '@/components/moduls/FormField'
import { ROOM_NAME_COPY, ROOM_NAME_PLACEHOLDER } from '../constants/copy'
import { useRoomNameForm } from '../hooks/useRoomNameForm'

interface RoomNameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present in rename mode; absent creates a new data room. */
  room?: { id: string; name: string } | null
}

export function RoomNameModal({
  open,
  onOpenChange,
  room,
}: RoomNameModalProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)

  const { registerName, errors, isRename, isPending, onSubmit } =
    useRoomNameForm({ open, room, inputRef: nameInputRef, onOpenChange })

  const copy = isRename ? ROOM_NAME_COPY.rename : ROOM_NAME_COPY.create

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // FR-ROOMS-05: the field takes focus, with its text selected so the
        // existing name can simply be typed over.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          nameInputRef.current?.focus()
          nameInputRef.current?.select()
        }}
      >
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <FormField name="name" label="Name" error={errors.name?.message}>
            {(field) => (
              <Input
                {...field}
                {...registerName()}
                placeholder={ROOM_NAME_PLACEHOLDER}
                disabled={isPending}
              />
            )}
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : null}
              {/* Wrapped so the spinner has an element to mount in front of. */}
              <span>{copy.submit}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
