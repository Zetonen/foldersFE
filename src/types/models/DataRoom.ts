import { z } from 'zod'

/**
 * `DataRoomDto` — the workspace a user picks on the start screen. Every user
 * gets one by default and may create more; folders and files always belong to
 * exactly one of them.
 *
 * FR-ROOMS-02: the card shows an icon and a name only, so no counters or
 * sizes are requested here.
 */
export const dataRoomSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  ownerId: z.uuid(),
  createdAt: z.iso.datetime(),
})

export type DataRoom = z.infer<typeof dataRoomSchema>

/** The trimmed reference embedded in `FolderContentsDto`. */
export const dataRoomRefSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export type DataRoomRef = z.infer<typeof dataRoomRefSchema>
