const UNITS = ['KB', 'MB', 'GB', 'TB'] as const

/** `2412544` → `"2.3 MB"`. Whole numbers drop the decimal. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  let value = bytes / 1024
  let unitIndex = 0

  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const digits = value >= 100 || Number.isInteger(value) ? 0 : 1
  return `${value.toFixed(digits)} ${UNITS[unitIndex]}`
}
