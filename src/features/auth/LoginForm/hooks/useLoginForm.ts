import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLoginMutation } from '@/api'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { useAuthSuccess } from '@/shared/hooks/useAuthSuccess'
import { useRateLimit } from '@/shared/hooks/useRateLimit'
import { isAppError, loginSchema, type LoginValues } from '@/types'
import { LOGIN_ERRORS } from '../constants/messages'

/**
 * The 401 that means "this address signs in through Google", told apart from
 * the 401 that means "wrong password" — the two look identical to the status
 * code, and only one of them is safe to repeat to the user.
 */
const isGoogleAccountNotice = (
  serverMessage: string | undefined
): serverMessage is string => Boolean(serverMessage?.includes('Google'))

/** FR-AUTH-08/09: everything the sign-in form does, minus how it looks. */
export function useLoginForm() {
  const [login, { isLoading }] = useLoginMutation()
  const onAuthSuccess = useAuthSuccess()
  // FR-ERR-01 (429): held back for as long as the server asked.
  const rateLimit = useRateLimit()

  /**
   * FR-AUTH-09: a rejected sign-in never says which of the two fields was
   * wrong, so this sits above the form rather than under a field.
   */
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    // FR-AUTH-03: validation runs on submit, not while typing.
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    try {
      onAuthSuccess(await login(values).unwrap())
    } catch (error) {
      if (isAppError(error) && error.status === HTTP_STATUS.unauthorized) {
        /**
         * An account created through Google has no password to be wrong, so
         * that 401 is an instruction rather than a rejection, and the server's
         * own wording says more than ours does.
         *
         * Only that one message is passed through. FR-AUTH-09 requires a
         * rejected sign-in to stay silent about *which* field was wrong, and
         * showing whatever the server sent would break that the day it starts
         * distinguishing an unknown address from a bad password.
         */
        setFormError(
          isGoogleAccountNotice(error.serverMessage)
            ? error.serverMessage
            : LOGIN_ERRORS.invalidCredentials
        )
        return
      }
      showErrorToast(isAppError(error) ? error.message : undefined)
    }
  })

  return {
    register: form.register,
    errors: form.formState.errors,
    formError,
    isLoading,
    rateLimit,
    onSubmit,
  }
}
