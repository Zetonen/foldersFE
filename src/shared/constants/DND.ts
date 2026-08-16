import type { FolderItem } from '@/types'

/**
 * FR-MOV-01/02: drag-and-drop identifiers. Droppables live in three different
 * layers (list rows, breadcrumbs, sidebar), so the id encoding is shared
 * rather than owned by any one of them.
 */
export const DND = {
  /** FR-MOV-06: hovering a folder this long during a drag opens it. */
  springOpenMs: 2000,
  /** Pointer travel before a drag starts, so a click still selects a row. */
  activationDistance: 6,
} as const

/**
 * Which surface a drop target belongs to. The same folder is offered by
 * several of them at once — the data room root is both "All files" in the
 * sidebar and the first breadcrumb — and dnd-kit keys its droppables by id, so
 * without the surface in the id the two would overwrite each other.
 */
export type DropScope = 'row' | 'list' | 'crumb' | 'sidebar'

/** `null` is the data room root, which is a valid destination. */
export const droppableId = (folderId: string | null, scope: DropScope) =>
  `drop:${scope}:${folderId ?? 'root'}`

export const draggableId = (itemId: string) => `drag:${itemId}`

export interface DroppableData {
  folderId: string | null
  /** FR-MOV-06: only list rows spring open; breadcrumbs navigate instantly. */
  springOpen: boolean
}

export interface DraggableData {
  /**
   * The whole node, not just its id. FR-MOV-06 lets a drag walk into other
   * folders, and by the time it is dropped the listing that produced this row
   * is no longer on screen — so the drop cannot look the node up any more.
   */
  item: FolderItem
  /** The folder the drag started in, which is where the node still lives. */
  fromFolderId: string | null
  /** Its name, for the "Moved to…" toast and its Undo. */
  fromFolderName: string
}
