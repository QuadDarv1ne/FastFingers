import i18n from 'i18next'
import { Notification as BellNotification } from '../components/NotificationBell'
import { Notification as ContextNotification } from '../contexts/NotificationContext'
import { getFromStorageAsArray, setToStorage } from './storage'
import { STORAGE_KEYS } from '../constants/storageKeys'

interface AchievementData {
  title: string
  description: string
  icon: string
}

const t = i18n.t.bind(i18n)

export function createAchievementNotification(
  achievement: AchievementData
): Omit<ContextNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'achievement',
    title: `🏆 ${t('notification.achievement')}`,
    message: achievement.title,
    icon: achievement.icon,
  }
}

export function createLevelUpNotification(
  level: number
): Omit<ContextNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'level',
    title: `⭐ ${t('notification.levelUp')}`,
    message: t('notification.levelUpMessage', { level }),
    icon: '🎉',
  }
}

export function createStreakNotification(
  streak: number,
  xpBonus: number
): Omit<ContextNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'streak',
    title: `🔥 ${t('notification.streak')}`,
    message: t('notification.streakMessage', { streak, xpBonus }),
    icon: '💪',
  }
}

export function createChallengeCompleteNotification(
  wpm: number
): Omit<ContextNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'challenge',
    title: `✅ ${t('notification.challenge')}`,
    message: t('notification.challengeMessage', { wpm }),
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

  setToStorage(STORAGE_KEYS.NOTIFICATIONS, trimmed)

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

  if (diffMins < 1) return t('time.justNow')
  if (diffMins < 60) return t('time.minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('time.hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('time.daysAgo', { count: diffDays })

  return date.toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'short',
  })
}
