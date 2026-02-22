import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'

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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Загрузка уведомлений - только если пользователь есть
  useEffect(() => {
    if (!user?.id) return
    
    try {
      const stored = localStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${user.id}`)
      if (stored) {
        setNotifications(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load notifications:', e)
    }
  }, [user])

  // Сохранение уведомлений
  useEffect(() => {
    if (!user?.id) return
    
    try {
      localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${user.id}`, JSON.stringify(notifications))
    } catch (e) {
      console.error('Failed to save notifications:', e)
    }
  }, [notifications, user])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      timestamp: Date.now(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Храним последние 50
    
    // Показываем браузерное уведомление если разрешено
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.svg',
      })
    }
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

// Хелперы для создания уведомлений
export const createAchievementNotification = (achievement: { title: string; description: string; icon: string }) => ({
  type: 'achievement' as const,
  title: '🏆 Достижение разблокировано!',
  message: achievement.title,
  icon: achievement.icon,
})

export const createLevelUpNotification = (level: number) => ({
  type: 'level' as const,
  title: '⭐ Уровень повышен!',
  message: `Вы достигли ${level} уровня!`,
  icon: '🎉',
})

export const createStreakNotification = (days: number, bonus: number) => ({
  type: 'streak' as const,
  title: '🔥 Серия продолжается!',
  message: `${days} дней подряд! +${bonus} XP бонус`,
  icon: '🔥',
})

export const createChallengeNotification = (challenge: { title: string; reward: number }) => ({
  type: 'challenge' as const,
  title: '✅ Челлендж выполнен!',
  message: `${challenge.title} +${challenge.reward} XP`,
  icon: '🎯',
})
