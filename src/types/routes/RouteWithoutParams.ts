import type { Routes } from './Routes'
import type { RouteParams } from './RouteParams'

/** Routes that are plain static paths. */
export type RouteWithoutParams = {
  [K in Routes]: [RouteParams<K>] extends [never] ? K : never
}[Routes]
