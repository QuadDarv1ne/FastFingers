import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import LoadingFallback from './LoadingFallback'

interface RequireAuthProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

/**
 * Компонент для защиты маршрутов, требующих авторизации
 * 
 * @example
 * <RequireAuth>
 *   <Dashboard />
 * </RequireAuth>
 * 
 * @example
 * <RequireAuth fallback={<CustomFallback />}>
 *   <Profile />
 * </RequireAuth>
 */
/**
 * Validate redirect URL against open redirect attacks.
 * Only allows relative paths or same-origin URLs.
 */
function isSafeRedirect(url: string): boolean {
  try {
    // Allow relative paths
    if (url.startsWith('/')) return true
    // Check if it's a same-origin URL
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin
  } catch {
    // Invalid URL — reject
    return false
  }
}

export function RequireAuth({ children, fallback, redirectTo }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      if (isSafeRedirect(redirectTo)) {
        window.location.href = redirectTo
      } else {
        // Fallback to login page if redirect is unsafe
        window.location.href = '/'
      }
    }
  }, [isLoading, isAuthenticated, redirectTo])

  // Показываем fallback во время загрузки
  if (isLoading) {
    return fallback || <LoadingFallback />
  }

  // Если не авторизован - показываем fallback или перенаправляем
  if (!isAuthenticated) {
    if (redirectTo) {
      return fallback || <LoadingFallback />
    }

    return fallback || (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Требуется авторизация</h2>
          <p className="text-dark-400 mb-6">Пожалуйста, войдите в систему для доступа к этой странице</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Компонент для защиты маршрутов от авторизованных пользователей
 * (например, страница входа/регистрации)
 * 
 * @example
 * <RequireGuest>
 *   <LoginPage />
 * </RequireGuest>
 */
export function RequireGuest({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return fallback || <LoadingFallback />
  }

  if (isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-white mb-2">Вы уже авторизованы</h2>
          <p className="text-dark-400">Перенаправление...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
