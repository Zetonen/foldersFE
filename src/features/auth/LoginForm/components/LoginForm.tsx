import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/moduls/FormField'
import { PasswordInput } from '@/components/moduls/PasswordInput'
import { useLoginForm } from '../hooks/useLoginForm'

/** FR-AUTH-08/09: email and password, with one shared error above the form. */
export function LoginForm() {
  const { register, errors, formError, isLoading, rateLimit, onSubmit } =
    useLoginForm()

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <FormField name="email" label="Email" error={errors.email?.message}>
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

      <FormField
        name="password"
        label="Password"
        error={errors.password?.message}
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register('password')}
            autoComplete="current-password"
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
            : 'Sign in'}
        </span>
      </Button>
    </form>
  )
}
