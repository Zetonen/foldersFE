import type { FolderContents } from '@/types'

/** The shape RTK Query stores for an infinite query. */
export interface FolderContentsCache {
  pages: FolderContents[]
}

/**
 * FR-STATE-08: the listing is edited in place so the change is visible before
 * the request resolves. Every helper here is a no-op when the item is not in
 * the loaded pages, which makes rollback safe to apply unconditionally.
 */
export function renameItemInCache(
  draft: FolderContentsCache,
  itemId: string,
  name: string
): void {
  for (const page of draft.pages) {
    const item = page.items.find((entry) => entry.id === itemId)
    if (item) {
      item.name = name
      return
    }
  }
}

/** FR-MOV-12 / FR-DEL-06: the row leaves the list immediately. */
export function removeItemFromCache(
  draft: FolderContentsCache,
  itemId: string
): void {
  for (const page of draft.pages) {
    const index = page.items.findIndex((entry) => entry.id === itemId)
    if (index !== -1) {
      page.items.splice(index, 1)
      return
    }
  }
}
