import { describe, it, expect, beforeEach } from 'vitest'
import {
  createAchievementNotification,
  createLevelUpNotification,
  createStreakNotification,
  createChallengeCompleteNotification,
  addNotification,
  formatNotificationTimestamp,
} from '../utils/notifications'
import { STORAGE_KEYS } from '../constants/storageKeys'

describe('notifications utils', () => {
  describe('createAchievementNotification', () => {
    it('должен создавать уведомление о достижении', () => {
      const achievement = {
        title: 'Мастер печати',
        description: 'Достигните 100 WPM',
        icon: '🏆',
      }

      const notification = createAchievementNotification(achievement)

      expect(notification).toEqual({
        type: 'achievement',
        title: '🏆 Достижение разблокировано!',
        message: 'Мастер печати',
        icon: '🏆',
      })
    })
  })

  describe('createLevelUpNotification', () => {
    it('должен создавать уведомление о повышении уровня', () => {
      const notification = createLevelUpNotification(5)

      expect(notification).toEqual({
        type: 'level',
        title: '⭐ Уровень повышен!',
        message: 'Вы достигли 5 уровня!',
        icon: '🎉',
      })
    })

    it('должен работать с любым уровнем', () => {
      const notification = createLevelUpNotification(100)

      expect(notification.message).toBe('Вы достигли 100 уровня!')
    })
  })

  describe('createStreakNotification', () => {
    it('должен создавать уведомление о серии', () => {
      const notification = createStreakNotification(7, 150)

      expect(notification).toEqual({
        type: 'streak',
        title: '🔥 Серия!',
        message: '7 дней подряд! +150 XP бонус',
        icon: '💪',
      })
    })

    it('должен работать с разными значениями', () => {
      const notification = createStreakNotification(30, 1000)

      expect(notification.message).toBe('30 дней подряд! +1000 XP бонус')
    })
  })

  describe('createChallengeCompleteNotification', () => {
    it('должен создавать уведомление о завершении челленджа', () => {
      const notification = createChallengeCompleteNotification(85)

      expect(notification).toEqual({
        type: 'challenge',
        title: '✅ Челлендж завершён!',
        message: 'Ваша скорость: 85 WPM',
        icon: '🎯',
      })
    })

    it('должен работать с любой скоростью', () => {
      const notification = createChallengeCompleteNotification(120)

      expect(notification.message).toBe('Ваша скорость: 120 WPM')
    })
  })

  describe('addNotification', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('должен добавлять уведомление в localStorage', () => {
      const notification = {
        type: 'info' as const,
        title: 'Test',
        message: 'Test message',
        icon: 'ℹ️',
      }

      addNotification(notification)

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].title).toBe('Test')
      expect(stored[0].read).toBe(false)
      expect(stored[0].id).toMatch(/notif-\d+-[a-z0-9]+/)
    })

    it('должен добавлять timestamp к уведомлению', () => {
      const notification = {
        type: 'info' as const,
        title: 'Success',
        message: 'Operation completed',
        icon: '✅',
      }

      addNotification(notification)

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
      expect(stored[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('должен обрезать до 50 уведомлений', () => {
      for (let i = 0; i < 60; i++) {
        addNotification({
          type: 'info' as const,
          title: `Notification ${i}`,
          message: `Message ${i}`,
          icon: 'ℹ️',
        })
      }

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
      expect(stored).toHaveLength(50)
    })

    it('должен добавлять новые уведомления в начало', () => {
      addNotification({
        type: 'info' as const,
        title: 'First',
        message: 'First message',
        icon: 'ℹ️',
      })
      addNotification({
        type: 'info' as const,
        title: 'Second',
        message: 'Second message',
        icon: 'ℹ️',
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
      expect(stored[0].title).toBe('Second')
      expect(stored[1].title).toBe('First')
    })

    it('должен генерировать уникальные ID', () => {
      addNotification({
        type: 'info' as const,
        title: 'First',
        message: 'First message',
        icon: 'ℹ️',
      })
      addNotification({
        type: 'info' as const,
        title: 'Second',
        message: 'Second message',
        icon: 'ℹ️',
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
      expect(stored[0].id).not.toBe(stored[1].id)
    })
  })

  describe('formatNotificationTimestamp', () => {
    it('должен возвращать "Только что" для недавних уведомлений', () => {
      const now = new Date().toISOString()
      expect(formatNotificationTimestamp(now)).toBe('Только что')
    })

    it('должен форматировать минуты назад', () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString()
      expect(formatNotificationTimestamp(fiveMinsAgo)).toBe('5 мин назад')
    })

    it('должен форматировать часы назад', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString()
      expect(formatNotificationTimestamp(threeHoursAgo)).toBe('3 ч назад')
    })

    it('должен форматировать дни назад', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString()
      expect(formatNotificationTimestamp(fiveDaysAgo)).toBe('5 д назад')
    })

    it('должен форматировать дату для старых уведомлений', () => {
      const oldDate = new Date('2024-01-15T10:00:00Z').toISOString()
      const result = formatNotificationTimestamp(oldDate)
      expect(result).toMatch(/\d+ (янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек)/i)
    })
  })
})
