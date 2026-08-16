import { Link } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/RegisterForm'
import { GoogleAuthButton } from '@/features/auth/GoogleAuthButton'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/shared/constants/ROUTES'

/** FR-AUTH-01..07. */
export function RegisterPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-center text-xl font-semibold text-foreground">
        Create your account
      </h1>

      <GoogleAuthButton />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="text-brand underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
