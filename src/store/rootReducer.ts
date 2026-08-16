import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import { apiSlice } from '@/api/apiSlice'
import { authPersistConfig, uiPersistConfig } from './persistConfig'
import { authReducer } from './slices/auth/auth.slice'
import { uiReducer } from './slices/ui/ui.slice'
import { uploadReducer } from './slices/upload/upload.slice'
import { selectionReducer } from './slices/selection/selection.slice'

/** FR-STATE-01/02: RTK Query holds server state, the slices hold the rest. */
export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  // Nested persistence so the access token can be blacklisted on its own.
  auth: persistReducer(authPersistConfig, authReducer),
  ui: persistReducer(uiPersistConfig, uiReducer),
  upload: uploadReducer,
  selection: selectionReducer,
})

export default rootReducer
