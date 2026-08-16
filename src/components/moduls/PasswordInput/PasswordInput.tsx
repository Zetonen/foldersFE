import { useState, type ComponentProps } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/helpers/cn'

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>

/** FR-AUTH-02: password field with a reveal toggle. */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('pr-9', className)}
      />
      <button
        type="button"
        // Toggling visibility is not a form control the user tabs through.
        tabIndex={-1}
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 inline-flex w-9 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {visible ? (
          <EyeOffIcon className="size-4" strokeWidth={1.75} />
        ) : (
          <EyeIcon className="size-4" strokeWidth={1.75} />
        )}
      </button>
    </div>
  )
}
