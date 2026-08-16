import { z } from 'zod'
import { apiSlice } from '@/api/apiSlice'
import { ENDPOINTS } from '@/shared/constants/ENDPOINTS'
import { LIST } from '@/shared/constants/LIST'
import { shareSchema, shareViewSchema } from '@/types'
import type { Share, ShareKind, ShareResourceType, ShareView } from '@/types'

const shareListSchema = z.array(shareSchema)

interface ResourceRef {
  resourceType: ShareResourceType
  resourceId: string
}

/** FR-SHR: granting, listing and revoking access. Wired up in part 5. */
export const sharesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    /** FR-SHR-04: everyone and every link currently granted on a resource. */
    getShares: build.query<Share[], ResourceRef>({
      query: ({ resourceType, resourceId }) => ({
        url: ENDPOINTS.shares,
        params: { resourceType, resourceId },
        schema: shareListSchema,
      }),
      providesTags: (_result, _error, { resourceId }) => [
        { type: 'Share', id: resourceId },
      ],
    }),

    /**
     * FR-SHR-02 (`USER`) and FR-SHR-08 (`PUBLIC_LINK`) are the same call with
     * a different `kind`; only a user share carries an email.
     */
    createShare: build.mutation<
      Share,
      ResourceRef & {
        kind: ShareKind
        granteeEmail?: string
        expiresAt?: string
      }
    >({
      query: (body) => ({
        url: ENDPOINTS.shares,
        method: 'POST',
        data: body,
        schema: shareSchema,
      }),
      invalidatesTags: (_result, _error, { resourceId }) => [
        { type: 'Share', id: resourceId },
      ],
    }),

    /**
     * FR-SHR-06 / FR-SHR-09: revoking one person's access and turning the
     * public link back off are the same operation on a share row.
     */
    revokeShare: build.mutation<void, { id: string; resourceId: string }>({
      query: ({ id }) => ({ url: ENDPOINTS.share(id), method: 'DELETE' }),
      invalidatesTags: (_result, _error, { resourceId }) => [
        { type: 'Share', id: resourceId },
      ],
    }),

    /**
     * FR-PUB-03/04: reading through a public link. The token stands in for
     * authentication, so this is the one listing that does not depend on the
     * session. FR-PUB-05: a revoked or expired token fails with 404.
     */
    getShareView: build.infiniteQuery<
      ShareView,
      { token: string; folderId: string | null },
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      query: ({ queryArg, pageParam }) => ({
        url: queryArg.folderId
          ? ENDPOINTS.shareViewFolder(queryArg.token, queryArg.folderId)
          : ENDPOINTS.shareView(queryArg.token),
        params: { cursor: pageParam ?? undefined, limit: LIST.pageSize },
        schema: shareViewSchema,
      }),
      providesTags: (_result, _error, { token, folderId }) => [
        { type: 'Share', id: `view:${token}:${folderId ?? 'root'}` },
      ],
    }),
  }),
})

export const {
  useGetSharesQuery,
  useCreateShareMutation,
  useRevokeShareMutation,
  useGetShareViewInfiniteQuery,
} = sharesApi
