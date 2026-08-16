import { MoreVerticalIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/moduls/UserAvatar'
import { UserText } from '@/components/moduls/UserText'

interface ShareAccessRowProps {
  email: string
  name?: string | null
  roleLabel: string
  /** FR-SHR-05: the owner's row carries no menu. */
  onRemove?: () => void
}

/** FR-SHR-04/05/06: one person with access. */
export function ShareAccessRow({
  email,
  name,
  roleLabel,
  onRemove,
}: ShareAccessRowProps) {
  return (
    <li className="flex items-center gap-3">
      <UserAvatar name={name} email={email} />

      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        {name ? (
          <UserText className="truncate text-sm text-foreground">
            {name}
          </UserText>
        ) : null}
        <UserText className="truncate text-xs text-muted-foreground">
          {email}
        </UserText>
      </div>

      {onRemove ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Change access for ${email}`}
            >
              {roleLabel}
              <MoreVerticalIcon strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{roleLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onRemove}>
              <Trash2Icon strokeWidth={1.75} />
              Remove access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="shrink-0 px-3 text-sm text-muted-foreground">
          {roleLabel}
        </span>
      )}
    </li>
  )
}
