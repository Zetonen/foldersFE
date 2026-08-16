import { FolderSearchIcon, UploadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/moduls/EmptyState'

interface NodeListEmptyProps {
  /** FR-EXP-24: a viewer gets the message alone, with no call to action. */
  onUpload?: () => void
}

/** FR-EXP-23/24. */
export function NodeListEmpty({ onUpload }: NodeListEmptyProps) {
  return (
    <EmptyState
      icon={FolderSearchIcon}
      title="This folder is empty"
      description={
        onUpload ? 'Drag files here or upload them to get started.' : undefined
      }
      action={
        onUpload ? (
          <Button onClick={onUpload}>
            <UploadIcon strokeWidth={2} />
            Upload files
          </Button>
        ) : undefined
      }
    />
  )
}
