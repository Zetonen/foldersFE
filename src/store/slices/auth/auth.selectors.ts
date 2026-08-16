import type { RootState } from '@/types'

export const selectAuthUser = (state: RootState) => state.auth.user
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectIsLoggedIn = (state: RootState) =>
  state.auth.status === 'authenticated'
export const selectUserEmail = (state: RootState) =>
  state.auth.user?.email ?? null
