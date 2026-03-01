import { useState, useEffect } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'

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
  onOpenPanel?: () => void
}

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationBell({ onOpenPanel }: NotificationBellProps) {
  const [notifications, setNotifications] = useLocalStorageState<Notification[]>(
    'fastfingers_notifications',
    []
  )
  const [isOpen, setIsOpen] = useState(false)
  const [showBadge, setShowBadge] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    setShowBadge(unreadCount > 0)
  }, [unreadCount])

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    if (confirm('Удалить все уведомления?')) {
      setNotifications([])
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    const colors = {
      achievement: 'text-yellow-400',
      milestone: 'text-blue-400',
      streak: 'text-orange-400',
      challenge: 'text-purple-400',
      info: 'text-green-400',
    }
    return colors[type]
  }

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const handleOpen = () => {
    setIsOpen(true)
    onOpenPanel?.()
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-all flex items-center justify-center"
        aria-label="Уведомления"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {showBadge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] glass rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Уведомления</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-dark-400">
                    {unreadCount} непрочитанных
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs px-3 py-1 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                      title="Отметить все как прочитанные"
                    >
                      ✓
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs px-3 py-1 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                      title="Очистить все"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="overflow-y-auto max-h-[500px]">
              {sortedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-dark-400">Нет уведомлений</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-700">
                  {sortedNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-dark-800/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-dark-800/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`text-2xl ${getNotificationColor(notification.type)}`}
                        >
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-dark-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-dark-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useLocalStorageState<Notification[]>(
    'fastfingers_notifications',
    []
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    if (confirm('Удалить все уведомления?')) {
      setNotifications([])
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    const colors = {
      achievement: 'text-yellow-400',
      milestone: 'text-blue-400',
      streak: 'text-orange-400',
      challenge: 'text-purple-400',
      info: 'text-green-400',
    }
    return colors[type]
  }

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="fixed top-16 right-4 w-96 max-h-[600px] glass rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Уведомления</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-dark-400">
              {unreadCount} непрочитанных
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-xs px-3 py-1 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            ✕
          </button>
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className="text-xs px-3 py-1 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                title="Отметить все как прочитанные"
              >
                ✓
              </button>
              <button
                onClick={clearAll}
                className="text-xs px-3 py-1 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                title="Очистить все"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="overflow-y-auto max-h-[500px]">
        {sortedNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-dark-400">Нет уведомлений</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {sortedNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-dark-800/50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-dark-800/30' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`text-2xl ${getNotificationColor(notification.type)}`}
                  >
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-dark-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-dark-500 mt-2">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  if (diffDays < 7) return `${diffDays} д назад`

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

// Helper function to add notification
export function addNotification(
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
) {
  const notifications = JSON.parse(
    localStorage.getItem('fastfingers_notifications') || '[]'
  )

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  }

  notifications.unshift(newNotification)

  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50)

  localStorage.setItem('fastfingers_notifications', JSON.stringify(trimmed))

  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('notification-added'))
}
