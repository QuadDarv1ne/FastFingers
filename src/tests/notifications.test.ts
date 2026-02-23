import { describe, it, expect } from 'vitest'
import {
  createAchievementNotification,
  createLevelUpNotification,
  createStreakNotification,
  createChallengeCompleteNotification,
} from '../utils/notifications'

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
})
