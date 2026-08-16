// api
export type { AppError, ApiErrorPayload } from './api/AppError'
export { apiErrorPayloadSchema } from './api/AppError'
export type { RoomsTab, PageQuery } from './api/ListQuery'
export { roomsTabSchema } from './api/ListQuery'

// models
export type { User, AuthResponse } from './models/User'
export { userSchema, authResponseSchema } from './models/User'
export type { Role } from './models/Permission'
export { roleSchema, isOwnerRole } from './models/Permission'
export type { DataRoom, DataRoomRef } from './models/DataRoom'
export { dataRoomSchema, dataRoomRefSchema } from './models/DataRoom'
export type {
  Folder,
  NodeType,
  FolderItem,
  NodeRef,
  Breadcrumb,
  FolderContents,
  FolderStats,
} from './models/Folder'
export {
  folderSchema,
  nodeTypeSchema,
  folderItemSchema,
  breadcrumbSchema,
  folderContentsSchema,
  folderStatsSchema,
} from './models/Folder'
export type { DataFile, DownloadUrl, UploadUrl } from './models/File'
export { fileSchema, downloadUrlSchema, uploadUrlSchema } from './models/File'
export type {
  ShareResourceType,
  ShareKind,
  Share,
  SharedWithMeItem,
  ShareView,
} from './models/Share'
export {
  shareResourceTypeSchema,
  shareKindSchema,
  shareSchema,
  sharedWithMeItemSchema,
  shareViewSchema,
} from './models/Share'

export type {
  UploadStatus,
  ConflictResolution,
  UploadItem,
  NameConflict,
  UploadConflict,
} from './models/Upload'
export { uploadStatusSchema, conflictResolutionSchema } from './models/Upload'

// forms (validation schemas — the inferred type is the form's value type)
export type { LoginValues, RegisterValues } from './forms/Credentials'
export {
  emailSchema,
  newPasswordSchema,
  loginSchema,
  registerSchema,
} from './forms/Credentials'
export type { NodeNameValues, DataRoomNameValues } from './forms/NodeName'
export {
  nodeNameSchema,
  nodeNameFormSchema,
  dataRoomNameSchema,
  dataRoomNameFormSchema,
} from './forms/NodeName'
export type { ShareInviteValues } from './forms/ShareInvite'
export { shareInviteSchema } from './forms/ShareInvite'

// guards
export type { FolderListItem, FileListItem } from './guard/isNode'
export { isFolderItem, isFileItem } from './guard/isNode'
export { isAppError } from './guard/isAppError'

// store
export type { AppDispatch } from './store/AppDispatch'
export type { RootState } from './store/RootState'
export type { ViewMode } from './store/ViewMode'

// routes
export type { Routes } from './routes/Routes'
export type { RouteParams, RouteParamsMap } from './routes/RouteParams'
export type { RouteWithParams } from './routes/RouteWithParams'
export type { RouteWithoutParams } from './routes/RouteWithoutParams'

// elements
export type { NullableElement } from './elements/NullableElement'
