import type { ShareResourceType } from '@/types'

/**
 * What the picker needs to draw a card. Owned rooms and things shared with you
 * arrive from different endpoints with different shapes, so the screen maps
 * both onto this before handing them to the list.
 */
export interface RoomListItem {
  id: string
  name: string
  /** `/shared-with-me` can grant a folder or a single file, not just a room. */
  type: ShareResourceType
  /** FR-EXP-12: "me" for your own rooms, otherwise the owner's name. */
  ownerLabel: string
  /** FR-ROOMS-06: the actions menu belongs to the owner alone. */
  canManage: boolean
}
