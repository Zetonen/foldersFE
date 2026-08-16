import type { ConflictResolution } from '@/types'

/** FR-UPL-10: keeping both is the default, least destructive choice. */
export const ALL_CONFLICT_RESOLUTIONS: ConflictResolution[] = [
  'keepBoth',
  'replace',
  'skip',
]

export const CONFLICT_COPY = {
  title: 'An item with this name already exists',
  applyToAll: 'Apply to all remaining conflicts',
} as const
