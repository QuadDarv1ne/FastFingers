import { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

interface AppErrorBoundaryProps {
  children: ReactNode
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
