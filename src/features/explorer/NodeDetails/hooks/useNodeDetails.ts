import { useGetFolderStatsQuery, useGetSharesQuery } from '@/api'
import { formatBytes } from '@/shared/helpers/formatBytes'
import { formatItemCount } from '@/shared/helpers/formatItemCount'
import { isFileItem, type FolderItem } from '@/types'

interface UseNodeDetailsArgs {
  item: FolderItem
  /** FR-PUB-03: present when the panel is open behind a share link. */
  shareToken?: string
  /** FR-EXP-20: only an owner may ask who else has access. */
  canViewAccess: boolean
}

/** FR-EXP-20: everything the details panel needs, none of how it looks. */
export function useNodeDetails({
  item,
  shareToken,
  canViewAccess,
}: UseNodeDetailsArgs) {
  const isFolder = !isFileItem(item)

  // FR-EXP-20: folder totals come from the server, never walked client-side.
  const { data: stats, isLoading: statsLoading } = useGetFolderStatsQuery(
    { folderId: item.id, shareToken },
    { skip: !isFolder }
  )

  const { data: shares, isLoading: sharesLoading } = useGetSharesQuery(
    { resourceType: isFolder ? 'FOLDER' : 'FILE', resourceId: item.id },
    { skip: !canViewAccess }
  )

  /**
   * FR-EXP-20: the count describes this folder — what is directly in it — and
   * the size describes its branch. That is deliberate, and it is what the two
   * numbers are asked for: a folder holding one subfolder reads "1 item", and
   * the size still answers how much deleting it would free.
   */
  const contentsLabel = stats
    ? `${formatItemCount(stats.directItemCount)} · ${formatBytes(stats.totalSize)}`
    : null

  return {
    isFolder,
    contentsLabel,
    statsLoading,
    sizeLabel: formatBytes(item.sizeBytes ?? 0),
    people: shares?.filter((share) => share.kind === 'USER') ?? [],
    hasPublicLink: shares?.some((share) => share.kind === 'PUBLIC_LINK'),
    sharesLoading,
  }
}
