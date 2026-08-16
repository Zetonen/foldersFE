/**
 * Backend routes, relative to `VITE_API_BASE_URL`. Templates that need an id
 * are functions so no component ever concatenates a URL by hand.
 *
 * The API is served from the root: `/auth/login`, `/data-rooms`. There is no
 * `/api` prefix — that path holds the Swagger document (`/api/docs`) and
 * nothing else, so prefixing these would 404 every request.
 *
 * Every route below has been verified against the running backend.
 */
export const ENDPOINTS = {
  health: 'health',

  register: 'auth/register',
  login: 'auth/login',
  refresh: 'auth/refresh',
  logout: 'auth/logout',
  me: 'auth/me',

  dataRooms: 'data-rooms',
  dataRoom: (id: string) => `data-rooms/${id}`,
  /** Root listing is its own endpoint rather than `parentId=null`. */
  dataRoomRoot: (id: string) => `data-rooms/${id}/root`,

  folders: 'folders',
  folder: (id: string) => `folders/${id}`,
  folderChildren: (id: string) => `folders/${id}/children`,
  folderStats: (id: string) => `folders/${id}/stats`,
  folderMove: (id: string) => `folders/${id}/move`,

  // ── Google OAuth ────────────────────────────────────────────────────
  /** Returns the consent-screen URL, plus the `state` to hand back in step 3. */
  googleAuthUrl: 'auth/google',
  /** Exchanges the `code` from the callback for a session. */
  googleCallback: 'auth/google/callback',

  // ── files: a three-step upload through blob storage ─────────────────
  /** Step 1 — reserve a storage key and a signed URL. */
  fileUploadUrl: 'files/upload-url',
  /** Step 3 — turn the uploaded object into a file record. */
  fileConfirm: 'files/confirm',
  file: (id: string) => `files/${id}`,
  fileMove: (id: string) => `files/${id}/move`,
  fileDownloadUrl: (id: string) => `files/${id}/download-url`,

  // ── sharing ─────────────────────────────────────────────────────────
  shares: 'shares',
  share: (id: string) => `shares/${id}`,
  sharedWithMe: 'shared-with-me',
  /** Public link entry point — no authentication required. */
  shareView: (token: string) => `share/${token}`,
  shareViewFolder: (token: string, folderId: string) =>
    `share/${token}/folders/${folderId}`,
} as const

/** The security scheme declares sharing as a header, not a path segment. */
export const SHARE_TOKEN_HEADER = 'X-Share-Token'
