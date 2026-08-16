import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { ErrorState } from '@/components/moduls/ErrorState'

/**
 * FR-ERR-05: mounted at route level so one broken screen does not take the
 * whole app down. FR-LAZY-06: a chunk that fails to load lands here too, and
 * is offered a full page reload rather than a retry of the same request.
 */
export function RouteErrorBoundary() {
  const error = useRouteError()

  // A failed dynamic import surfaces as a plain Error, not a route response.
  const isChunkError =
    !isRouteErrorResponse(error) &&
    error instanceof Error &&
    /dynamically imported module|Importing a module script failed/i.test(
      error.message
    )

  return (
    <ErrorState
      title={
        isChunkError ? "Couldn't load part of the app" : 'Something went wrong'
      }
      description={
        isChunkError
          ? 'Reload the page to try again.'
          : 'This screen ran into an error.'
      }
      actionLabel="Reload page"
      onAction={() => window.location.reload()}
    />
  )
}
