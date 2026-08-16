import axios from 'axios'
import { getErrorMessage } from './getErrorMessage'
import { parseFieldErrors } from './parseFieldErrors'
import { ERROR_MESSAGES } from '@/shared/constants/ERROR_MESSAGES'
import { apiErrorPayloadSchema, type AppError } from '@/types'

/**
 * Normalises anything thrown inside `src/api` into an `AppError`.
 * FR-STATE-06: nothing above `src/api` ever sees a raw axios or Zod error.
 */
export function handleAppError(error: unknown): AppError {
  if (axios.isCancel(error)) {
    return { message: ERROR_MESSAGES.abort }
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const parsed = apiErrorPayloadSchema.safeParse(error.response?.data)
    const payload = parsed.success ? parsed.data : undefined

    // A failed validation arrives as a list of complaints, one per field.
    const messages =
      typeof payload?.message === 'string'
        ? [payload.message]
        : (payload?.message ?? [])

    const serverMessage = messages.length > 0 ? messages.join('. ') : undefined

    return {
      message: getErrorMessage(status, serverMessage),
      status,
      serverMessage,
      fieldErrors: parseFieldErrors(messages),
    }
  }

  return { message: ERROR_MESSAGES.default }
}
