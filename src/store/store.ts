import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistConfig,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { apiSlice, initApiWithStore } from '@/api'
import rootReducer from './rootReducer'
import { PERSISTED_SLICES } from './persistConfig'

type RootReducerState = ReturnType<typeof rootReducer>

const rootPersistConfig: PersistConfig<RootReducerState> = {
  key: 'root',
  storage,
  whitelist: [...PERSISTED_SLICES],
}

const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
})

export const persistor = persistStore(store)

/** FR-EXP-26: lets RTK Query refetch when the connection comes back. */
setupListeners(store.dispatch)

// The axios instance reads the in-memory token straight off the store.
initApiWithStore(store.getState)
