import { splitFileName } from '@/shared/helpers/nodeName/splitFileName'
import type { NodeType } from '@/types'

/**
 * FR-REN-02: a file opens with only its base name selected, so the extension
 * survives a straight retype while staying editable. A folder name has no
 * extension, so all of it is selected.
 */
export function getNameSelection(name: string, type: NodeType): number {
  if (type === 'FOLDER') return name.length
  return splitFileName(name).base.length
}
