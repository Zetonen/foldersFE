import {
  useDeleteFileMutation,
  useDeleteFolderMutation,
  useGetFolderStatsQuery,
} from '@/api'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { isAppError, type NodeRef } from '@/types'

interface UseDeleteNodeArgs {
  item: NodeRef | null
  dataRoomId: string
  parentId: string | null
  onDeleted?: (item: NodeRef) => void
  onOpenChange: (open: boolean) => void
}

/** FR-DEL-02..06: the subtree warning and the deletion itself. */
export function useDeleteNode({
  item,
  dataRoomId,
  parentId,
  onDeleted,
  onOpenChange,
}: UseDeleteNodeArgs) {
  const [deleteFolder, { isLoading: isDeletingFolder }] =
    useDeleteFolderMutation()
  const [deleteFile, { isLoading: isDeletingFile }] = useDeleteFileMutation()

  const isFolder = item?.type === 'FOLDER'

  // FR-DEL-03: the warning spells out what the subtree contains.
  const { data: stats, isLoading: statsLoading } = useGetFolderStatsQuery(
    { folderId: item?.id ?? '' },
    { skip: !item || !isFolder }
  )

  const confirm = async () => {
    if (!item) return

    try {
      const args = { id: item.id, dataRoomId }

      if (isFolder) {
        await deleteFolder({ ...args, parentId }).unwrap()
      } else {
        await deleteFile({ ...args, folderId: parentId }).unwrap()
      }

      onDeleted?.(item)
      onOpenChange(false)
    } catch (error) {
      // The optimistic patch has already restored the row.
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  }

  return {
    isFolder,
    stats,
    statsLoading,
    isDeleting: isDeletingFolder || isDeletingFile,
    confirm,
  }
}
