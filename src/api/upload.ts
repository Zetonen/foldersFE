import axios from 'axios'
import { handleAppError } from '@/shared/helpers/errorHandlers/handleAppError'

export interface UploadToStorageArgs {
  /** Signed URL from `POST /files/upload-url`. */
  uploadUrl: string
  file: File
  /** FR-UPL-19: 0–100, emitted as bytes leave the browser. */
  onProgress?: (percent: number, bytesSent: number) => void
  signal?: AbortSignal
}

/**
 * Step two of the upload: the bytes go straight to blob storage, bypassing the
 * API. This is the only request whose progress the user can see (FR-UPL-19),
 * which is also why it cannot live in RTK Query.
 *
 * A bare axios call, not the app instance — the session token has no business
 * being sent to a third-party host, and the storage URL is already signed.
 *
 * No `Authorization` either: the credential is the `?token=` in the signed URL
 * itself, so a bearer header is ignored by the storage and only costs a header
 * on the preflight. `UploadUrl.token` is still returned by the API and stays
 * in the schema, but nothing sends it.
 *
 * FR-STATE-06: rejects with an `AppError`, never with a raw axios error — the
 * same contract RTK Query's endpoints present to their callers.
 */
export async function uploadToStorage({
  uploadUrl,
  file,
  onProgress,
  signal,
}: UploadToStorageArgs): Promise<void> {
  try {
    await axios.put(uploadUrl, file, {
      signal,
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: ({ loaded, total }) => {
        if (!onProgress) return
        const percent = total ? Math.round((loaded / total) * 100) : 0
        onProgress(percent, loaded)
      },
    })
  } catch (error) {
    throw handleAppError(error)
  }
}
