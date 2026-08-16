/**
 * FR-EXP-12: the column geometry of the listing, shared by the header strip
 * and by every row.
 *
 * The two are separate elements — the header sits outside the scroll container
 * — so nothing but this constant keeps a heading above the values it names.
 * They drifted apart once already, when the header left the actions column out
 * and pushed "Owner" a column's width to the right of the owners.
 */
export const NODE_COLUMNS = {
  /** Takes whatever the fixed columns leave; `min-w-0` lets it truncate. */
  name: 'min-w-0 flex-1',
  owner: 'w-40 shrink-0 max-[900px]:hidden',
  /** Holds the row's "More actions" button; blank in the header. */
  actions: 'w-10 shrink-0',
} as const
