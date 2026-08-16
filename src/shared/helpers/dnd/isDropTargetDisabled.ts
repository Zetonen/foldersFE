interface DropTargetArgs {
  /** `null` is the data room root. */
  targetFolderId: string | null
  /** The node being dragged, or `undefined` when nothing is. */
  activeItemId: string | undefined
  /**
   * The folder that node lives in. It comes from the drag itself, not from the
   * screen: after a spring-open (FR-MOV-06) the listing has moved on while the
   * node has not.
   */
  fromFolderId: string | null | undefined
  /**
   * FR-MOV-05: true once the user has spring-opened into the dragged folder,
   * which makes everything on screen part of its own subtree.
   */
  insideDraggedSubtree: boolean
}

/**
 * FR-MOV-04/05: a target is refused when it is the dragged node itself, any of
 * its descendants, or the folder it already sits in.
 */
export function isDropTargetDisabled({
  targetFolderId,
  activeItemId,
  fromFolderId,
  insideDraggedSubtree,
}: DropTargetArgs): boolean {
  if (!activeItemId) return true
  if (insideDraggedSubtree) return true
  if (targetFolderId === activeItemId) return true
  if (targetFolderId === fromFolderId) return true

  return false
}
