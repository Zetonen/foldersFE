import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UploadConflict, UploadItem, UploadStatus } from '@/types'

export interface UploadState {
  /** FR-UPL-14: survives navigation between folders and pages. */
  items: UploadItem[]
  /** FR-UPL-15: the panel folds without losing the queue. */
  panelCollapsed: boolean
  /** FR-UPL-10: conflicts awaiting a decision, oldest first. */
  conflicts: UploadConflict[]
}

const initialState: UploadState = {
  items: [],
  panelCollapsed: false,
  conflicts: [],
}

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    /** FR-UPL-01: one batch per drop / per file-picker selection. */
    batchQueued: (state, action: PayloadAction<UploadItem[]>) => {
      state.items.push(...action.payload)
      state.panelCollapsed = false
    },
    uploadProgressed: (
      state,
      action: PayloadAction<{ id: string; progress: number; bytesSent: number }>
    ) => {
      const item = state.items.find((entry) => entry.id === action.payload.id)
      if (!item) return
      item.status = 'uploading'
      item.progress = action.payload.progress
      item.bytesSent = action.payload.bytesSent
    },
    uploadStatusChanged: (
      state,
      action: PayloadAction<{
        id: string
        status: UploadStatus
        fileId?: string
        error?: string
      }>
    ) => {
      const item = state.items.find((entry) => entry.id === action.payload.id)
      if (!item) return
      item.status = action.payload.status
      item.fileId = action.payload.fileId ?? item.fileId
      item.error = action.payload.error ?? null
    },
    /** FR-UPL-20: bookkeeping for the two automatic transport retries. */
    uploadRetried: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.id === action.payload)
      if (!item) return
      item.attempt += 1
      item.status = 'waiting'
      item.progress = 0
      item.bytesSent = 0
      item.error = null
    },
    conflictsDetected: (state, action: PayloadAction<UploadConflict[]>) => {
      state.conflicts.push(...action.payload)
    },
    /** FR-UPL-10 "Keep both": the queued file goes up under a free name. */
    uploadRenamed: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const item = state.items.find((entry) => entry.id === action.payload.id)
      if (item) item.name = action.payload.name
    },
    /**
     * FR-UPL-10 "Replace": records what this upload is standing in for. The
     * old file is not touched here — it goes only once the new one is safely
     * stored, so a failed transfer cannot leave the user with neither.
     */
    replaceTargetSet: (
      state,
      action: PayloadAction<{ id: string; fileId: string; name: string }>
    ) => {
      const item = state.items.find((entry) => entry.id === action.payload.id)
      if (!item) return
      item.replace = {
        fileId: action.payload.fileId,
        name: action.payload.name,
      }
    },
    /** FR-UPL-10 "Skip": one file leaves the queue, the batch continues. */
    uploadItemRemoved: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      state.conflicts = state.conflicts.filter(
        (conflict) => conflict.uploadId !== action.payload
      )
    },
    conflictResolved: (state, action: PayloadAction<string>) => {
      state.conflicts = state.conflicts.filter(
        (conflict) => conflict.uploadId !== action.payload
      )
    },
    /** FR-UPL-12: the conflict dialog cancels the whole batch, not one file. */
    batchCancelled: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.batchId !== action.payload
      )
      state.conflicts = []
    },
    panelCollapsedChanged: (state, action: PayloadAction<boolean>) => {
      state.panelCollapsed = action.payload
    },
    /** FR-UPL-16: only reachable once nothing is in flight. */
    panelClosed: (state) => {
      state.items = []
      state.conflicts = []
      state.panelCollapsed = false
    },
  },
})

export const {
  batchQueued,
  uploadProgressed,
  uploadStatusChanged,
  uploadRetried,
  conflictsDetected,
  uploadRenamed,
  replaceTargetSet,
  uploadItemRemoved,
  conflictResolved,
  batchCancelled,
  panelCollapsedChanged,
  panelClosed,
} = uploadSlice.actions

export const uploadReducer = uploadSlice.reducer
