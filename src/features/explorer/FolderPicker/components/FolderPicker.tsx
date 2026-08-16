import { ChevronRightIcon, FilesIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { NodeIcon } from '@/components/moduls/NodeIcon'
import { cn } from '@/shared/helpers/cn'
import { useFolderPicker } from '../hooks/useFolderPicker'

interface FolderPickerProps {
  dataRoomId: string
  /** Where browsing starts — usually the folder the node lives in. */
  initialFolderId: string | null
  /** FR-MOV-05: the node being moved cannot be entered or targeted. */
  excludeId: string
  /** The folder currently being browsed, which is the destination. */
  value: string | null
  onChange: (folderId: string | null, folderName: string) => void
}

/**
 * FR-MOV-11: the keyboard- and pointer-friendly alternative to dragging —
 * drill into the tree, and wherever you stop is the destination.
 */
export function FolderPicker({ value, ...args }: FolderPickerProps) {
  const { folders, trail, roomName, isLoading, enter } = useFolderPicker(args)

  return (
    <div className="flex flex-col rounded-lg border border-border">
      {/* The trail doubles as the way back up. */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5 text-sm">
        <button
          type="button"
          onClick={() => enter(null, roomName)}
          className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {roomName || 'All files'}
        </button>
        {trail.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-0.5">
            <ChevronRightIcon
              className="size-4 text-muted-foreground/60"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => enter(crumb.id, crumb.name)}
              className="max-w-40 truncate rounded-md px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      <ul className="h-56 overflow-auto p-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="p-2">
              <Skeleton className="h-5 w-2/3" />
            </li>
          ))
        ) : folders.length === 0 ? (
          <li className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <FilesIcon className="size-4" strokeWidth={1.75} />
            No subfolders here
          </li>
        ) : (
          folders.map((folder) => (
            <li key={folder.id}>
              <button
                type="button"
                onClick={() => enter(folder.id, folder.name)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  value === folder.id && 'bg-selected'
                )}
              >
                <NodeIcon type="FOLDER" className="size-4 shrink-0" />
                <span className="truncate">{folder.name}</span>
                <ChevronRightIcon
                  className="ml-auto size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
