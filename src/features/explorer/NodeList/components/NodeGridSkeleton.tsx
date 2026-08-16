import { Skeleton } from '@/components/ui/skeleton'
import { GRID, LIST } from '@/shared/constants/LIST'

/** FR-EXP-22: card-shaped placeholders, so the grid does not appear from nothing. */
export function NodeGridSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-3 p-4"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${GRID.minCardWidth}px, 1fr))`,
      }}
    >
      {Array.from({ length: LIST.skeletonRows }).map((_, index) => (
        <Skeleton key={index} className="h-44 rounded-xl" />
      ))}
    </div>
  )
}
