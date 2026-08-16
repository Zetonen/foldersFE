import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface SelectionState {
  /** FR-EXP-14: exactly one node at a time. FUT-08 turns this into a set. */
  selectedNodeId: string | null
  /**
   * FR-EXP-19, amended: selecting a row no longer opens the details panel —
   * it is asked for explicitly, from "Details" in the actions menu. Once open
   * it follows the selection, so clicking another row re-describes that row.
   */
  detailsOpen: boolean
}

const initialState: SelectionState = {
  selectedNodeId: null,
  detailsOpen: false,
}

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    nodeSelected: (state, action: PayloadAction<string>) => {
      state.selectedNodeId = action.payload
    },
    /** FR-EXP-19: also fired on navigation, which closes the details panel. */
    selectionCleared: (state) => {
      state.selectedNodeId = null
      state.detailsOpen = false
    },
    /** The node the panel describes is the selected one, so it selects too. */
    detailsOpened: (state, action: PayloadAction<string>) => {
      state.selectedNodeId = action.payload
      state.detailsOpen = true
    },
    /** Closing the panel leaves the row selected — only the panel goes away. */
    detailsClosed: (state) => {
      state.detailsOpen = false
    },
  },
})

export const { nodeSelected, selectionCleared, detailsOpened, detailsClosed } =
  selectionSlice.actions

export const selectionReducer = selectionSlice.reducer
