import { apiSlice } from '@/api/apiSlice'
import {
  removeItemFromCache,
  renameItemInCache,
} from '@/api/helpers/folderContentsCache'
import { ENDPOINTS, SHARE_TOKEN_HEADER } from '@/shared/constants/ENDPOINTS'
import { downloadUrlSchema, fileSchema, uploadUrlSchema } from '@/types'
import type { DataFile, DownloadUrl, UploadUrl } from '@/types'
import { foldersApi, folderContentsId } from './folders'

/** `CreateUploadUrlDto` — step one of the upload. */
export interface CreateUploadUrlPayload {
  dataRoomId: string
  folderId: string | null
  fileName: string
  sizeBytes: number
  mimeType: string
}

/**
 * FR-PUB-04: a file reached through a public link is authorised by the share
 * token rather than by ownership, which the API takes as a header.
 */
export interface FileRef {
  fileId: string
  shareToken?: string
}

const shareHeaders = (token: string | undefined) =>
  token ? { [SHARE_TOKEN_HEADER]: token } : undefined

/** `ConfirmUploadDto` — step three, once the bytes are in storage. */
export interface ConfirmUploadPayload {
  storageKey: string
  dataRoomId: string
  folderId: string | null
  name: string
  sizeBytes: number
  mimeType: string
}

export const filesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    /**
     * FR-UPL-08: the server is the real gate. A file that is too large or of
     * the wrong type is refused here with 413 / 415, before a byte is sent.
     */
    createUploadUrl: build.mutation<UploadUrl, CreateUploadUrlPayload>({
      query: (body) => ({
        url: ENDPOINTS.fileUploadUrl,
        method: 'POST',
        data: body,
        schema: uploadUrlSchema,
      }),
    }),

    /** FR-UPL-09/10: a name collision surfaces here as a 409. */
    confirmUpload: build.mutation<DataFile, ConfirmUploadPayload>({
      query: (body) => ({
        url: ENDPOINTS.fileConfirm,
        method: 'POST',
        data: body,
        schema: fileSchema,
      }),
      // FR-UPL-21: the file appears in its folder even if the user has moved on.
      invalidatesTags: (_result, _error, { dataRoomId, folderId }) => [
        { type: 'FolderContents', id: folderContentsId(dataRoomId, folderId) },
      ],
    }),

    /**
     * FR-VIEW-04: the viewer reads the PDF through a short-lived signed URL,
     * fetched separately from the metadata. Edge case 16: re-running this
     * query is exactly what the "Try again" button does when a link expires.
     */
    getFileDownloadUrl: build.query<DownloadUrl, FileRef>({
      query: ({ fileId, shareToken }) => ({
        url: ENDPOINTS.fileDownloadUrl(fileId),
        headers: shareHeaders(shareToken),
        schema: downloadUrlSchema,
      }),
      /** Signed links are deliberately not cached beyond their use. */
      keepUnusedDataFor: 0,
    }),

    getFile: build.query<DataFile, FileRef>({
      query: ({ fileId, shareToken }) => ({
        url: ENDPOINTS.file(fileId),
        headers: shareHeaders(shareToken),
        schema: fileSchema,
      }),
      providesTags: (_result, _error, { fileId }) => [
        { type: 'File', id: fileId },
      ],
    }),

    /** FR-REN-05: optimistic, with the old name restored on a 409. */
    renameFile: build.mutation<
      DataFile,
      {
        id: string
        name: string
        dataRoomId: string
        folderId: string | null
      }
    >({
      query: ({ id, name }) => ({
        url: ENDPOINTS.file(id),
        method: 'PATCH',
        data: { name },
        schema: fileSchema,
      }),
      async onQueryStarted(
        { id, name, dataRoomId, folderId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          foldersApi.util.updateQueryData(
            'getFolderContents',
            { dataRoomId, folderId },
            (draft) => renameItemInCache(draft, id, name)
          )
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (_result, _error, { id, dataRoomId, folderId }) => [
        { type: 'File', id },
        { type: 'FolderContents', id: folderContentsId(dataRoomId, folderId) },
      ],
    }),

    /** FR-MOV-12: the row leaves the source list on drop. */
    moveFile: build.mutation<
      DataFile,
      {
        id: string
        dataRoomId: string
        fromFolderId: string | null
        toFolderId: string | null
      }
    >({
      query: ({ id, toFolderId }) => ({
        url: ENDPOINTS.fileMove(id),
        method: 'POST',
        data: { folderId: toFolderId },
        schema: fileSchema,
      }),
      async onQueryStarted(
        { id, dataRoomId, fromFolderId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          foldersApi.util.updateQueryData(
            'getFolderContents',
            { dataRoomId, folderId: fromFolderId },
            (draft) => removeItemFromCache(draft, id)
          )
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (
        _result,
        _error,
        { id, dataRoomId, fromFolderId, toFolderId }
      ) => [
        { type: 'File', id },
        {
          type: 'FolderContents',
          id: folderContentsId(dataRoomId, fromFolderId),
        },
        {
          type: 'FolderContents',
          id: folderContentsId(dataRoomId, toFolderId),
        },
      ],
    }),

    /** FR-DEL-06: a failed delete puts the row back. */
    deleteFile: build.mutation<
      void,
      { id: string; dataRoomId: string; folderId: string | null }
    >({
      query: ({ id }) => ({ url: ENDPOINTS.file(id), method: 'DELETE' }),
      async onQueryStarted(
        { id, dataRoomId, folderId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          foldersApi.util.updateQueryData(
            'getFolderContents',
            { dataRoomId, folderId },
            (draft) => removeItemFromCache(draft, id)
          )
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (_result, _error, { id, dataRoomId, folderId }) => [
        { type: 'File', id },
        { type: 'FolderContents', id: folderContentsId(dataRoomId, folderId) },
      ],
    }),
  }),
})

export const {
  useCreateUploadUrlMutation,
  useConfirmUploadMutation,
  useGetFileDownloadUrlQuery,
  useGetFileQuery,
  useLazyGetFileQuery,
  useRenameFileMutation,
  useMoveFileMutation,
  useDeleteFileMutation,
} = filesApi
