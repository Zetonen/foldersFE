import { GlobeIcon, LockIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/moduls/ConfirmDialog'
import { CopyLinkButton } from '@/components/moduls/CopyLinkButton'
import type { Share, ShareResourceType } from '@/types'
import {
  GENERAL_ACCESS,
  GENERAL_ACCESS_HINT,
  REVOKE_LINK_COPY,
} from '../constants/generalAccess'
import { useGeneralAccess } from '../hooks/useGeneralAccess'

interface GeneralAccessControlProps {
  resourceType: ShareResourceType
  resourceId: string
  /** The active public link, if one exists. */
  link: Share | undefined
  isLoading: boolean
}

/** FR-SHR-07..11: the public link, created and revoked from one select. */
export function GeneralAccessControl({
  resourceType,
  resourceId,
  link,
  isLoading,
}: GeneralAccessControlProps) {
  const {
    isPublic,
    linkUrl,
    busy,
    isRevoking,
    confirmRestrict,
    setConfirmRestrict,
    change,
    revoke,
  } = useGeneralAccess({ resourceType, resourceId, link })

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[13px] font-medium text-muted-foreground">
        General access
      </span>

      {isLoading ? (
        <Skeleton className="h-9 w-full" />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              {isPublic ? (
                <GlobeIcon className="size-4" strokeWidth={1.75} />
              ) : (
                <LockIcon className="size-4" strokeWidth={1.75} />
              )}
            </span>

            {/* FR-SHR-11: the change is applied at once, with no save button. */}
            <Select
              value={
                isPublic ? GENERAL_ACCESS.anyone : GENERAL_ACCESS.restricted
              }
              disabled={busy}
              onValueChange={(next) => void change(next)}
            >
              <SelectTrigger aria-label="General access" className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GENERAL_ACCESS.restricted}>
                  Restricted
                </SelectItem>
                <SelectItem value={GENERAL_ACCESS.anyone}>
                  Anyone with the link
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* FR-SHR-07: the caption explains what the chosen value means. */}
          <p className="text-xs text-muted-foreground">
            {isPublic
              ? GENERAL_ACCESS_HINT.anyone
              : GENERAL_ACCESS_HINT.restricted}
          </p>

          {linkUrl ? <CopyLinkButton url={linkUrl} /> : null}
        </>
      )}

      <ConfirmDialog
        open={confirmRestrict}
        onOpenChange={setConfirmRestrict}
        title={REVOKE_LINK_COPY.title}
        description={REVOKE_LINK_COPY.description}
        confirmLabel={REVOKE_LINK_COPY.confirm}
        destructive
        pending={isRevoking}
        onConfirm={() => void revoke()}
      />
    </div>
  )
}
