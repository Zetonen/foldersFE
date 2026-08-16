import type { Share } from '@/types'

/**
 * FR-SHR-04/07: the modal shows named recipients and the public link in two
 * separate blocks, but the API returns them in one list.
 */
export function splitShares(shares: Share[] | undefined) {
  return {
    people: shares?.filter((share) => share.kind === 'USER') ?? [],
    link: shares?.find((share) => share.kind === 'PUBLIC_LINK'),
  }
}
