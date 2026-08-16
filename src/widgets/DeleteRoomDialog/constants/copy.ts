/**
 * FR-ROOMS-07: the warning spells out both consequences — the contents go,
 * and everyone it was shared with loses access.
 */
export const DELETE_ROOM_COPY = {
  title: 'Delete this data room?',
  description:
    'Everything inside will be permanently deleted, and everyone it was shared with will lose access. This cannot be undone.',
  confirm: 'Delete',
} as const
