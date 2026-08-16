import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/moduls/ErrorState'
import type { Share, User } from '@/types'
import { useRevokeAccess } from '../hooks/useRevokeAccess'
import { ShareAccessRow } from './ShareAccessRow'

interface ShareAccessListProps {
  /** `USER` shares only — the public link lives in its own block. */
  shares: Share[]
  owner: User | null
  resourceId: string
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

/** FR-SHR-04/12: who currently has access, with its own loading and error states. */
export function ShareAccessList({
  shares,
  owner,
  resourceId,
  isLoading,
  isError,
  onRetry,
}: ShareAccessListProps) {
  const revokeAccess = useRevokeAccess(resourceId)

  if (isError) {
    return (
      <ErrorState
        title="Access couldn't be loaded"
        actionLabel="Try again"
        onAction={onRetry}
        className="py-6"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[13px] font-medium text-muted-foreground">
        People with access
      </span>

      {isLoading ? (
        <ul className="flex flex-col gap-2.5" aria-hidden="true">
          {Array.from({ length: 2 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {/* FR-SHR-05: the owner is listed first and cannot be removed. */}
          {owner ? (
            <ShareAccessRow
              email={owner.email}
              name={owner.name}
              roleLabel="Owner"
            />
          ) : null}

          {shares.map((share) => (
            <ShareAccessRow
              key={share.id}
              email={share.granteeEmail ?? ''}
              roleLabel="Viewer"
              onRemove={() => void revokeAccess(share.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
