import { Suspense, ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingFallback } from './LoadingFallback'

interface LazyBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

export function LazyBoundary({ children, fallback, onError }: LazyBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback || <LoadingFallback />} onError={onError}>
      <Suspense fallback={fallback || <LoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export default LazyBoundary
