import { useState } from 'react'
import { useGetFolderContentsInfiniteQuery } from '@/api'

interface UseFolderPickerArgs {
  dataRoomId: string
  initialFolderId: string | null
  /** FR-MOV-05: the node being moved cannot be entered or targeted. */
  excludeId: string
  onChange: (folderId: string | null, folderName: string) => void
}

/** FR-MOV-11: drilling through the tree to pick a destination. */
export function useFolderPicker({
  dataRoomId,
  initialFolderId,
  excludeId,
  onChange,
}: UseFolderPickerArgs) {
  const [browsing, setBrowsing] = useState<string | null>(initialFolderId)

  const { data, isFetching } = useGetFolderContentsInfiniteQuery({
    dataRoomId,
    folderId: browsing,
  })

  const page = data?.pages[0]

  const folders =
    data?.pages
      .flatMap((entry) => entry.items)
      .filter((item) => item.type === 'FOLDER' && item.id !== excludeId) ?? []

  const roomName = page?.dataRoom?.name ?? ''

  return {
    folders,
    trail: page?.breadcrumbs ?? [],
    roomName,
    isLoading: isFetching && folders.length === 0,
    enter: (folderId: string | null, folderName: string) => {
      setBrowsing(folderId)
      onChange(folderId, folderName)
    },
  }
}
