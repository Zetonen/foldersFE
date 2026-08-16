import { useEffect } from 'react'

/**
 * Holds the closed-hand cursor while a drag is in progress.
 *
 * `cursor` is an inherited property, so one declaration on `<body>` reaches
 * the breadcrumbs, the sidebar and the empty space around the list — every
 * surface the pointer crosses on its way to a destination. What it does not
 * reach are the elements that set a cursor of their own, which is the point:
 * a row that refuses the drop still shows that it refuses it.
 */
export function useGrabbingCursor(dragging: boolean): void {
  useEffect(() => {
    if (!dragging) return

    const { body } = document
    const previous = body.style.cursor
    body.style.cursor = 'grabbing'

    return () => {
      body.style.cursor = previous
    }
  }, [dragging])
}
