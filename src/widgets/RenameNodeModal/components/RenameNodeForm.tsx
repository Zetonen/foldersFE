import type { RefObject } from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DialogFooter } from '@/components/ui/dialog'
import { FormField } from '@/components/moduls/FormField'
import type { NodeRef } from '@/types'
import { useRenameNodeForm } from '../hooks/useRenameNodeForm'

interface RenameNodeFormProps {
  item: NodeRef
  dataRoomId: string
  parentId: string | null
  takenNames: string[]
  inputRef: RefObject<HTMLInputElement | null>
  onClose: () => void
}

/** Mounted fresh per opening, so the field always starts from the real name. */
export function RenameNodeForm(props: RenameNodeFormProps) {
  const {
    registerName,
    errors,
    conflict,
    conflictMessage,
    suggestedName,
    applySuggestion,
    isLoading,
    onSubmit,
  } = useRenameNodeForm(props)

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        name="name"
        label="Name"
        error={
          errors.name?.message ??
          (conflict ? (
            <>
              {conflictMessage}{' '}
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
          <span>Save</span>
        </Button>
      </DialogFooter>
    </form>
  )
}
