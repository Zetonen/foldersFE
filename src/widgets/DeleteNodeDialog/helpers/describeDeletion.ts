import { formatBytes } from '@/shared/helpers/formatBytes'
import type { FolderStats, NodeRef } from '@/types'

/** FR-DEL-02/03: the warning names the item and, for a folder, its contents. */
export function describeDeletion(item: NodeRef): string {
  if (item.type === 'FOLDER') {
    return `“${item.name}” and everything inside it will be permanently deleted. This cannot be undone.`
  }

  return `“${item.name}” will be permanently deleted. This cannot be undone.`
}

/**
 * FR-DEL-03: the subtree breakdown shown under the warning.
 *
 * Deleting a folder soft-deletes its whole branch, so the warning counts the
 * branch — the `subtree*` totals, never what happens to sit at this level.
 */
export function describeSubtree(stats: FolderStats): string {
  const { subtreeFileCount: fileCount, subtreeFolderCount: folderCount } = stats

  const files = `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`
  const size = formatBytes(stats.totalSize)

  // A flat folder has no nested folders to name, and "in 0 folders" would be
  // an odd way to say so.
  if (folderCount === 0) return `${files} · ${size}`

  const folders = `${folderCount} ${folderCount === 1 ? 'folder' : 'folders'}`

  return `${files} in ${folders} · ${size}`
}
