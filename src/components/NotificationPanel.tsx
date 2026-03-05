import { useState, useEffect } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'
import { formatNotificationTimestamp } from '@utils/notifications'
import type { Notification } from './NotificationBell'

interface NotificationPanelProps {
  onClose: () => void
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
            <p className="text-xs text-dark-400">{unreadCount} непрочитанных</p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-dark-400 hover:text-white transition-colors"
            >
              Прочитать все
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Очистить
          </button>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
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
                      {formatNotificationTimestamp(notification.timestamp)}
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
