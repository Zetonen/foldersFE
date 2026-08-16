import { DatabaseIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/helpers/cn'
import { ROOMS_TABS } from '@/shared/constants/LIST'
import type { RoomsTab } from '@/types'
import { TAB_LABELS } from '../constants/tabs'

interface RoomsHeaderProps {
  activeTab: RoomsTab
  onTabChange: (tab: RoomsTab) => void
  onCreate: () => void
}

/** FR-ROOMS-01/04: the two tabs, plus the create button on "My data rooms". */
export function RoomsHeader({
  activeTab,
  onTabChange,
  onCreate,
}: RoomsHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground"
        >
          <DatabaseIcon className="size-4.5" strokeWidth={2} />
        </span>
        <h1 className="text-lg font-semibold text-foreground">Data Room</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Data rooms" className="flex gap-1">
          {ROOMS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={tab === activeTab}
              onClick={() => onTabChange(tab)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                tab === activeTab
                  ? 'bg-selected text-brand'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* FR-ROOMS-04: creating is only meaningful among your own rooms. */}
        {activeTab === 'my' ? (
          <Button onClick={onCreate}>
            <PlusIcon strokeWidth={2} />
            New data room
          </Button>
        ) : null}
      </div>
    </header>
  )
}
