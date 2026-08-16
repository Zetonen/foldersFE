import { z } from 'zod'

/** Characters that would be ambiguous in a path or on a filesystem. */
const ILLEGAL_CHARS = /[/\\:*?"<>|]/
const RESERVED_NAMES = new Set(['.', '..'])

/**
 * `CreateFolderDto` / `RenameFolderDto` allow 1–255 characters. FR-FLD-02 adds
 * the character rules, and FR-REN-03 reuses the same schema for renaming.
 *
 * Uniqueness inside the folder is decided by the server (409 → FR-ERR-01), so
 * it is deliberately not part of this schema.
 */
export const nodeNameSchema = z
  .string()
  .trim()
  .min(1, 'Enter a name')
  .max(255, 'Name is too long')
  .refine(
    (value) => !ILLEGAL_CHARS.test(value),
    'Name can\'t contain / \\ : * ? " < > |'
  )
  .refine((value) => !RESERVED_NAMES.has(value), 'Choose a different name')

export const nodeNameFormSchema = z.object({ name: nodeNameSchema })

export type NodeNameValues = z.infer<typeof nodeNameFormSchema>

/** `CreateDataRoomDto` / `RenameDataRoomDto`: 1–255 characters. */
export const dataRoomNameSchema = z
  .string()
  .trim()
  .min(1, 'Enter a name')
  .max(255, 'Name is too long')

export const dataRoomNameFormSchema = z.object({ name: dataRoomNameSchema })

export type DataRoomNameValues = z.infer<typeof dataRoomNameFormSchema>
