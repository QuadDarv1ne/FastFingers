import { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

interface AppErrorBoundaryProps {
  children: ReactNode
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const handleError = (error: Error) => {
    // Отправляем ошибку в сервис мониторинга (если есть)
    console.error('Application error:', error)
    
    // Можно добавить отправку в Sentry, LogRocket и т.д.
    // if (import.meta.env.PROD) {
    //   sendToMonitoringService(error)
    // }
  }

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}
