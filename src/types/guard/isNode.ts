import type { FolderItem } from '@/types/models/Folder'

/**
 * `FolderItemDto` is a flat row rather than a discriminated union, so these
 * narrow the nullable file-only fields (`sizeBytes`, `mimeType`) as well.
 */
export type FolderListItem = FolderItem & { type: 'FOLDER' }
export type FileListItem = FolderItem & {
  type: 'FILE'
  sizeBytes: number
  mimeType: string
}

export const isFolderItem = (item: FolderItem): item is FolderListItem =>
  item.type === 'FOLDER'

export const isFileItem = (item: FolderItem): item is FileListItem =>
  item.type === 'FILE'
