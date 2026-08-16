import { useState, type RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRenameFileMutation, useRenameFolderMutation } from '@/api'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { buildUniqueName } from '@/shared/helpers/nodeName/buildUniqueName'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import {
  isAppError,
  nodeNameFormSchema,
  type NodeNameValues,
  type NodeRef,
} from '@/types'
import { RENAME_CONFLICT } from '../constants/messages'

interface UseRenameNodeFormArgs {
  item: NodeRef
  dataRoomId: string
  parentId: string | null
  takenNames: string[]
  inputRef: RefObject<HTMLInputElement | null>
  onClose: () => void
}

/** FR-REN-01..06: renaming a folder or a file, and resolving a collision. */
export function useRenameNodeForm({
  item,
  dataRoomId,
  parentId,
  takenNames,
  inputRef,
  onClose,
}: UseRenameNodeFormArgs) {
  const [renameFolder, { isLoading: isRenamingFolder }] =
    useRenameFolderMutation()
  const [renameFile, { isLoading: isRenamingFile }] = useRenameFileMutation()
  const isLoading = isRenamingFolder || isRenamingFile

  const [conflict, setConflict] = useState(false)
  const isFolder = item.type === 'FOLDER'

  const form = useForm<NodeNameValues>({
    // FR-REN-03: the same rules as creating a folder.
    resolver: zodResolver(nodeNameFormSchema),
    mode: 'onSubmit',
    defaultValues: { name: item.name },
  })

  const onSubmit = form.handleSubmit(async ({ name }) => {
    // FR-REN-06: confirming without a change writes nothing.
    if (name === item.name) {
      onClose()
      return
    }

    setConflict(false)

    try {
      const args = { id: item.id, name, dataRoomId }

      if (isFolder) {
        await renameFolder({ ...args, parentId }).unwrap()
      } else {
        await renameFile({ ...args, folderId: parentId }).unwrap()
      }

      onClose()
    } catch (error) {
      // FR-REN-04: the optimistic patch has already rolled itself back.
      if (isAppError(error) && error.status === HTTP_STATUS.conflict) {
        setConflict(true)
        form.setFocus('name')
        return
      }
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  })

  const suggestedName = buildUniqueName(form.getValues('name'), takenNames)

  const applySuggestion = () => {
    form.setValue('name', suggestedName, { shouldValidate: true })
    setConflict(false)
    form.setFocus('name')
  }

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
    conflictMessage: RENAME_CONFLICT[item.type],
    suggestedName,
    applySuggestion,
    isLoading,
    onSubmit,
  }
}
