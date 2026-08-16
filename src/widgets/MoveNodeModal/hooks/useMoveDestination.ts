import { useState } from 'react'

interface UseMoveDestinationArgs {
  currentFolderId: string | null
  currentFolderName: string
}

/** FR-MOV-11: where the picker currently points, and whether that is a move. */
export function useMoveDestination({
  currentFolderId,
  currentFolderName,
}: UseMoveDestinationArgs) {
  const [destination, setDestination] = useState<{
    id: string | null
    name: string
  }>({ id: currentFolderId, name: currentFolderName })

  return {
    destination,
    setDestination,
    // FR-MOV-05: moving into the folder it already sits in is not a move.
    unchanged: destination.id === currentFolderId,
  }
}
