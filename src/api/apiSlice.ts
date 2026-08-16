import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'

/**
 * FR-STATE-01: all server state lives in this cache. Slices never mirror it.
 * Endpoints are attached per domain from `src/api/endpoints/*`.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Session',
    'DataRoom',
    'FolderContents',
    'Folder',
    'FolderStats',
    'File',
    'Share',
  ],
  endpoints: () => ({}),
})
