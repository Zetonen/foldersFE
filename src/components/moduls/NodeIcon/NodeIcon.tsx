import { FileTextIcon, FolderIcon } from 'lucide-react'
import { cn } from '@/shared/helpers/cn'
import type { NodeType } from '@/types'

interface NodeIconProps {
  type: NodeType
  className?: string
  strokeWidth?: number
}

/** A filled folder reads as a container at a glance; files stay outlined. */
export function NodeIcon({
  type,
  className,
  strokeWidth = 1.75,
}: NodeIconProps) {
  if (type === 'FOLDER') {
    return (
      <FolderIcon
        aria-hidden="true"
        strokeWidth={strokeWidth}
        className={cn('text-brand-muted', className)}
        fill="currentColor"
        fillOpacity={0.14}
      />
    )
  }

  return (
    <FileTextIcon
      aria-hidden="true"
      strokeWidth={strokeWidth}
      className={cn('text-muted-foreground', className)}
    />
  )
}
