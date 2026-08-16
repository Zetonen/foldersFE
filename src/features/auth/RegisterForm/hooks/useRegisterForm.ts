import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegisterMutation } from '@/api'
import { HTTP_STATUS } from '@/shared/constants/ERROR_MESSAGES'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { useAuthSuccess } from '@/shared/hooks/useAuthSuccess'
import { useRateLimit } from '@/shared/hooks/useRateLimit'
import { isAppError, registerSchema, type RegisterValues } from '@/types'

/** FR-AUTH-02..06: everything the sign-up form does, minus how it looks. */
export function useRegisterForm() {
  const [registerUser, { isLoading }] = useRegisterMutation()
  const onAuthSuccess = useAuthSuccess()
  const rateLimit = useRateLimit()

  /** FR-AUTH-05: a taken address is a field error, not a toast. */
  const [emailTaken, setEmailTaken] = useState(false)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', name: '', password: '', confirmPassword: '' },
  })

  // `confirmPassword` is a client-side check; the server never sees it.
  const onSubmit = form.handleSubmit(
    async ({ confirmPassword: _, ...payload }) => {
      setEmailTaken(false)

      try {
        onAuthSuccess(await registerUser(payload).unwrap())
      } catch (error) {
        if (isAppError(error) && error.status === HTTP_STATUS.conflict) {
          setEmailTaken(true)
          form.setFocus('email')
          return
        }
        showErrorToast(isAppError(error) ? error.message : undefined)
      }
    }
  )

  return {
    register: form.register,
    errors: form.formState.errors,
    emailTaken,
    isLoading,
    rateLimit,
    onSubmit,
  }
}
