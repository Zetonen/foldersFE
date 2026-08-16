import { BREADCRUMBS } from '@/shared/constants/LIST'
import type { Crumb } from '@/api/helpers/toBreadcrumbs'

export interface CollapsedTrail {
  /** What is rendered, with `'ellipsis'` standing in for the hidden middle. */
  visible: (Crumb | 'ellipsis')[]
  /** The crumbs behind the "…" button. */
  hidden: Crumb[]
}

/**
 * FR-EXP-07: past four levels the middle of the trail folds into a menu, so
 * the first crumb and the last two always stay in view.
 *
 * The trail arrives already assembled by `toBreadcrumbs` — this only decides
 * what fits, and never assumes the first crumb is the data room, since a
 * visitor who came through a share has no room to show.
 */
export function collapseCrumbs(trail: Crumb[]): CollapsedTrail {
  if (trail.length <= BREADCRUMBS.maxVisibleDepth) {
    return { visible: trail, hidden: [] }
  }

  return {
    visible: [
      ...trail.slice(0, BREADCRUMBS.leadingVisible),
      'ellipsis',
      ...trail.slice(-BREADCRUMBS.trailingVisible),
    ],
    hidden: trail.slice(
      BREADCRUMBS.leadingVisible,
      -BREADCRUMBS.trailingVisible
    ),
  }
}
