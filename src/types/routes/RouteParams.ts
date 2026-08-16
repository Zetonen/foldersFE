import type { ROUTES } from '@/shared/constants/ROUTES'
import type { Routes } from './Routes'

/**
 * Pulls the `:name` segments out of a route template, so `getRoute` can demand
 * exactly the params a given route needs — `/rooms/:roomId/f/:folderId`
 * yields `'roomId' | 'folderId'`.
 */
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never

export type RouteParams<K extends Routes> = ExtractParams<(typeof ROUTES)[K]>

export type RouteParamsMap<K extends Routes> = Record<RouteParams<K>, string>
