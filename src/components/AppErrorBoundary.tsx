import { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import * as Sentry from '@sentry/react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const handleError = (error: Error) => {
    // Отправляем ошибку в Sentry
    if (import.meta.env.PROD) {
      Sentry.captureException(error)
    }
  }

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}
