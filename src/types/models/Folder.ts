import { z } from 'zod'
import { dataRoomRefSchema } from './DataRoom'
import { roleSchema } from './Permission'

/** `FolderDto`. `path` is the materialised ancestor chain, e.g. `/3f4a…/9b0e…/`. */
export const folderSchema = z.object({
  id: z.uuid(),
  dataRoomId: z.uuid(),
  /** `null` places the folder at the data room root. */
  parentId: z.uuid().nullable(),
  name: z.string(),
  path: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  /** FR-PERM-02: what the caller may do with this folder. */
  myRole: roleSchema,
})

export type Folder = z.infer<typeof folderSchema>

/** `FolderItemDto.type` — the backend spells these in upper case. */
export const nodeTypeSchema = z.enum(['FOLDER', 'FILE'])

export type NodeType = z.infer<typeof nodeTypeSchema>

/**
 * `FolderItemDto` — one row of the content list. Folders and files arrive in
 * the same array; the size and mime fields are populated for files only.
 */
export const folderItemSchema = z.object({
  type: nodeTypeSchema,
  id: z.uuid(),
  name: z.string(),
  sizeBytes: z.number().int().nonnegative().nullable(),
  mimeType: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type FolderItem = z.infer<typeof folderItemSchema>

/**
 * The minimum an action needs to identify a node. A list row satisfies it, and
 * so does the folder currently open — which has no row of its own, and so no
 * timestamps to hand (FR-EXP-06).
 */
export interface NodeRef {
  id: string
  name: string
  type: NodeType
}

/**
 * `BreadcrumbDto`. FR-ROUTE-03: the chain is computed by the backend from the
 * materialised path — the client never assembles it from navigation history.
 */
export const breadcrumbSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export type Breadcrumb = z.infer<typeof breadcrumbSchema>

/**
 * `FolderContentsDto` — a single response carrying the room, the current
 * folder, its breadcrumbs and one page of children. FR-EXP-18: `nextCursor`
 * drives keyset pagination.
 */
export const folderContentsSchema = z.object({
  /**
   * `null` for a recipient browsing a folder someone shared with them — the
   * name of the room above the shared root is not theirs to see. Use
   * `folder.dataRoomId` when all that is needed is the id.
   */
  dataRoom: dataRoomRefSchema.nullable(),
  /** `null` when listing the data room root. */
  folder: folderSchema.nullable(),
  /** Root-first order, excluding the data room itself. */
  breadcrumbs: z.array(breadcrumbSchema),
  items: z.array(folderItemSchema),
  /**
   * FR-EXP-18: the opaque keyset cursor of the next page. `null` — and only
   * `null` — means the listing is exhausted; a short page does not.
   */
  nextCursor: z.string().nullable(),
  /**
   * FR-EXP-18: how many direct children this folder has in total, pagination
   * aside — the same number as `directItemCount` in the stats, never the
   * subtree. It is a property of the folder, so every page of one listing
   * repeats it and the first page can be taken as the answer.
   *
   * Optional while the deployment still runs the build that predates it: the
   * count is an aside on the screen, and a listing that refused to parse over
   * a missing aside would cost the user the folder itself.
   */
  totalItems: z.number().int().nonnegative().optional(),
  /**
   * FR-EXP-12: who owns everything in this listing. It is stated once per
   * response rather than per row, because a data room has a single owner and
   * every node inside it is theirs.
   */
  ownerId: z.uuid(),
  ownerName: z.string(),
  /** FR-PERM-02/03: drives which affordances the explorer renders. */
  myRole: roleSchema,
})

export type FolderContents = z.infer<typeof folderContentsSchema>

const count = z.number().int().nonnegative()

/**
 * `FolderStatsDto` as it arrives — two sets of totals for the same folder,
 * because the two screens that ask are asking different questions, plus the
 * deprecated aliases of the older contract.
 *
 * Every count is optional here and only here: the deployment currently serves
 * the old three-field body, and a listing that fails validation would take the
 * details panel and the delete warning down with it. The transform below is
 * what the rest of the app sees, so nothing outside this file has to know
 * which version answered.
 */
const folderStatsResponseSchema = z.object({
  /** Bytes across the whole subtree — the weight of the branch, not of a level. */
  totalSize: count,
  /** Folders lying directly in this folder. */
  directFolderCount: count.optional(),
  /** Files lying directly in this folder. */
  directFileCount: count.optional(),
  /** The two above added up — what "N items" means for a folder. */
  directItemCount: count.optional(),
  /** Files at any depth below. */
  subtreeFileCount: count.optional(),
  /** Folders at any depth below, excluding the folder itself. */
  subtreeFolderCount: count.optional(),
  /** @deprecated alias of `subtreeFileCount`; the backend will drop it. */
  fileCount: count.optional(),
  /** @deprecated alias of `subtreeFolderCount`; the backend will drop it. */
  folderCount: count.optional(),
})

/**
 * The totals as the screens read them (FR-EXP-20 / FR-DEL-03): the details
 * panel describes the folder the user is looking at, so it counts what is
 * directly inside it; the delete warning describes what a confirmation
 * destroys, and deleting a folder soft-deletes its whole branch, so it counts
 * the subtree.
 *
 * A backend that only knows the old fields cannot tell the two apart, and the
 * fallback then reports the subtree at both — the answer this endpoint used to
 * give everywhere. It is stale rather than wrong-shaped, and it goes away on
 * its own once the new stats are deployed.
 */
export const folderStatsSchema = folderStatsResponseSchema.transform(
  (stats) => {
    const subtreeFileCount = stats.subtreeFileCount ?? stats.fileCount ?? 0
    const subtreeFolderCount =
      stats.subtreeFolderCount ?? stats.folderCount ?? 0

    return {
      totalSize: stats.totalSize,
      directFolderCount: stats.directFolderCount ?? subtreeFolderCount,
      directFileCount: stats.directFileCount ?? subtreeFileCount,
      directItemCount:
        stats.directItemCount ?? subtreeFolderCount + subtreeFileCount,
      subtreeFileCount,
      subtreeFolderCount,
    }
  }
)

export type FolderStats = z.infer<typeof folderStatsSchema>
