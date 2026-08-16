import { useState, type RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateFolderMutation } from '@/api'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { buildUniqueName } from '@/shared/helpers/nodeName/buildUniqueName'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { isAppError, nodeNameFormSchema, type NodeNameValues } from '@/types'
import { DEFAULT_FOLDER_NAME } from '../constants/defaults'

interface UseCreateFolderFormArgs {
  dataRoomId: string
  parentId: string | null
  takenNames: string[]
  inputRef: RefObject<HTMLInputElement | null>
  onCreated?: (folderId: string) => void
  onClose: () => void
}

/** FR-FLD-01..04: naming a new folder and reacting to a name collision. */
export function useCreateFolderForm({
  dataRoomId,
  parentId,
  takenNames,
  inputRef,
  onCreated,
  onClose,
}: UseCreateFolderFormArgs) {
  const [createFolder, { isLoading }] = useCreateFolderMutation()

  /** FR-FLD-02: the server owns uniqueness, so this only follows a 409. */
  const [conflict, setConflict] = useState(false)

  const form = useForm<NodeNameValues>({
    resolver: zodResolver(nodeNameFormSchema),
    mode: 'onSubmit',
    defaultValues: { name: DEFAULT_FOLDER_NAME },
  })

  // FR-FLD-03: Enter submits; Esc is handled by the dialog itself.
  const onSubmit = form.handleSubmit(async ({ name }) => {
    setConflict(false)

    try {
      const folder = await createFolder({ dataRoomId, parentId, name }).unwrap()
      onCreated?.(folder.id)
      onClose()
    } catch (error) {
      if (isAppError(error) && error.status === HTTP_STATUS.conflict) {
        setConflict(true)
        form.setFocus('name')
        return
      }
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  })

  /** FR-FLD-02: the first free "name (n)" the server would accept. */
  const suggestedName = buildUniqueName(form.getValues('name'), takenNames)

  const applySuggestion = () => {
    form.setValue('name', suggestedName, { shouldValidate: true })
    setConflict(false)
    form.setFocus('name')
  }

  /** Both react-hook-form and the dialog's focus need the input node. */
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
    conflict,
    suggestedName,
    applySuggestion,
    isLoading,
    onSubmit,
  }
}
