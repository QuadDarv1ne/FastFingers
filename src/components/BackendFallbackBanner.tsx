import { memo, useCallback } from 'react'
import { useBackendAvailability } from '../hooks/useBackendAvailability'

interface BackendFallbackBannerProps {
  onRetry?: () => void
  className?: string
}

/**
 * Баннер-уведомление о недоступности бэкенда
 * Показывается когда Supabase не настроен или недоступен
 */
export const BackendFallbackBanner = memo<BackendFallbackBannerProps>(function BackendFallbackBanner({
  onRetry,
  className = '',
}: BackendFallbackBannerProps) {
  const { isAvailable, isChecking, canRetry, checkBackend, retryCount } = useBackendAvailability({
    autoCheck: false,
  })

  const handleRetry = useCallback(() => {
    checkBackend()
    onRetry?.()
  }, [checkBackend, onRetry])

  // Если бэкенд доступен — не показываем баннер
  if (isAvailable) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`bg-warning-500/10 border border-warning-500/30 rounded-lg p-4 flex items-start gap-3 ${className}`}
    >
      <div className="flex-shrink-0">
        <svg
          className="w-5 h-5 text-warning-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-warning-400 mb-1">
          {isChecking ? 'Проверка соединения...' : 'Режим ограниченной функциональности'}
        </h3>
        <p className="text-sm text-dark-400">
          {isChecking
            ? 'Проверяем доступность сервера...'
            : 'Сервер временно недоступен. Некоторые функции (синхронизация, лидерборды, достижения) работают в ограниченном режиме. Ваши данные сохраняются локально.'}
        </p>

        {!isChecking && canRetry && (
          <button
            onClick={handleRetry}
            className="mt-3 px-4 py-2 bg-warning-500/20 hover:bg-warning-500/30 text-warning-400 rounded-lg transition-colors text-sm font-medium"
          >
            Проверить снова
            {retryCount > 0 && (
              <span className="ml-2 text-xs opacity-70">
                (Попытка {retryCount + 1})
              </span>
            )}
          </button>
        )}

        {!isChecking && !canRetry && (
          <p className="mt-2 text-xs text-dark-500">
            Превышено максимальное количество попыток подключения. Перезагрузите страницу для повторной попытки.
          </p>
        )}
      </div>
    </div>
  )
})

export default BackendFallbackBanner
