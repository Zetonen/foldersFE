import { DatabaseIcon } from 'lucide-react'
import { Outlet } from 'react-router-dom'

/** FR-AUTH-01: centred card carrying the product logo and name. */
export function AuthLayout() {
  return (
    <main className="flex min-h-full items-center justify-center bg-page px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground"
          >
            <DatabaseIcon className="size-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold text-foreground">
            Data Room
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
