import { Skeleton } from '@/components/ui/skeleton'
import { LIST } from '@/shared/constants/LIST'

interface ListSkeletonProps {
  rows?: number
}

/**
 * FR-EXP-22: the content list loads into placeholder rows rather than a
 * full-screen spinner. Row height is the shared token, so the skeleton takes
 * exactly the space the real rows will.
 */
export function ListSkeleton({ rows = LIST.skeletonRows }: ListSkeletonProps) {
  return (
    <ul aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 border-b border-border px-4"
          style={{ height: LIST.rowHeight }}
        >
          <Skeleton className="size-5 shrink-0 rounded" />
          <Skeleton
            className="h-3.5"
            // Varying widths read as text rather than as a loading bar.
            style={{ width: `${30 + ((index * 13) % 45)}%` }}
          />
          <Skeleton className="ml-auto h-3.5 w-16 max-[900px]:hidden" />
        </li>
      ))}
    </ul>
  )
}
