import type { FolderItem } from '@/types'

/**
 * FR-EXP-16: the row menu and the context menu offer the same set.
 *
 * Everything except `onOpen` is optional: an action with no handler is not
 * rendered, which is how a viewer ends up with "Open" alone (FR-PERM-03) and
 * how flows that do not exist yet stay out of the UI.
 */
export interface NodeActions {
  onOpen: (item: FolderItem) => void
  /** FR-EXP-19: the only way the details panel is opened. */
  onDetails?: (item: FolderItem) => void
  onShare?: (item: FolderItem) => void
  onRename?: (item: FolderItem) => void
  onMove?: (item: FolderItem) => void
  onDelete?: (item: FolderItem) => void
}
