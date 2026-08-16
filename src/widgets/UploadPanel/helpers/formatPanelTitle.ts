interface UploadCounts {
  total: number
  done: number
  failed: number
}

/**
 * FR-UPL-15: the header counts what is still in flight while the batch runs,
 * and what finished once it is over.
 */
export function formatPanelTitle(
  counts: UploadCounts,
  hasActive: boolean
): string {
  if (hasActive) {
    const remaining = counts.total - counts.done - counts.failed
    return `Uploading ${remaining} of ${counts.total}`
  }

  return `${counts.done} ${counts.done === 1 ? 'upload' : 'uploads'} complete`
}
