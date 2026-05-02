import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'
import { formatNotificationTimestamp } from '@utils/notifications'
import { useAppTranslation } from '../i18n/config'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { useClickOutside } from '@hooks/useClickOutside'

export interface Notification {
  id: string
  type: 'achievement' | 'milestone' | 'streak' | 'challenge' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  icon: string
}

interface NotificationBellProps {
}

export function NotificationBell({}: NotificationBellProps) {
  const { t } = useAppTranslation()
  const [notifications, setNotifications] = useLocalStorageState<Notification[]>(
    'fastfingers_notifications',
    []
  )
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useFocusTrap(dropdownRef, isOpen)

  // Обработчик закрытия
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  useClickOutside(dropdownRef, handleClose)

  // Блокировка скролла + Escape handler
  useEffect(() => {
    if (!isOpen) return

    document.body.classList.add('scroll-locked')
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.classList.remove('scroll-locked')
    }
  }, [isOpen])

  // Синхронизация с NotificationContext
  useEffect(() => {
    const handleNotificationAdded = () => {
      const stored = localStorage.getItem('fastfingers_notifications')
      if (stored) {
        try {
          setNotifications(JSON.parse(stored))
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener('notification-added', handleNotificationAdded)
    return () => window.removeEventListener('notification-added', handleNotificationAdded)
  }, [setNotifications])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const markAsRead = useCallback((id: string) => {
    setNotifications(_prev => _prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }, [setNotifications])

  const markAllAsRead = useCallback(() => {
    setNotifications(_prev => _prev.map(n => ({ ...n, read: true })))
  }, [setNotifications])

  const clearAll = useCallback(() => {
    if (confirm(t('action.delete') + '?')) {
      setNotifications(_prev => [])
    }
  }, [t, setNotifications])

  const getNotificationColor = useCallback((type: Notification['type']) => {
    const colors = {
      achievement: 'text-yellow-400',
      milestone: 'text-blue-400',
      streak: 'text-orange-400',
      challenge: 'text-purple-400',
      info: 'text-green-400',
    }
    return colors[type]
  }, [])

  const sortedNotifications = useMemo(() => 
    [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    [notifications]
  )

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label="Уведомления"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse shadow-lg shadow-red-500/50 px-1.5" aria-label={`${unreadCount} непрочитанных`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 max-h-[600px] glass rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          role="dialog"
          aria-label="Уведомления"
          style={{ maxHeight: 'min(600px, 80vh)' }}
        >
            {/* Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold text-lg text-white">Уведомления</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-dark-300">
                    {unreadCount} непрочитанных
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors font-medium"
                      title={t('action.confirm')}
                      aria-label={t('action.confirm')}
                    >
                      ✓
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                      title={t('action.delete')}
                      aria-label={t('action.delete')}
                    >
                      🗑️
                    </button>
                  </>
                )}
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
                  aria-label="Закрыть"
                  title="Закрыть"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="overflow-y-auto flex-1" role="list" aria-label="Уведомления">
              {sortedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2 opacity-80" aria-hidden="true">🔔</div>
                  <p className="text-dark-400">Нет уведомлений</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-700/50">
                  {sortedNotifications.map(notification => (
                    <button
                      key={notification.id}
                      className={`w-full p-4 hover:bg-dark-800/60 transition-all text-left ${
                        !notification.read ? 'bg-dark-800/40' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                      aria-label={notification.title}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`text-2xl ${getNotificationColor(notification.type)}`}
                          aria-hidden="true"
                        >
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-white">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-0.5 shadow-lg shadow-blue-500/50" aria-label="непрочитано" />
                            )}
                          </div>
                          <p className="text-sm text-dark-300 mt-1.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-dark-500 mt-2">
                            {formatNotificationTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
      )}
    </div>
  )
}
