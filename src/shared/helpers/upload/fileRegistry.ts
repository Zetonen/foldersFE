/**
 * `File` objects cannot live in Redux — they are not serialisable. The queue
 * in the store holds only their metadata, and the blobs are parked here under
 * the same ids until the transfer finishes.
 */
const registry = new Map<string, File>()

export const registerFile = (uploadId: string, file: File): void => {
  registry.set(uploadId, file)
}

/**
 * The blob stays put: a failed upload keeps its file so FR-UPL-21 can retry it
 * without asking the user to pick it again.
 */
export const getFile = (uploadId: string): File | undefined =>
  registry.get(uploadId)

export const forgetFile = (uploadId: string): void => {
  registry.delete(uploadId)
}

/**
 * Drops every blob whose upload has left the queue — skipped (FR-UPL-10),
 * cancelled (FR-UPL-12) or cleared with the panel (FR-UPL-16).
 *
 * Reconciling against the queue rather than forgetting at each of those call
 * sites means a new way of removing an item cannot reintroduce the leak.
 */
export const retainOnly = (uploadIds: Iterable<string>): void => {
  const live = new Set(uploadIds)

  for (const id of registry.keys()) {
    if (!live.has(id)) registry.delete(id)
  }
}
