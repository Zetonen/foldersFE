import type { Breadcrumb, DataRoomRef, Folder } from '@/types'

/**
 * One step of the path shown above the listing.
 *
 * `id` is `null` for the data room, which is addressed as the root rather than
 * by a folder id — the same convention every navigation handler already uses.
 */
export interface Crumb {
  id: string | null
  name: string
  /**
   * `current` is the folder being looked at. It is rendered as a position
   * rather than a link, and it is the only crumb that is not navigable.
   */
  kind: 'room' | 'folder' | 'current'
}

/** The three fields every listing response carries, in `FolderContents` and `ShareView` alike. */
interface TrailSource {
  dataRoom: DataRoomRef | null
  breadcrumbs: Breadcrumb[]
  folder: Folder | null
}

/**
 * Assembles the full path from the three separate places it arrives in.
 *
 * `breadcrumbs` holds strictly the *ancestors* — the open folder is not in it,
 * and neither is the data room, whose name only ever comes from `dataRoom`.
 * At the room root there are no ancestors and no folder at all, so `dataRoom`
 * is the only source there. Nothing downstream should have to know that:
 *
 *   room root      →  Acme Acquisition
 *   Due Diligence  →  Acme Acquisition / Due Diligence
 *   Financials     →  Acme Acquisition / Due Diligence / Financials
 *
 * For someone browsing through a share, `dataRoom` is `null` and the ancestors
 * stop at the shared root — names above it are not theirs to see. The trail
 * then simply starts at a folder, so no caller may assume the first crumb is
 * the room.
 */
export function toBreadcrumbs(source: TrailSource | undefined): Crumb[] {
  if (!source) return []

  const crumbs: Crumb[] = []

  if (source.dataRoom) {
    crumbs.push({ id: null, name: source.dataRoom.name, kind: 'room' })
  }

  for (const ancestor of source.breadcrumbs) {
    crumbs.push({ id: ancestor.id, name: ancestor.name, kind: 'folder' })
  }

  if (source.folder) {
    crumbs.push({
      id: source.folder.id,
      name: source.folder.name,
      kind: 'current',
    })
  }

  return crumbs
}

/**
 * FR-MOV-05: the folder ids on the path, the open folder included.
 *
 * A drag that spring-opens into the folder being dragged puts the whole screen
 * inside its own subtree, and that is only detectable if the open folder
 * counts as part of its own path.
 */
export const trailFolderIds = (trail: Crumb[]): string[] =>
  trail.flatMap((crumb) => (crumb.id === null ? [] : [crumb.id]))
