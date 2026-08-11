import type { Instrumentation } from 'next'

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const details =
    error instanceof Error
      ? {
          digest: 'digest' in error ? error.digest : undefined,
          message: error.message,
        }
      : { digest: undefined, message: String(error) }

  console.error('KR1688 request error', {
    ...details,
    method: request.method,
    path: request.path,
    renderSource: context.renderSource,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
