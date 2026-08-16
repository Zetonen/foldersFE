import { z } from 'zod'
import { ROOMS_TABS } from '@/shared/constants/LIST'

/** FR-ROOMS-01: the active tab, mirrored in the `tab` query param. */
export const roomsTabSchema = z.enum(ROOMS_TABS)

export type RoomsTab = z.infer<typeof roomsTabSchema>

/** Keyset pagination arguments shared by both listing endpoints. */
export interface PageQuery {
  cursor?: string
  /** 1-200, defaults to 50 server-side. */
  limit?: number
}
