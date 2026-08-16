import { QUERY_PARAMS } from './QUERY_PARAMS'

/**
 * Absolute route templates. Dynamic segments are named after the entity they
 * carry so `getRoute` can type-check the params it is given.
 *
 * FR-ROUTE-02: a folder URL carries the id of the *current* folder only —
 * never the whole ancestor chain — so URL length is independent of depth.
 */
export const ROUTES = {
  home: '/',

  // auth
  login: '/login',
  register: '/register',
  authCallback: '/auth/callback',

  // data rooms
  rooms: '/rooms',
  room: '/rooms/:roomId',
  roomFolder: '/rooms/:roomId/f/:folderId',
  roomFile: '/rooms/:roomId/file/:fileId',

  /**
   * A file with no folder behind it. Someone who holds a share on a single
   * file has no access to the room it lives in, so the viewer cannot be
   * layered over an explorer that would have to list one — this route carries
   * the file alone, and no room id it would have no right to use.
   */
  sharedFile: '/files/:fileId',

  // public / permissioned share links
  share: '/share/:token',
  shareFolder: '/share/:token/f/:folderId',
  shareFile: '/share/:token/file/:fileId',

  // system
  forbidden: '/403',
  notFound: '/404',
  linkExpired: '/link-expired',
} as const

/**
 * Where someone who reached this app through a share belongs when a screen
 * turns out not to be theirs. `/rooms` on its own opens the "My data rooms"
 * tab, which for a guest is an empty list and a dead end.
 */
export const SHARED_WITH_ME_ROUTE = `${ROUTES.rooms}?${QUERY_PARAMS.tab}=shared`
