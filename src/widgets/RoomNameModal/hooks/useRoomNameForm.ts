import { useEffect, type RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateDataRoomMutation, useRenameDataRoomMutation } from '@/api'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import {
  dataRoomNameFormSchema,
  isAppError,
  type DataRoomNameValues,
} from '@/types'

interface UseRoomNameFormArgs {
  open: boolean
  room?: { id: string; name: string } | null
  inputRef: RefObject<HTMLInputElement | null>
  onOpenChange: (open: boolean) => void
}

/** FR-ROOMS-05 and the "Rename" item of FR-ROOMS-06 — one field, two modes. */
export function useRoomNameForm({
  open,
  room,
  inputRef,
  onOpenChange,
}: UseRoomNameFormArgs) {
  const [createRoom, { isLoading: isCreating }] = useCreateDataRoomMutation()
  const [renameRoom, { isLoading: isRenaming }] = useRenameDataRoomMutation()
  const isPending = isCreating || isRenaming

  const form = useForm<DataRoomNameValues>({
    resolver: zodResolver(dataRoomNameFormSchema),
    mode: 'onSubmit',
    defaultValues: { name: '' },
  })

  const { reset } = form

  // Each opening starts from the current name, or from an empty field.
  useEffect(() => {
    if (open) reset({ name: room?.name ?? '' })
  }, [open, room, reset])

  const onSubmit = form.handleSubmit(async ({ name }) => {
    // FR-REN-06: confirming without a change is a no-op, not a request.
    if (room && name === room.name) {
      onOpenChange(false)
      return
    }

    try {
      if (room) {
        await renameRoom({ id: room.id, name }).unwrap()
      } else {
        await createRoom({ name }).unwrap()
      }
      onOpenChange(false)
    } catch (error) {
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  })

  const registerName = () => {
    const { ref: registerRef, ...field } = form.register('name')

    return {
      ...field,
      ref: (element: HTMLInputElement | null) => {
        registerRef(element)
        inputRef.current = element
      },
    }
  }

  return {
    registerName,
    errors: form.formState.errors,
    isRename: Boolean(room),
    isPending,
    onSubmit,
  }
}
