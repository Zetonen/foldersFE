import { Link } from 'react-router-dom'
import { LoginForm } from '@/features/auth/LoginForm'
import { GoogleAuthButton } from '@/features/auth/GoogleAuthButton'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/shared/constants/ROUTES'

/** FR-AUTH-08..10. */
export function LoginPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-center text-xl font-semibold text-foreground">
        Sign in to your account
      </h1>

      <GoogleAuthButton />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.register} className="text-brand underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
