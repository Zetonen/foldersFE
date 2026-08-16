import { useRef, type ReactNode } from 'react'
import { Loader2Icon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Plain text, or a richer summary such as the folder delete breakdown. */
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** FR-DEL-05: deletions render the confirm button as destructive. */
  destructive?: boolean
  /** FR-DEL-04: blocks confirmation while the summary is still loading. */
  confirmDisabled?: boolean
  pending?: boolean
  onConfirm: () => void
}

/**
 * FR-DEL-05: cancel takes focus by default, so a stray Enter cannot destroy
 * anything. Shared by every confirmation flow in the app.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  confirmDisabled = false,
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        // FR-DEL-05: focus lands on Cancel, so a stray Enter cannot destroy
        // anything. Driven from the open event rather than `autoFocus`, which
        // would depend on the footer's DOM order.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          cancelRef.current?.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef} disabled={pending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? 'destructive' : 'default'}
            disabled={confirmDisabled || pending}
            onClick={(event) => {
              // The dialog stays open until the caller resolves the action.
              event.preventDefault()
              onConfirm()
            }}
          >
            {pending ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : null}
            {/*
              The label is wrapped rather than left as bare text: the spinner
              mounts in front of it, and an in-page translator would by then
              have replaced a bare text node with its own element — leaving
              React to insert before a node that is no longer here. An element
              of our own is the stable anchor, since translators rewrite text
              nodes but leave the elements around them in place.
            */}
            <span>{confirmLabel}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
