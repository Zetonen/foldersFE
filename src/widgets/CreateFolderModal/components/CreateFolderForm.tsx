import type { RefObject } from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DialogFooter } from '@/components/ui/dialog'
import { FormField } from '@/components/moduls/FormField'
import { FOLDER_CONFLICT_MESSAGE } from '../constants/defaults'
import { useCreateFolderForm } from '../hooks/useCreateFolderForm'

interface CreateFolderFormProps {
  dataRoomId: string
  parentId: string | null
  takenNames: string[]
  inputRef: RefObject<HTMLInputElement | null>
  onCreated?: (folderId: string) => void
  onClose: () => void
}

/**
 * Split out of the dialog so that it mounts fresh every time the dialog opens.
 * That is what resets the field and the conflict notice — no effect needed.
 */
export function CreateFolderForm(props: CreateFolderFormProps) {
  const {
    registerName,
    errors,
    conflict,
    suggestedName,
    applySuggestion,
    isLoading,
    onSubmit,
  } = useCreateFolderForm(props)

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        name="name"
        label="Name"
        error={
          errors.name?.message ??
          (conflict ? (
            <>
              {FOLDER_CONFLICT_MESSAGE}{' '}
              <button
                type="button"
                onClick={applySuggestion}
                className="text-brand underline"
              >
                Use “{suggestedName}”
              </button>
            </>
          ) : undefined)
        }
      >
        {(field) => (
          <Input {...field} {...registerName()} disabled={isLoading} />
        )}
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={props.onClose}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2Icon className="animate-spin" aria-hidden="true" />
          ) : null}
          {/* Wrapped so the spinner has an element to mount in front of. */}
          <span>Create</span>
        </Button>
      </DialogFooter>
    </form>
  )
}
