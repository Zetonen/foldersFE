import { Loader2Icon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/moduls/FormField'
import { PasswordInput } from '@/components/moduls/PasswordInput'
import { ROUTES } from '@/shared/constants/ROUTES'
import { REGISTER_ERRORS } from '../constants/messages'
import { useRegisterForm } from '../hooks/useRegisterForm'

/** FR-AUTH-02..06: sign-up with per-field errors. */
export function RegisterForm() {
  const { register, errors, emailTaken, isLoading, rateLimit, onSubmit } =
    useRegisterForm()

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        name="email"
        label="Email"
        error={
          errors.email?.message ??
          (emailTaken ? (
            <>
              {REGISTER_ERRORS.emailTaken}{' '}
              <Link to={ROUTES.login} className="text-brand underline">
                Sign in
              </Link>
            </>
          ) : undefined)
        }
      >
        {(field) => (
          <Input
            {...field}
            {...register('email')}
            type="email"
            autoComplete="email"
            disabled={isLoading}
          />
        )}
      </FormField>

      <FormField name="name" label="Name" error={errors.name?.message}>
        {(field) => (
          <Input
            {...field}
            {...register('name')}
            autoComplete="name"
            disabled={isLoading}
          />
        )}
      </FormField>

      <FormField
        name="password"
        label="Password"
        error={errors.password?.message}
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register('password')}
            autoComplete="new-password"
            disabled={isLoading}
          />
        )}
      </FormField>

      <FormField
        name="confirmPassword"
        label="Confirm password"
        error={errors.confirmPassword?.message}
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register('confirmPassword')}
            autoComplete="new-password"
            disabled={isLoading}
          />
        )}
      </FormField>

      {/* FR-AUTH-04: a submit in flight blocks the fields and itself. */}
      <Button type="submit" size="lg" disabled={isLoading || rateLimit.blocked}>
        {isLoading ? (
          <Loader2Icon className="animate-spin" aria-hidden="true" />
        ) : null}
        {/* Wrapped so the spinner has an element to mount in front of. */}
        <span>
          {rateLimit.blocked
            ? `Try again in ${rateLimit.secondsLeft}s`
            : 'Create account'}
        </span>
      </Button>
    </form>
  )
}
