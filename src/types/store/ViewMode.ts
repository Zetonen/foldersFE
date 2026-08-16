import type { VIEW_MODES } from '@/shared/constants/LIST'

/** FR-EXP-11: how the contents of a folder are laid out. */
export type ViewMode = (typeof VIEW_MODES)[number]
