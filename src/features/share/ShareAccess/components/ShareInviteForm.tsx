import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmailChipsInput } from '@/components/moduls/EmailChipsInput'
import type { ShareResourceType } from '@/types'
import { useShareInvite } from '../hooks/useShareInvite'

interface ShareInviteFormProps {
  resourceType: ShareResourceType
  resourceId: string
  ownEmail?: string
}

/**
 * FR-SHR-02/03: invite by email. The role select carries a single value today,
 * and is kept because FUT-11 adds "Editor" beside it.
 *
 * The optional message from the requirements is not offered: `CreateShareDto`
 * has nowhere to put it, and a field that silently discards what the user
 * wrote would be worse than no field.
 */
export function ShareInviteForm({
  resourceType,
  resourceId,
  ownEmail,
}: ShareInviteFormProps) {
  const { emails, setEmails, submit, isLoading, canSubmit } = useShareInvite({
    resourceType,
    resourceId,
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="share-emails">Add people</Label>
        <EmailChipsInput
          id="share-emails"
          value={emails}
          onChange={setEmails}
          ownEmail={ownEmail}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="share-role">Role</Label>
          <Select value="VIEWER" disabled>
            <SelectTrigger id="share-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="button" disabled={!canSubmit} onClick={submit}>
          {isLoading ? (
            <Loader2Icon className="animate-spin" aria-hidden="true" />
          ) : null}
          {/* Wrapped so the spinner has an element to mount in front of. */}
          <span>Share</span>
        </Button>
      </div>
    </div>
  )
}
