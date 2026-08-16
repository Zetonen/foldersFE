import type { Routes } from './Routes'
import type { RouteParams } from './RouteParams'

/** Routes whose template contains at least one dynamic segment. */
export type RouteWithParams = {
  [K in Routes]: [RouteParams<K>] extends [never] ? never : K
}[Routes]
