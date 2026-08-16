import { ERROR_MESSAGES, HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'

/**
 * FR-ERR-01: maps a transport failure onto the one wording the app uses for
 * that class of error. FR-ERR-04: server text is only trusted for 400, where
 * it is a validation message describing what the request got wrong.
 */
export function getErrorMessage(
  status: number | undefined,
  serverMessage?: string
): string {
  if (status === undefined) return ERROR_MESSAGES.network

  switch (status) {
    case HTTP_STATUS.badRequest:
      return serverMessage ?? ERROR_MESSAGES.default
    case HTTP_STATUS.unauthorized:
      return ERROR_MESSAGES.unauthorized
    case HTTP_STATUS.forbidden:
      return ERROR_MESSAGES.forbidden
    case HTTP_STATUS.notFound:
      return ERROR_MESSAGES.notFound
    case HTTP_STATUS.conflict:
      return ERROR_MESSAGES.conflict
    case HTTP_STATUS.payloadTooLarge:
      return ERROR_MESSAGES.payloadTooLarge
    case HTTP_STATUS.unsupportedMediaType:
      return ERROR_MESSAGES.unsupportedType
    case HTTP_STATUS.tooManyRequests:
      return ERROR_MESSAGES.tooManyRequests
    default:
      return status >= 500 ? ERROR_MESSAGES.server : ERROR_MESSAGES.default
  }
}
