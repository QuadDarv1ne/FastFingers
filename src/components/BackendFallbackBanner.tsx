import { memo, useCallback } from 'react'
import { useBackendAvailability } from '../hooks/useBackendAvailability'
import { useAppTranslation } from '../i18n/config'

interface BackendFallbackBannerProps {
  onRetry?: () => void
  className?: string
}

export const BackendFallbackBanner = memo<BackendFallbackBannerProps>(function BackendFallbackBanner({
  onRetry,
  className = '',
}: BackendFallbackBannerProps) {
  const { t } = useAppTranslation()
  const { isAvailable, isChecking, canRetry, checkBackend, retryCount } = useBackendAvailability({
    autoCheck: false,
  })

  const handleRetry = useCallback(() => {
    checkBackend()
    onRetry?.()
  }, [checkBackend, onRetry])

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
          {isChecking ? t('backend.checking') : t('backend.limitedMode')}
        </h3>
        <p className="text-sm text-dark-400">
          {isChecking
            ? t('backend.checkingServer')
            : t('backend.unavailable')}
        </p>

        {!isChecking && canRetry && (
          <button
            onClick={handleRetry}
            className="mt-3 px-4 py-2 bg-warning-500/20 hover:bg-warning-500/30 text-warning-400 rounded-lg transition-colors text-sm font-medium"
          >
            {t('backend.checkAgain')}
            {retryCount > 0 && (
              <span className="ml-2 text-xs opacity-70">
                {t('backend.attempt', { count: retryCount + 1 })}
              </span>
            )}
          </button>
        )}

        {!isChecking && !canRetry && (
          <p className="mt-2 text-xs text-dark-500">
            {t('backend.maxAttempts')}
          </p>
        )}
      </div>
    </div>
  )
})
