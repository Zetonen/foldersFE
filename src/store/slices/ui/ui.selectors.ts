import { VIEW_MODES } from '@/shared/constants/LIST'
import type { RootState } from '@/types'

export const selectViewMode = (state: RootState) => state.ui.viewMode
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen
export const selectRateLimitedUntil = (state: RootState) =>
  state.ui.rateLimitedUntil

/** FR-EXP-11: the switcher stays hidden while only one mode is available. */
export const selectIsViewModeSwitchVisible = () => VIEW_MODES.length > 1
