import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/shared/helpers/cn'

interface UserAvatarProps {
  name?: string | null
  email: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/** Falls back to the email when a Google account has not supplied a name. */
function getInitial(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email
  return source.charAt(0).toUpperCase()
}

export function UserAvatar({
  name,
  email,
  size = 'default',
  className,
}: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback
        className={cn('bg-selected font-semibold text-brand')}
        // The name is announced by the surrounding control, not by the glyph.
        aria-hidden="true"
      >
        {getInitial(name, email)}
      </AvatarFallback>
    </Avatar>
  )
}
