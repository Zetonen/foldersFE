import { DatabaseIcon, MenuIcon, Share2Icon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserText } from '@/components/moduls/UserText'
import { ROUTES } from '@/shared/constants/ROUTES'
import { AccountMenu } from './AccountMenu'

interface ExplorerHeaderProps {
  /** Undefined until the first page of the listing arrives. */
  roomName: string | undefined
  onToggleSidebar: () => void
  /** FR-PUB-02: the read-only badge shown when viewing through a share. */
  badge?: string
  /** FR-EXP-04: shares the node currently open. Owner only. */
  onShare?: () => void
}

/**
 * FR-EXP-04: logo linking back to the room picker, the current data room name,
 * the Share button and the account indicator.
 */
export function ExplorerHeader({
  roomName,
  onToggleSidebar,
  badge,
  onShare,
}: ExplorerHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        onClick={onToggleSidebar}
        className="lg:hidden"
      >
        <MenuIcon strokeWidth={1.75} />
      </Button>

      <Link
        to={ROUTES.rooms}
        className="flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground"
        >
          <DatabaseIcon className="size-4.5" strokeWidth={2} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Data Room
          </span>
          {roomName ? (
            <UserText className="max-w-[40vw] truncate text-[15px] font-medium text-foreground sm:max-w-xs">
              {roomName}
            </UserText>
          ) : (
            <Skeleton className="h-4 w-32" />
          )}
        </span>
      </Link>

      {badge ? (
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {badge}
        </span>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        {onShare ? (
          <Button onClick={onShare}>
            <Share2Icon strokeWidth={2} />
            <span className="max-sm:sr-only">Share</span>
          </Button>
        ) : null}
        <AccountMenu />
      </div>
    </header>
  )
}
