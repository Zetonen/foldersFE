import { useEffect } from 'react'

interface UseViewerKeyboardArgs {
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
}

/** FR-VIEW-01/10: Esc closes, arrows step between the folder's files. */
export function useViewerKeyboard({
  onClose,
  onPrevious,
  onNext,
}: UseViewerKeyboardArgs): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrevious?.()
      if (event.key === 'ArrowRight') onNext?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrevious, onNext])
}
