import { CheckIcon, LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard'
import { showErrorToast } from '@/shared/helpers/toasts/showErrorToast'
import { showSuccessToast } from '@/shared/helpers/toasts/showSuccessToast'

interface CopyLinkButtonProps {
  url: string
  label?: string
}

/** FR-SHR-10: the icon becomes a tick for two seconds, plus a toast. */
export function CopyLinkButton({
  url,
  label = 'Copy link',
}: CopyLinkButtonProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        const done = await copy(url)
        if (done) showSuccessToast('Link copied')
        // Clipboard access can be refused; saying so beats a silent no-op.
        else showErrorToast("Couldn't copy the link")
      }}
    >
      {copied ? (
        <CheckIcon className="text-success" strokeWidth={2} />
      ) : (
        <LinkIcon strokeWidth={1.75} />
      )}
      {label}
    </Button>
  )
}
