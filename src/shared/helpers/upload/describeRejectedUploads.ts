import type { RejectedFile } from './validateUploadFiles'

/**
 * FR-UPL-07: the toast for files that never entered the queue.
 *
 * It leads with the rule that turned them away rather than with a count — a
 * user who drops a .docx needs to be told which formats are accepted, not that
 * "1 file was skipped". The names follow, so it is still clear which ones went.
 */
export function describeRejectedUploads(rejected: RejectedFile[]): string {
  const names = rejected.map((entry) => entry.name).join(', ')
  const reasons = [...new Set(rejected.map((entry) => entry.reason))]
  // Mixed reasons cannot all lead, so the names carry the message on their own.
  const reason = reasons.length === 1 ? reasons[0] : 'These files were skipped'

  return `${reason}. Skipped: ${names}`
}
