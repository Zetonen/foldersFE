import { apiSlice } from '@/api/apiSlice'
import {
  removeItemFromCache,
  renameItemInCache,
} from '@/api/helpers/folderContentsCache'
import { ENDPOINTS, SHARE_TOKEN_HEADER } from '@/shared/constants/ENDPOINTS'
import { LIST } from '@/shared/constants/LIST'
import { folderContentsSchema, folderSchema, folderStatsSchema } from '@/types'
import type { Folder, FolderContents, FolderStats } from '@/types'

/** One cache entry per folder listing; `null` is the data room root. */
export const folderContentsId = (dataRoomId: string, folderId: string | null) =>
  `${dataRoomId}:${folderId ?? 'root'}`

/** FR-PUB-03: a viewer is authorised by the share token, not by ownership. */
export interface FolderStatsArgs {
  folderId: string
  shareToken?: string
}

export interface FolderContentsArgs {
  dataRoomId: string
  /** `null` lists the data room root. */
  folderId: string | null
}

export const foldersApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    /**
     * FR-EXP-18: keyset pagination, next page requested at 80% scroll.
     * The root and a nested folder are different endpoints on the backend but
     * one query here, since the screen does not care which it is.
     *
     * The cursor is opaque: it is handed back exactly as it came, never parsed
     * or assembled, and it is only valid for the same folder in the same sort
     * order — which is why each folder gets its own cache entry and starts
     * from `null`. The end of a folder is `nextCursor === null` and nothing
     * else; a page shorter than `limit` says nothing about what follows.
     *
     * The response also carries the breadcrumbs (FR-ROUTE-03) and the data
     * room reference, so no extra request is needed for the path.
     */
    getFolderContents: build.infiniteQuery<
      FolderContents,
      FolderContentsArgs,
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      query: ({ queryArg, pageParam }) => ({
        url: queryArg.folderId
          ? ENDPOINTS.folderChildren(queryArg.folderId)
          : ENDPOINTS.dataRoomRoot(queryArg.dataRoomId),
        params: { cursor: pageParam ?? undefined, limit: LIST.pageSize },
        schema: folderContentsSchema,
      }),
      providesTags: (_result, _error, { dataRoomId, folderId }) => [
        {
          type: 'FolderContents',
          id: folderContentsId(dataRoomId, folderId),
        },
      ],
    }),

    /**
     * A shared folder arrives with nothing but its own id, and every explorer
     * URL also needs the data room. One page of one item is the cheapest way
     * to ask the backend which room a folder belongs to — the answer is
     * `folder.dataRoomId`, which is present even when the `dataRoom` reference
     * is withheld from a recipient.
     */
    resolveFolderRoom: build.query<FolderContents, string>({
      query: (folderId) => ({
        url: ENDPOINTS.folderChildren(folderId),
        params: { limit: 1 },
        schema: folderContentsSchema,
      }),
    }),

    /**
     * FR-EXP-20 / FR-DEL-03: both the direct and the subtree totals of a
     * folder, computed server-side. Which set a screen reads is its own
     * decision — see `folderStatsSchema`.
     */
    getFolderStats: build.query<FolderStats, FolderStatsArgs>({
      query: ({ folderId, shareToken }) => ({
        url: ENDPOINTS.folderStats(folderId),
        headers: shareToken ? { [SHARE_TOKEN_HEADER]: shareToken } : undefined,
        schema: folderStatsSchema,
      }),
      providesTags: (_result, _error, { folderId }) => [
        { type: 'FolderStats', id: folderId },
      ],
    }),

    /** FR-FLD-01..04. The new folder arrives through the invalidated listing. */
    createFolder: build.mutation<
      Folder,
      { dataRoomId: string; parentId: string | null; name: string }
    >({
      query: (body) => ({
        url: ENDPOINTS.folders,
        method: 'POST',
        data: body,
        schema: folderSchema,
      }),
      invalidatesTags: (_result, _error, { dataRoomId, parentId }) => [
        { type: 'FolderContents', id: folderContentsId(dataRoomId, parentId) },
      ],
    }),

    /** FR-REN-05: the name changes at once; a failure puts the old one back. */
    renameFolder: build.mutation<
      Folder,
      {
        id: string
        name: string
        dataRoomId: string
        parentId: string | null
      }
    >({
      query: ({ id, name }) => ({
        url: ENDPOINTS.folder(id),
        method: 'PATCH',
        data: { name },
        schema: folderSchema,
      }),
      async onQueryStarted(
        { id, name, dataRoomId, parentId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          foldersApi.util.updateQueryData(
            'getFolderContents',
            { dataRoomId, folderId: parentId },
            (draft) => renameItemInCache(draft, id, name)
          )
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (_result, _error, { id, dataRoomId, parentId }) => [
        { type: 'Folder', id },
        { type: 'FolderContents', id: folderContentsId(dataRoomId, parentId) },
      ],
    }),

    /**
     * FR-MOV-05: the backend rejects cycles and depth-limit breaches with 400,
     * so the client only needs to hide the obviously invalid drop targets.
     * FR-MOV-12: the row leaves the source list on drop and returns on failure.
     * A name collision at the destination comes back as a 409, which the
     * caller resolves by renaming first (FR-MOV-11).
     */
    moveFolder: build.mutation<
      Folder,
      {
        id: string
        dataRoomId: string
        fromParentId: string | null
        toParentId: string | null
      }
    >({
      query: ({ id, toParentId }) => ({
        url: ENDPOINTS.folderMove(id),
        method: 'POST',
        data: { parentId: toParentId },
        schema: folderSchema,
      }),
      async onQueryStarted(
        { id, dataRoomId, fromParentId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          foldersApi.util.updateQueryData(
            'getFolderContents',
            { dataRoomId, folderId: fromParentId },
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
        { id, dataRoomId, fromParentId, toParentId }
      ) => [
        { type: 'Folder', id },
        {
          type: 'FolderContents',
          id: folderContentsId(dataRoomId, fromParentId),
        },
        {
          type: 'FolderContents',
          id: folderContentsId(dataRoomId, toParentId),
        },
      ],
    }),

    /** FR-DEL-06: soft-deletes the subtree; a failure restores the row. */
    deleteFolder: build.mutation<
      void,
      { id: string; dataRoomId: string; parentId: string | null }
    >({
      query: ({ id }) => ({ url: ENDPOINTS.folder(id), method: 'DELETE' }),
      async onQueryStarted(
        { id, dataRoomId, parentId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          foldersApi.util.updateQueryData(
            'getFolderContents',
            { dataRoomId, folderId: parentId },
            (draft) => removeItemFromCache(draft, id)
          )
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (_result, _error, { id, dataRoomId, parentId }) => [
        { type: 'Folder', id },
        { type: 'FolderStats', id },
        { type: 'FolderContents', id: folderContentsId(dataRoomId, parentId) },
      ],
    }),
  }),
})

export const {
  useGetFolderContentsInfiniteQuery,
  useLazyResolveFolderRoomQuery,
  useGetFolderStatsQuery,
  useCreateFolderMutation,
  useRenameFolderMutation,
  useMoveFolderMutation,
  useDeleteFolderMutation,
} = foldersApi
