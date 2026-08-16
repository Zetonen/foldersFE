import { LogOutIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/moduls/UserAvatar'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectAuthUser } from '@/store'
import { useSignOut } from '../hooks/useSignOut'

/** FR-EXP-04: the current-user indicator, and the way back out of the app. */
export function AccountMenu() {
  const user = useAppSelector(selectAuthUser)
  const signOut = useSignOut()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <UserAvatar name={user.name} email={user.email} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOutIcon strokeWidth={1.75} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
