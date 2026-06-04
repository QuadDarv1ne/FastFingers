import { Suspense, ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingFallback } from './LoadingFallback'

interface LazyBoundaryProps {
  children: ReactNode
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
  onError?: (error: Error) => void
}

export function LazyBoundary({ children, loadingFallback, errorFallback, onError }: LazyBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback || loadingFallback || <LoadingFallback />} onError={onError}>
      <Suspense fallback={loadingFallback || <LoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export default LazyBoundary
