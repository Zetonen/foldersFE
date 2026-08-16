import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { NodeIcon } from '@/components/moduls/NodeIcon'
import { UserAvatar } from '@/components/moduls/UserAvatar'
import { UserText } from '@/components/moduls/UserText'
import { formatDate } from '@/shared/helpers/formatDate'
import type { FolderItem } from '@/types'
import { useNodeDetails } from '../hooks/useNodeDetails'

interface NodeDetailsProps {
  item: FolderItem
  ownerLabel: string
  /** FR-PUB-03: present when the panel is open behind a share link. */
  shareToken?: string
  /** FR-EXP-20: only an owner may ask who else has access. */
  canViewAccess: boolean
}

/**
 * FR-EXP-20: preview or icon, full name, type, size (files) or subtree totals
 * (folders), owner, dates and the list of active shares.
 */
export function NodeDetails({
  item,
  ownerLabel,
  shareToken,
  canViewAccess,
}: NodeDetailsProps) {
  const {
    isFolder,
    contentsLabel,
    statsLoading,
    sizeLabel,
    people,
    hasPublicLink,
    sharesLoading,
  } = useNodeDetails({ item, shareToken, canViewAccess })

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto p-4">
      <div className="flex flex-col items-center gap-3 pt-2">
        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-muted">
          <NodeIcon type={item.type} className="size-8" strokeWidth={1.5} />
        </span>
        {/* Edge case 15: the panel wraps the full name instead of truncating. */}
        <UserText
          as="p"
          className="w-full text-center text-[15px] font-medium wrap-break-word text-foreground"
          title={item.name}
        >
          {item.name}
        </UserText>
      </div>

      <dl className="flex flex-col gap-3.5 text-sm">
        <Detail label="Type">{isFolder ? 'Folder' : 'PDF'}</Detail>

        {isFolder ? (
          <Detail label="Contents">
            {/* Both branches are elements, so a translated text node is never
                what React has to swap out here. */}
            {statsLoading || !contentsLabel ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span>{contentsLabel}</span>
            )}
          </Detail>
        ) : (
          <Detail label="Size">{sizeLabel}</Detail>
        )}

        <Detail label="Owner">{ownerLabel}</Detail>
        <Detail label="Created">{formatDate(item.createdAt)}</Detail>
        <Detail label="Modified">{formatDate(item.updatedAt)}</Detail>
      </dl>

      {/* FR-EXP-20: who currently has access, if the caller may know. */}
      {canViewAccess ? (
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-medium text-muted-foreground">
            Who has access
          </span>

          {sharesLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : people.length === 0 && !hasPublicLink ? (
            <p className="text-sm text-muted-foreground">Only you</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {people.map((share) => (
                <li key={share.id} className="flex items-center gap-3">
                  <UserAvatar email={share.granteeEmail ?? ''} size="sm" />
                  <UserText className="min-w-0 truncate text-sm text-muted-foreground">
                    {share.granteeEmail}
                  </UserText>
                </li>
              ))}
              {hasPublicLink ? (
                <li className="text-sm text-muted-foreground">
                  Anyone with the link
                </li>
              ) : null}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-foreground">
        {children}
      </dd>
    </div>
  )
}
