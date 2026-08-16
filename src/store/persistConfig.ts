import storage from 'redux-persist/lib/storage'
import type { PersistConfig } from 'redux-persist'
import type { AuthState } from './slices/auth/auth.slice'
import type { UiState } from './slices/ui/ui.slice'

/**
 * FR-STATE-04: the token is deliberately kept out of storage — it is restored
 * by a refresh call on boot, never read back from disk.
 */
export const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  storage,
  blacklist: ['accessToken'],
}

/** FR-STATE-03: the persisted slices are listed explicitly. */
export const PERSISTED_SLICES = ['auth', 'ui'] as const

/**
 * The rate-limit window is a live hint from the server, not a preference —
 * restoring a stale one from disk would block the UI for no reason.
 */
export const uiPersistConfig: PersistConfig<UiState> = {
  key: 'ui',
  storage,
  blacklist: ['rateLimitedUntil'],
}
