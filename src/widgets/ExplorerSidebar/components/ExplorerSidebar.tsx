import { FilesIcon, FolderPlusIcon, PlusIcon, UploadIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/helpers/cn'
import { useRootDropTarget } from '../hooks/useRootDropTarget'

interface ExplorerSidebarProps {
  /** FR-EXP-01: "All files" is current while no nested folder is open. */
  atRoot: boolean
  /**
   * FR-PERM-03: omitted for someone browsing through a share, who has no data
   * room root to reach — the entry is then not rendered at all, rather than
   * offered and answering 404.
   */
  onGoToRoot?: () => void
  /** FR-MOV-02: "All files" accepts a drop, which moves a node to the root. */
  ancestorIds: string[]
  /**
   * FR-EXP-02 / FR-PERM-03: the "New" button appears only when there is
   * something behind it — a viewer never sees it, and neither does anyone
   * until the create and upload flows exist.
   */
  onCreateFolder?: () => void
  onUploadFiles?: () => void
}

export function ExplorerSidebar({
  atRoot,
  onGoToRoot,
  ancestorIds,
  onCreateFolder,
  onUploadFiles,
}: ExplorerSidebarProps) {
  const hasNewMenu = Boolean(onCreateFolder || onUploadFiles)
  const { setNodeRef, isOver } = useRootDropTarget({ ancestorIds })

  return (
    <div className="flex h-full w-60 flex-col gap-4 border-r border-sidebar-border bg-sidebar px-3 py-4">
      {hasNewMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-12 w-fit items-center gap-3 rounded-full border border-border bg-card pr-6 pl-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none">
            <PlusIcon className="size-5 text-brand" strokeWidth={2} />
            New
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-52">
            {onCreateFolder ? (
              <DropdownMenuItem onSelect={onCreateFolder}>
                <FolderPlusIcon strokeWidth={1.75} />
                New folder
              </DropdownMenuItem>
            ) : null}
            {onUploadFiles ? (
              <DropdownMenuItem onSelect={onUploadFiles}>
                <UploadIcon strokeWidth={1.75} />
                File upload
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {onGoToRoot ? (
        <nav aria-label="Primary" className="flex flex-col gap-1">
          <button
            ref={setNodeRef}
            type="button"
            onClick={onGoToRoot}
            aria-current={atRoot ? 'page' : undefined}
            className={cn(
              'inline-flex h-10 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none',
              atRoot
                ? 'bg-selected text-brand'
                : 'text-foreground hover:bg-accent',
              isOver && 'bg-selected text-brand ring-2 ring-brand'
            )}
          >
            <FilesIcon className="size-4.5" strokeWidth={1.75} />
            All files
          </button>
        </nav>
      ) : null}
    </div>
  )
}
