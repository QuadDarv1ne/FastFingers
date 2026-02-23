import { useOnlineStatus } from '@hooks/useOnlineStatus'
import './OnlineStatus.css'

/**
 * Компонент отображения статуса сетевого подключения
 * Показывает уведомление когда приложение офлайн
 */
export function OnlineStatus() {
  const { isOnline, lastOffline } = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="online-status" role="alert" aria-live="polite">
      <div className="online-status__content">
        <svg className="online-status__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-3.244m13.584 0a9 9 0 01-2.167 3.244m-9.925-4.243A4.978 4.978 0 015.636 12m0 0a4.978 4.978 0 011.414-2.828m0 0a9 9 0 012.167-3.244m9.925 0a9 9 0 012.167 3.244m0 0a4.978 4.978 0 01-1.414 2.828" />
        </svg>
        <div className="online-status__text">
          <strong>Нет подключения к интернету</strong>
          <p>
            Вы можете продолжить тренировку в офлайн режиме.
            {lastOffline && (
              <span className="online-status__time">
                {' '}Офлайн с {lastOffline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
