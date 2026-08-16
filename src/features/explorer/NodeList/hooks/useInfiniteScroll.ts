import { useCallback, useRef, type UIEvent } from 'react'
import { LIST } from '@/shared/constants/LIST'

interface UseInfiniteScrollArgs {
  hasNextPage: boolean
  isFetching: boolean
  onLoadMore: () => void
}

/**
 * FR-EXP-18: the next page is requested once the user has scrolled through
 * 80% of what is already loaded, so the list never visibly runs out.
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetching,
  onLoadMore,
}: UseInfiniteScrollArgs) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetching) return

      const { scrollTop, clientHeight, scrollHeight } = event.currentTarget
      // A container shorter than its content cannot scroll; guard the divide.
      if (scrollHeight === 0) return

      const progress = (scrollTop + clientHeight) / scrollHeight
      if (progress >= LIST.loadMoreThreshold) onLoadMore()
    },
    [hasNextPage, isFetching, onLoadMore]
  )

  return { scrollRef, handleScroll }
}
