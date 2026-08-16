import {
  ChevronRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Share2Icon,
  Trash2Icon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { UserText } from '@/components/moduls/UserText'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Crumb } from '@/api/helpers/toBreadcrumbs'
import { collapseCrumbs } from '../helpers/collapseCrumbs'
import { BreadcrumbCrumb } from './BreadcrumbCrumb'

interface ExplorerBreadcrumbsProps {
  /**
   * The whole path, room first and open folder last, already assembled by
   * `toBreadcrumbs`. Empty until the first page of the listing arrives.
   */
  trail: Crumb[]
  /**
   * FR-EXP-07: where the path starts — the list this data room was reached
   * from. It leaves the explorer rather than navigating inside it, so it is a
   * link and not a crumb, and it never collapses: it is the way out.
   *
   * Absent for a visitor on a share link, who has no such list.
   */
  root?: { label: string; to: string }
  isLoading: boolean
  onNavigate: (folderId: string | null) => void
  currentFolderId: string | null
  ancestorIds: string[]
  /** FR-EXP-06: actions on the folder currently open. Owner only. */
  onRenameCurrent?: () => void
  onShareCurrent?: () => void
  onDeleteCurrent?: () => void
}

export function ExplorerBreadcrumbs({
  trail,
  root,
  isLoading,
  onNavigate,
  currentFolderId,
  ancestorIds,
  onRenameCurrent,
  onShareCurrent,
  onDeleteCurrent,
}: ExplorerBreadcrumbsProps) {
  // FR-EXP-22: the trail is part of the skeleton, not a blank strip.
  if (isLoading || trail.length === 0) {
    return (
      <nav className="flex h-12 shrink-0 items-center px-3 sm:px-4">
        <Skeleton className="h-4 w-48" />
      </nav>
    )
  }

  const { visible, hidden } = collapseCrumbs(trail)

  // The last crumb is the open folder; the root has no actions of its own.
  const hasCurrentActions =
    currentFolderId !== null &&
    Boolean(onRenameCurrent || onShareCurrent || onDeleteCurrent)

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex h-12 shrink-0 items-center px-3 sm:px-4"
    >
      <ol className="flex min-w-0 items-center gap-0.5 text-sm">
        {root ? (
          <li className="flex shrink-0 items-center gap-0.5">
            <Link
              to={root.to}
              className="truncate rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {root.label}
            </Link>
            <Separator />
          </li>
        ) : null}

        {visible.map((item, index) => {
          const isLast = index === visible.length - 1

          if (item === 'ellipsis') {
            return (
              <li key="ellipsis" className="flex items-center gap-0.5">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Show full path"
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <MoreHorizontalIcon className="size-4" strokeWidth={1.75} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {hidden.map((crumb) => (
                      <DropdownMenuItem
                        key={crumb.id ?? 'root'}
                        onSelect={() => onNavigate(crumb.id)}
                      >
                        <UserText>{crumb.name}</UserText>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Separator />
              </li>
            )
          }

          return (
            <li
              key={item.id ?? 'root'}
              className="flex min-w-0 items-center gap-0.5"
            >
              {isLast ? (
                <div className="flex min-w-0 items-center">
                  <UserText
                    aria-current="page"
                    title={item.name}
                    className="max-w-[40vw] truncate rounded-md px-2 py-1 text-[15px] font-medium text-foreground sm:max-w-xs"
                  >
                    {item.name}
                  </UserText>

                  {/* FR-EXP-06: actions on the folder currently open. */}
                  {hasCurrentActions ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="Folder actions"
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <ChevronRightIcon
                          className="size-4 rotate-90"
                          strokeWidth={1.75}
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {onRenameCurrent ? (
                          <DropdownMenuItem onSelect={onRenameCurrent}>
                            <PencilIcon strokeWidth={1.75} />
                            Rename
                          </DropdownMenuItem>
                        ) : null}
                        {onShareCurrent ? (
                          <DropdownMenuItem onSelect={onShareCurrent}>
                            <Share2Icon strokeWidth={1.75} />
                            Share
                          </DropdownMenuItem>
                        ) : null}
                        {onDeleteCurrent ? <DropdownMenuSeparator /> : null}
                        {onDeleteCurrent ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={onDeleteCurrent}
                          >
                            <Trash2Icon strokeWidth={1.75} />
                            Delete
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              ) : (
                <>
                  <BreadcrumbCrumb
                    folderId={item.id}
                    name={item.name}
                    ancestorIds={ancestorIds}
                    onNavigate={onNavigate}
                  />
                  <Separator />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Separator() {
  return (
    <ChevronRightIcon
      aria-hidden="true"
      strokeWidth={1.75}
      className="size-4 shrink-0 text-muted-foreground/60"
    />
  )
}
