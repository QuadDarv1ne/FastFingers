import { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
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

const getStorageKey = (userId: string) => `${NOTIFICATIONS_STORAGE_KEY}_${userId}`

const loadNotifications = (userId: string): Notification[] => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Failed to load notifications:', e)
    return []
  }
}

const saveNotifications = (userId: string, notifications: Notification[]) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(notifications))
  } catch (e) {
    console.error('Failed to save notifications:', e)
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
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user?.id) return
    setNotifications(loadNotifications(user.id))
  }, [user])

  useEffect(() => {
    if (!user?.id) return
    saveNotifications(user.id, notifications)
  }, [notifications, user])

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

export { NotificationContext }
