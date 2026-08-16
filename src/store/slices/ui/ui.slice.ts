import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ViewMode } from '@/types'

export interface UiState {
  /**
   * FR-EXP-11: list or grid. Persisted, so the choice survives a reload the
   * way it does in the file managers people are used to.
   */
  viewMode: ViewMode
  /** FR-EXP-03: the drawer state below 1024px. */
  sidebarOpen: boolean
  /**
   * FR-ERR-01 (429): epoch milliseconds until which the server asked us to
   * stop. Actions stay blocked for the whole window instead of letting the
   * user hammer a button that can only fail.
   */
  rateLimitedUntil: number | null
}

const initialState: UiState = {
  viewMode: 'table',
  sidebarOpen: false,
  rateLimitedUntil: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    viewModeChanged: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload
    },
    sidebarToggled: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    sidebarClosed: (state) => {
      state.sidebarOpen = false
    },
    rateLimited: (state, action: PayloadAction<number>) => {
      state.rateLimitedUntil = action.payload
    },
    rateLimitCleared: (state) => {
      state.rateLimitedUntil = null
    },
  },
})

export const {
  viewModeChanged,
  sidebarToggled,
  sidebarClosed,
  rateLimited,
  rateLimitCleared,
} = uiSlice.actions

export const uiReducer = uiSlice.reducer
