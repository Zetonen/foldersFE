import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UPLOAD_PANEL_AUTO_COLLAPSE_MS } from '@/shared/constants/UPLOAD'
import { getRoute } from '@/shared/helpers/getRoute'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload'
import {
  panelClosed,
  panelCollapsedChanged,
  selectHasActiveUploads,
  selectIsUploadPanelVisible,
  selectOverallUploadProgress,
  selectUploadCounts,
  selectUploadItems,
  selectUploadPanelCollapsed,
  uploadRetried,
} from '@/store'
import type { UploadItem } from '@/types'
import { formatPanelTitle } from '../helpers/formatPanelTitle'

/** FR-UPL-14..23: the queue panel's state and the actions on its header. */
export function useUploadPanel() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const items = useAppSelector(selectUploadItems)
  const visible = useAppSelector(selectIsUploadPanelVisible)
  const collapsed = useAppSelector(selectUploadPanelCollapsed)
  const hasActive = useAppSelector(selectHasActiveUploads)
  const counts = useAppSelector(selectUploadCounts)
  const overallProgress = useAppSelector(selectOverallUploadProgress)

  // FR-UPL-22: the browser asks before a transfer is thrown away.
  useBeforeUnload(hasActive)

  // FR-UPL-23: the panel folds itself away once the batch is done.
  useEffect(() => {
    if (!visible || hasActive || collapsed) return

    const timer = setTimeout(
      () => dispatch(panelCollapsedChanged(true)),
      UPLOAD_PANEL_AUTO_COLLAPSE_MS
    )
    return () => clearTimeout(timer)
  }, [visible, hasActive, collapsed, dispatch])

  return {
    items,
    visible,
    collapsed,
    hasActive,
    overallProgress,
    title: formatPanelTitle(counts, hasActive),
    toggleCollapsed: () => dispatch(panelCollapsedChanged(!collapsed)),
    close: () => dispatch(panelClosed()),
    retry: (item: UploadItem) => dispatch(uploadRetried(item.id)),
    open: (item: UploadItem) => {
      if (!item.fileId) return
      navigate(
        getRoute('roomFile', {
          roomId: item.dataRoomId,
          fileId: item.fileId,
        })
      )
    },
  }
}
