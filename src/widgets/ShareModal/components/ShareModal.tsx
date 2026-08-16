import { useGetSharesQuery } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { NodeIcon } from '@/components/moduls/NodeIcon'
import { UserText } from '@/components/moduls/UserText'
import {
  GeneralAccessControl,
  ShareAccessList,
  ShareInviteForm,
  splitShares,
} from '@/features/share/ShareAccess'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectAuthUser } from '@/store'
import type { ShareResourceType } from '@/types'

export interface ShareTarget {
  resourceType: ShareResourceType
  resourceId: string
  name: string
}

interface ShareModalProps {
  /** `null` keeps the dialog closed. */
  target: ShareTarget | null
  onOpenChange: (open: boolean) => void
}

/** FR-SHR-01..12: the three blocks of the sharing dialog. */
export function ShareModal({ target, onOpenChange }: ShareModalProps) {
  const owner = useAppSelector(selectAuthUser)

  const shares = useGetSharesQuery(
    {
      resourceType: target?.resourceType ?? 'FILE',
      resourceId: target?.resourceId ?? '',
    },
    { skip: !target }
  )

  const { people, link } = splitShares(shares.data)

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {/* FR-SHR-01: the heading names what is being shared. */}
          <DialogTitle className="flex min-w-0 items-center gap-2">
            <NodeIcon
              type={target?.resourceType === 'FILE' ? 'FILE' : 'FOLDER'}
              className="size-5 shrink-0"
            />
            <span className="truncate">
              Share “<UserText>{target?.name}</UserText>”
            </span>
          </DialogTitle>
        </DialogHeader>

        {target ? (
          <div className="flex flex-col gap-5">
            <ShareInviteForm
              resourceType={target.resourceType}
              resourceId={target.resourceId}
              ownEmail={owner?.email}
            />

            <Separator />

            <ShareAccessList
              shares={people}
              owner={owner}
              resourceId={target.resourceId}
              isLoading={shares.isLoading}
              isError={shares.isError}
              onRetry={shares.refetch}
            />

            <Separator />

            <GeneralAccessControl
              resourceType={target.resourceType}
              resourceId={target.resourceId}
              link={link}
              isLoading={shares.isLoading}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
