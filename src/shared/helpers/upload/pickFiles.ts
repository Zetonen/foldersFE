import { UPLOAD_LIMITS } from '@/shared/constants/UPLOAD'

/**
 * FR-UPL-01/02: opens the operating system file picker and hands back what was
 * chosen, restricted to the formats the queue accepts.
 *
 * The input is never mounted. It exists for the length of the dialog and is
 * then dropped, which is why this is a plain function rather than a hidden node
 * some component would have to render and keep a ref to.
 *
 * `accept` is a hint the OS dialog may let the user override, so it filters
 * rather than guarantees — `validateUploadFiles` is what actually enforces the
 * rule, on this path and on the drag-and-drop one alike.
 */
export function pickFiles(onPicked: (files: File[]) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = UPLOAD_LIMITS.acceptedMimeTypes.join(',')

  input.addEventListener('change', () => {
    onPicked(Array.from(input.files ?? []))
  })

  input.click()
}
