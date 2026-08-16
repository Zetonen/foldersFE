import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthResponse, User } from '@/types'

export type AuthStatus =
  'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  user: User | null
  /**
   * FR-STATE-03 / FR-STATE-04: excluded from persistence, so it only ever
   * lives in memory for the lifetime of the tab.
   */
  accessToken: string | null
  status: AuthStatus
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'idle',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.status = 'authenticated'
    },
    sessionLoading: (state) => {
      state.status = 'loading'
    },
    /** FR-AUTH-13: also fired by the 401 interceptor. */
    sessionCleared: (state) => {
      state.user = null
      state.accessToken = null
      state.status = 'unauthenticated'
    },
    userUpdated: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
})

export const { sessionStarted, sessionLoading, sessionCleared, userUpdated } =
  authSlice.actions

export const authReducer = authSlice.reducer
