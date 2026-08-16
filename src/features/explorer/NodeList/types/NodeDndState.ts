/** FR-MOV-01/05/13: what a row needs to take part in drag-and-drop. */
export interface NodeDndState {
  /** Off for a viewer, and while no move handler exists. */
  canDrag: boolean
  /** The folder the listing shows — never a destination for its own rows. */
  currentParentId: string | null
  /**
   * Its name. A drag can walk into other folders (FR-MOV-06), so a row has to
   * carry where it came from with it — the toast and its Undo name that folder
   * long after the listing has moved on.
   */
  currentParentName: string
  /**
   * Path of the folder on screen, root-first. A drop target uses it to spot
   * that it now sits inside the subtree being dragged (FR-MOV-05).
   */
  ancestorIds: string[]
}
