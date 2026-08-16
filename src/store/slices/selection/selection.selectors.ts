import type { RootState } from '@/types'

export const selectSelectedNodeId = (state: RootState) =>
  state.selection.selectedNodeId

/** FR-EXP-19: opened from the actions menu, and closed by navigating away. */
export const selectIsDetailsPanelOpen = (state: RootState) =>
  state.selection.detailsOpen && state.selection.selectedNodeId !== null
