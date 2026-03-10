import { ReactNode, memo } from 'react'
import { useBackendAvailability } from '../hooks/useBackendAvailability'
import { BackendFallbackBanner } from '../components/BackendFallbackBanner'

interface WithBackendFallbackProps {
  children: ReactNode
  fallback?: ReactNode
  showBanner?: boolean
  className?: string
}

/**
 * Обёртка для компонентов с fallback UI при недоступности бэкенда
 * 
 * @param fallback - UI для показа когда бэкенд недоступен (показывает children если не указан)
 * @param showBanner - Показывать баннер-уведомление вместо скрытия контента
 */
export const WithBackendFallback = memo<WithBackendFallbackProps>(function WithBackendFallback({
  children,
  fallback,
  showBanner = false,
  className = '',
}: WithBackendFallbackProps) {
  const { isAvailable, isChecking } = useBackendAvailability()

  // Пока проверяем — показываем children или skeleton
  if (isChecking) {
    return <>{children}</>
  }

  // Если бэкенд доступен — показываем контент
  if (isAvailable) {
    return <>{children}</>
  }

  // Бэкенд недоступен
  if (showBanner) {
    return (
      <div className={className}>
        <BackendFallbackBanner />
        {children}
      </div>
    )
  }

  // Показываем fallback или children
  if (fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
})

export default WithBackendFallback
