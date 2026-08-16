/**
 * FR-REN-02: the rename dialog preselects the base name and leaves the
 * extension editable, so `"Q3 Report.pdf"` splits into `"Q3 Report"` + `".pdf"`.
 * A leading dot is treated as part of the base name, not an extension.
 */
export function splitFileName(name: string): {
  base: string
  extension: string
} {
  const dotIndex = name.lastIndexOf('.')

  if (dotIndex <= 0) return { base: name, extension: '' }

  return { base: name.slice(0, dotIndex), extension: name.slice(dotIndex) }
}
