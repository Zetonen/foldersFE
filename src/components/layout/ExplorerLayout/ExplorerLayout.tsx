import type { ReactNode } from 'react'

interface ExplorerLayoutProps {
  header: ReactNode
  sidebar: ReactNode
  breadcrumbs: ReactNode
  /** FR-EXP-11: sits on the breadcrumb line, at the far end of it. */
  toolbar?: ReactNode
  children: ReactNode
  /** FR-EXP-19: rendered only while a node is selected. */
  details?: ReactNode
  /** FR-EXP-03: drawer state, meaningful below 1024px only. */
  sidebarOpen: boolean
  onCloseSidebar: () => void
}

/**
 * The explorer frame. Owning the regions here keeps the owner screen and the
 * read-only share screen visually identical (FR-PUB-03).
 */
export function ExplorerLayout({
  header,
  sidebar,
  breadcrumbs,
  toolbar,
  children,
  details,
  sidebarOpen,
  onCloseSidebar,
}: ExplorerLayoutProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-page">
      {header}

      <div className="flex min-h-0 flex-1">
        {/* FR-EXP-03: static from 1024px up. */}
        <div className="hidden lg:block">{sidebar}</div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={onCloseSidebar}
              className="absolute inset-0 bg-black/30"
            />
            <div className="absolute inset-y-0 left-0 shadow-xl">{sidebar}</div>
          </div>
        ) : null}

        <main className="flex min-w-0 flex-1 flex-col bg-card">
          {/* The trail takes the width it needs; the toolbar keeps the end. */}
          <div className="flex min-w-0 shrink-0 items-center gap-2 pr-3 sm:pr-4">
            <div className="min-w-0 flex-1">{breadcrumbs}</div>
            {toolbar}
          </div>
          {children}
        </main>

        {details ? (
          <div className="max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-40 max-md:shadow-xl">
            {details}
          </div>
        ) : null}
      </div>
    </div>
  )
}
