import type { AppError } from '@/types/api/AppError'

export const isAppError = (value: unknown): value is AppError =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  typeof (value as { message: unknown }).message === 'string'
