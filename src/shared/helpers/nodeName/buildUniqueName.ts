import { splitFileName } from './splitFileName'

/**
 * FR-UPL-10 "Keep both" / FR-REN-04 suggestion: appends the first free numeric
 * suffix before the extension — `"Report.pdf"` → `"Report (1).pdf"`.
 *
 * The server is the authority on uniqueness; this only produces the optimistic
 * name shown in the dialog.
 */
export function buildUniqueName(
  name: string,
  takenNames: readonly string[]
): string {
  const taken = new Set(takenNames.map((item) => item.toLowerCase()))

  if (!taken.has(name.toLowerCase())) return name

  const { base, extension } = splitFileName(name)
  // Strip an existing " (n)" so repeated passes do not stack suffixes.
  const stem = base.replace(/ \(\d+\)$/, '')

  let counter = 1
  let candidate = `${stem} (${counter})${extension}`

  while (taken.has(candidate.toLowerCase())) {
    counter += 1
    candidate = `${stem} (${counter})${extension}`
  }

  return candidate
}
