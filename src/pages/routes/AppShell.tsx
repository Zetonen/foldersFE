import { RootLayout } from '@/components/layout/RootLayout'
import { UploadPanel } from '@/widgets/UploadPanel'
import { useUploadProcessor } from '@/shared/hooks/useUploadProcessor'

/**
 * The outermost route element. The upload queue is driven and displayed here
 * rather than inside `RootLayout`, because FR-UPL-14 requires it to outlive
 * navigation and because a layout component must not reach into `widgets`.
 */
export function AppShell() {
  useUploadProcessor()

  return (
    <>
      <RootLayout />
      <UploadPanel />
    </>
  )
}
