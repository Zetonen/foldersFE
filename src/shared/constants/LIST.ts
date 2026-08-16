/**
 * FR-ARCH-09: values needed by both CSS and JS are declared once as a design
 * token and re-exported here. `--row-height` lives in styles/colors.css.
 */
export const LIST = {
  /** Must stay in sync with the `--row-height` token. */
  rowHeight: 48,
  /** FR-EXP-17: virtualise only once the folder is genuinely large. */
  virtualizationThreshold: 200,
  /**
   * FR-EXP-18: cursor page size. The server caps `limit` at 100 and answers
   * 400 above it rather than trimming, so a folder is always read page by
   * page — there is no request that returns all of it.
   */
  pageSize: 50,
  /** FR-EXP-18: fetch the next page at 80% scroll. */
  loadMoreThreshold: 0.8,
  /** Rows rendered by the loading skeleton. */
  skeletonRows: 8,
} as const

/** FR-EXP-07: breadcrumbs collapse beyond this depth. */
export const BREADCRUMBS = {
  maxVisibleDepth: 4,
  /** The first crumb and the last two are always shown. */
  leadingVisible: 1,
  trailingVisible: 2,
} as const

/**
 * FR-EXP-11: how the contents of a folder are laid out. `table` is the
 * default; `grid` shows the same nodes as cards, with the same actions.
 */
export const VIEW_MODES = ['table', 'grid'] as const

/** FR-EXP-11: how many columns of cards fit, by breakpoint. */
export const GRID = {
  /** Cards are square-ish; the thumbnail area is the rest of the card. */
  minCardWidth: 200,
} as const

/** FR-ROOMS-01: tabs of the data room list. */
export const ROOMS_TABS = ['my', 'shared'] as const
