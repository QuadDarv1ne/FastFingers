import { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react'
import { useAuth } from '@hooks/useAuth'

export interface Notification {
  id: string
  type: 'achievement' | 'challenge' | 'streak' | 'level' | 'info'
  title: string
  message: string
  icon: string
  timestamp: number
  read: boolean
  action?: () => void
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const NOTIFICATIONS_STORAGE_KEY = 'fastfingers_notifications'
const MAX_NOTIFICATIONS = 50

// Используем единый ключ без userId для простоты
const loadNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveNotifications = (notifications: Notification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
  } catch {
    // Ignore save errors
  }
}

const generateNotificationId = (): string =>
  Date.now().toString() + Math.random().toString(36).substring(2)

const showBrowserNotification = (title: string, message: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/favicon.svg',
    })
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user: _user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Загружаем уведомления при монтировании
  useEffect(() => {
    setNotifications(loadNotifications())
  }, [])

  // Сохраняем при изменении
  useEffect(() => {
    saveNotifications(notifications)
  }, [notifications])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateNotificationId(),
      timestamp: Date.now(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS))
    showBrowserNotification(notification.title, notification.message)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export { NotificationContext }
