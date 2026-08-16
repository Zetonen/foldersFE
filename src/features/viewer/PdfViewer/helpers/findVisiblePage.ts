/**
 * The number of the page currently filling the viewport.
 *
 * Every page — rendered or still a placeholder — occupies its real space in
 * the DOM, so measuring offsets is exact where multiplying by an assumed page
 * height would drift on documents whose pages differ in size.
 */
export function findVisiblePage(container: HTMLElement): number | null {
  const pages = container.querySelectorAll<HTMLElement>('[data-page]')
  if (pages.length === 0) return null

  // A page counts as current once its top has passed a third of the viewport.
  const threshold = container.scrollTop + container.clientHeight / 3
  let current: number | null = null

  for (const element of pages) {
    if (element.offsetTop > threshold) break

    const parsed = Number(element.dataset.page)
    if (Number.isFinite(parsed)) current = parsed
  }

  return current ?? 1
}
