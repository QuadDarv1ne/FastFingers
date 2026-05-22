import i18n from 'i18next'
import { Notification as BellNotification } from '../components/NotificationBell'
import { Notification as ContextNotification } from '../contexts/NotificationContext'
import { getFromStorageAsArray } from './storage'
import { STORAGE_KEYS } from '../constants/storageKeys'

interface AchievementData {
  title: string
  description: string
  icon: string
}

export function createAchievementNotification(
  achievement: AchievementData
): Omit<ContextNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'achievement',
    title: `🏆 Достижение разблокировано!`,
    message: achievement.title,
    icon: achievement.icon,
  }
}

export function createLevelUpNotification(
  level: number
): Omit<ContextNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'level',
    title: '⭐ Уровень повышен!',
    message: `Вы достигли ${level} уровня!`,
    icon: '🎉',
  }
}

export function createStreakNotification(
  streak: number,
  xpBonus: number
): Omit<ContextNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'streak',
    title: '🔥 Серия!',
    message: `${streak} дней подряд! +${xpBonus} XP бонус`,
    icon: '💪',
  }
}

export function createChallengeCompleteNotification(
  wpm: number
): Omit<ContextNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'challenge',
    title: '✅ Челлендж завершён!',
    message: `Ваша скорость: ${wpm} WPM`,
    icon: '🎯',
  }
}

export function addNotification(
  notification: Omit<BellNotification, 'id' | 'timestamp' | 'read'>
) {
  const notifications = getFromStorageAsArray(STORAGE_KEYS.NOTIFICATIONS)

  const newNotification: BellNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  }

  notifications.unshift(newNotification)

  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50)

  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(trimmed))

  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('notification-added'))
}

export function formatNotificationTimestamp(timestamp: string): string {
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

  return date.toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'short',
  })
}
