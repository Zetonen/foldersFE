import { ROUTES } from '@/shared/constants/ROUTES'
import type {
  RouteParamsMap,
  RouteWithParams,
  RouteWithoutParams,
  Routes,
} from '@/types'

type GetRoute = {
  (route: RouteWithoutParams): string
  <K extends RouteWithParams>(route: K, params: RouteParamsMap<K>): string
}

/**
 * Builds an absolute path from a route template. The overloads make the params
 * argument required exactly for the routes that declare dynamic segments.
 */
export const getRoute: GetRoute = (
  route: Routes,
  params?: Record<string, string>
) => {
  const template: string = ROUTES[route]

  if (!params) return template

  return template.replace(/:([A-Za-z0-9_]+)/g, (match, key: string) => {
    const value = params[key]
    return value === undefined ? match : encodeURIComponent(value)
  })
}
