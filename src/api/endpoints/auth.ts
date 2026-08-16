import { z } from 'zod'
import { apiSlice } from '@/api/apiSlice'
import { ENDPOINTS } from '@/shared/constants/ENDPOINTS'
import { authResponseSchema, userSchema } from '@/types'
import type { AuthResponse, User } from '@/types'

/**
 * `state` is a short-lived token the backend signs and embeds in `url`. Google
 * hands it back on the callback, and step three returns it so the backend can
 * confirm the flow being completed is the one it started.
 */
const googleAuthUrlSchema = z.object({ url: z.url(), state: z.string() })

export type GoogleAuthUrl = z.infer<typeof googleAuthUrlSchema>

/** `RegisterDto`. */
export interface RegisterPayload {
  email: string
  password: string
  name: string
}

/** `LoginDto`. */
export interface LoginPayload {
  email: string
  password: string
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: ENDPOINTS.register,
        method: 'POST',
        data: body,
        schema: authResponseSchema,
      }),
      invalidatesTags: ['Session'],
    }),

    login: build.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({
        url: ENDPOINTS.login,
        method: 'POST',
        data: body,
        schema: authResponseSchema,
      }),
      invalidatesTags: ['Session'],
    }),

    /**
     * FR-AUTH-13: exchanges the httpOnly `refresh_token` cookie for a new
     * access token. Runs on boot to restore the session the store cannot keep.
     */
    refresh: build.mutation<AuthResponse, void>({
      query: () => ({
        url: ENDPOINTS.refresh,
        method: 'POST',
        schema: authResponseSchema,
      }),
      invalidatesTags: ['Session'],
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: ENDPOINTS.logout, method: 'POST' }),
      invalidatesTags: ['Session'],
    }),

    getMe: build.query<User, void>({
      query: () => ({ url: ENDPOINTS.me, schema: userSchema }),
      providesTags: ['Session'],
    }),

    /**
     * FR-AUTH-07: one flow serves both sign-up and sign-in; the account is
     * created on first use, and an address that already signed up with a
     * password is linked rather than duplicated.
     *
     * Answers 503 when the server has no Google credentials configured, which
     * is a deployment state rather than a failure of this screen.
     */
    getGoogleAuthUrl: build.query<GoogleAuthUrl, void>({
      query: () => ({
        url: ENDPOINTS.googleAuthUrl,
        schema: googleAuthUrlSchema,
      }),
    }),

    /** FR-AUTH-11: redeems the code carried by the callback. */
    exchangeGoogleCode: build.mutation<
      AuthResponse,
      { code: string; state?: string }
    >({
      query: (body) => ({
        url: ENDPOINTS.googleCallback,
        method: 'POST',
        data: body,
        schema: authResponseSchema,
      }),
      invalidatesTags: ['Session'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetGoogleAuthUrlQuery,
  useExchangeGoogleCodeMutation,
} = authApi
