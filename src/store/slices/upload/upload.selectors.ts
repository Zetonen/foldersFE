import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/types'

export const selectUploadItems = (state: RootState) => state.upload.items
export const selectUploadPanelCollapsed = (state: RootState) =>
  state.upload.panelCollapsed
export const selectUploadConflicts = (state: RootState) =>
  state.upload.conflicts

/** FR-UPL-16 / FR-UPL-22: is anything still in flight? */
export const selectHasActiveUploads = createSelector(
  selectUploadItems,
  (items) =>
    items.some(
      (item) =>
        item.status === 'waiting' ||
        item.status === 'uploading' ||
        item.status === 'processing'
    )
)

export const selectIsUploadPanelVisible = createSelector(
  selectUploadItems,
  (items) => items.length > 0
)

/** FR-UPL-15: header count — active while running, completed once done. */
export const selectUploadCounts = createSelector(
  selectUploadItems,
  (items) => ({
    total: items.length,
    done: items.filter((item) => item.status === 'done').length,
    failed: items.filter((item) => item.status === 'failed').length,
  })
)

/** FR-UPL-19: aggregate progress is bytes sent over bytes queued. */
export const selectOverallUploadProgress = createSelector(
  selectUploadItems,
  (items) => {
    const total = items.reduce((sum, item) => sum + item.size, 0)
    if (total === 0) return 0
    const sent = items.reduce((sum, item) => sum + item.bytesSent, 0)
    return Math.round((sent / total) * 100)
  }
)
