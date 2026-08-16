import { LayoutGridIcon, ListIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import type { ViewMode } from '@/types'

interface ModeOption {
  label: string
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>
}

/** FR-EXP-11: one entry per mode in `VIEW_MODES`, in the order they appear. */
export const VIEW_MODE_OPTIONS: Record<ViewMode, ModeOption> = {
  table: { label: 'List view', Icon: ListIcon },
  grid: { label: 'Grid view', Icon: LayoutGridIcon },
}
