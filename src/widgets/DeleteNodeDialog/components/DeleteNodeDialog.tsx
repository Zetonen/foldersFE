import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/moduls/ConfirmDialog'
import type { NodeRef } from '@/types'
import { describeDeletion, describeSubtree } from '../helpers/describeDeletion'
import { useDeleteNode } from '../hooks/useDeleteNode'

interface DeleteNodeDialogProps {
  /** `null` keeps the dialog closed. */
  item: NodeRef | null
  onOpenChange: (open: boolean) => void
  dataRoomId: string
  parentId: string | null
  /** FR-DEL-07 / FR-VIEW-11: lets the caller leave a screen that just went away. */
  onDeleted?: (item: NodeRef) => void
}

/** FR-DEL-02..06. */
export function DeleteNodeDialog(props: DeleteNodeDialogProps) {
  const { item, onOpenChange } = props
  const { isFolder, stats, statsLoading, isDeleting, confirm } =
    useDeleteNode(props)

  return (
    <ConfirmDialog
      open={item !== null}
      onOpenChange={onOpenChange}
      title={isFolder ? 'Delete this folder?' : 'Delete this file?'}
      description={
        /*
         * Every branch here renders an element, never a bare string. A string
         * child becomes a text node, an in-page translator replaces that node
         * with one of its own, and React then swaps a node that is no longer
         * there — which is how a translated page used to crash on delete.
         */
        <>
          <p>{item ? <span>{describeDeletion(item)}</span> : null}</p>

          {isFolder ? (
            <p className="mt-2">
              {/* FR-DEL-04: a skeleton stands in while the totals are counted. */}
              {statsLoading || !stats ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <span>{describeSubtree(stats)}</span>
              )}
            </p>
          ) : null}
        </>
      }
      confirmLabel="Delete"
      destructive
      // FR-DEL-04: confirming is blocked until the user can see what they lose.
      confirmDisabled={isFolder && statsLoading}
      pending={isDeleting}
      onConfirm={confirm}
    />
  )
}
