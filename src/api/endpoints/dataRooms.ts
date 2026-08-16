import { z } from 'zod'
import { apiSlice } from '@/api/apiSlice'
import { ENDPOINTS } from '@/shared/constants/ENDPOINTS'
import { dataRoomSchema, sharedWithMeItemSchema } from '@/types'
import type { DataRoom, SharedWithMeItem } from '@/types'

const dataRoomListSchema = z.array(dataRoomSchema)
const sharedWithMeListSchema = z.array(sharedWithMeItemSchema)

/**
 * The data room is the workspace picked on the start screen. There is no
 * "shared with me" endpoint yet, so only owned rooms can be listed.
 */
export const dataRoomsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    /** FR-ROOMS-01: the "My data rooms" tab. */
    getDataRooms: build.query<DataRoom[], void>({
      query: () => ({ url: ENDPOINTS.dataRooms, schema: dataRoomListSchema }),
      providesTags: (result) => [
        { type: 'DataRoom' as const, id: 'LIST' },
        ...(result ?? []).map((room) => ({
          type: 'DataRoom' as const,
          id: room.id,
        })),
      ],
    }),

    /**
     * FR-ROOMS-01: the "Shared with me" tab. `GET /shared-with-me` returns the
     * roots granted to the user, which can be a room, a folder or a file — the
     * list screen only shows the rooms among them.
     */
    getSharedWithMe: build.query<SharedWithMeItem[], void>({
      query: () => ({
        url: ENDPOINTS.sharedWithMe,
        schema: sharedWithMeListSchema,
      }),
      providesTags: [{ type: 'DataRoom', id: 'LIST-SHARED' }],
    }),

    createDataRoom: build.mutation<DataRoom, { name: string }>({
      query: (body) => ({
        url: ENDPOINTS.dataRooms,
        method: 'POST',
        data: body,
        schema: dataRoomSchema,
      }),
      invalidatesTags: [{ type: 'DataRoom', id: 'LIST' }],
    }),

    renameDataRoom: build.mutation<DataRoom, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: ENDPOINTS.dataRoom(id),
        method: 'PATCH',
        data: { name },
        schema: dataRoomSchema,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'DataRoom', id },
        { type: 'DataRoom', id: 'LIST' },
      ],
    }),

    /** FR-ROOMS-07: soft-deletes the room and everything under it. */
    deleteDataRoom: build.mutation<void, string>({
      query: (id) => ({ url: ENDPOINTS.dataRoom(id), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'DataRoom', id },
        { type: 'DataRoom', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetDataRoomsQuery,
  useGetSharedWithMeQuery,
  useCreateDataRoomMutation,
  useRenameDataRoomMutation,
  useDeleteDataRoomMutation,
} = dataRoomsApi
