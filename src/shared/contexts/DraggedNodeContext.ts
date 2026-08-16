import { createContext } from 'react'
import type { DraggableData } from '@/shared/constants/DND'

/**
 * What the current drag is carrying, or `null` when nothing is being dragged.
 *
 * dnd-kit's own `active.data` cannot answer this. It reads the payload off the
 * mounted draggable, and drops back to an empty object the moment that node
 * unmounts — which is exactly what a spring-open does (FR-MOV-06): it replaces
 * every row on screen, the one being dragged among them. Holding the payload
 * in React state instead makes it outlive the row it came from.
 *
 * It lives in `shared` because the drop targets that read it are spread across
 * features (list rows) and widgets (breadcrumbs, sidebar).
 */
export const DraggedNodeContext = createContext<DraggableData | null>(null)
