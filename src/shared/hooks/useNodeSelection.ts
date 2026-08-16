import { useEffect } from 'react'
import { useAppDispatch } from './useAppDispatch'
import { useAppSelector } from './useAppSelector'
import {
  detailsClosed,
  detailsOpened,
  nodeSelected,
  selectIsDetailsPanelOpen,
  selectSelectedNodeId,
  selectionCleared,
} from '@/store'
import type { FolderItem } from '@/types'

interface UseNodeSelectionArgs {
  /** The listing on screen. The selected row is looked up in it. */
  items: FolderItem[]
  /**
   * Identifies the listing being shown. FR-EXP-19: when it changes the
   * selection is dropped — a row from the folder just left must not keep a
   * details panel open over the one just entered.
   */
  listingKey: string
}

/**
 * Which row is picked, and whether its details are on show.
 *
 * The two are stored separately because they answer different questions: a
 * click selects, and only the "Details" action opens the panel. Both the
 * owner's explorer and the visitor's read them the same way, which is why this
 * lives in `shared` rather than beside either one.
 *
 * `detailsOpen` is reported raw. Callers pair it with `selectedItem`, and doing
 * so themselves is what lets TypeScript narrow the item away from `null` before
 * it reaches the panel.
 */
export function useNodeSelection({ items, listingKey }: UseNodeSelectionArgs) {
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector(selectSelectedNodeId)
  const detailsOpen = useAppSelector(selectIsDetailsPanelOpen)

  useEffect(() => {
    dispatch(selectionCleared())
  }, [dispatch, listingKey])

  const selectedItem = items.find((item) => item.id === selectedId) ?? null

  return {
    selectedId,
    selectedItem,
    detailsOpen,
    select: (item: FolderItem) => dispatch(nodeSelected(item.id)),
    /**
     * FR-CRE-05: a node that has just been created has an id but no row yet —
     * the listing has still to refetch. Selecting it by id means the row is
     * already picked out by the time it appears.
     */
    selectId: (id: string) => dispatch(nodeSelected(id)),
    /**
     * FR-EXP-19: reading the details is not a mutation, so everyone who can see
     * the row can ask for them.
     */
    openDetails: (item: FolderItem) => dispatch(detailsOpened(item.id)),
    closeDetails: () => dispatch(detailsClosed()),
  }
}
