import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosRequestConfig } from 'axios'
import type { ZodType } from 'zod'
import { api } from './instance'
import { handleAppError } from '@/shared/helpers/errorHandlers/handleAppError'
import { ERROR_MESSAGES } from '@/shared/constants/ERROR_MESSAGES'
import type { AppError } from '@/types'

export interface AxiosBaseQueryArgs {
  url: string
  method?: AxiosRequestConfig['method']
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: AxiosRequestConfig['headers']
  /**
   * FR-STATE-05: every response is validated before it reaches the cache.
   * An invalid payload is reported as a server error.
   */
  schema?: ZodType
}

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AppError> =>
  async ({ url, method = 'GET', data, params, headers, schema }, apiCtx) => {
    try {
      const response = await api.request({
        url,
        method,
        data,
        params,
        headers,
        signal: apiCtx.signal,
      })

      if (!schema) return { data: response.data }

      const parsed = schema.safeParse(response.data)

      if (!parsed.success) {
        return { error: { message: ERROR_MESSAGES.invalidResponse } }
      }

      return { data: parsed.data }
    } catch (error) {
      return { error: handleAppError(error) }
    }
  }
