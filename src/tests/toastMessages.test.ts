/**
 * FastFingers — Тесты для toast-уведомлений
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { describe, it, expect } from 'vitest'
import {
  createAchievementToast,
  createMilestoneToast,
  createLevelUpToast,
  getSessionCompleteToast,
  getNewRecordToast,
  getPerformanceToastType,
  getPerformanceToastMessage,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  INFO_MESSAGES,
} from '../utils/toastMessages'

describe('toastMessages', () => {
  describe('createAchievementToast', () => {
    it('should create achievement toast with correct properties', () => {
      const toast = createAchievementToast('Мастер печати', 'Достигните 100 WPM', '🏆')

      expect(toast.type).toBe('achievement')
      expect(toast.title).toBe('Мастер печати')
      expect(toast.description).toBe('Достигните 100 WPM')
      expect(toast.icon).toBe('🏆')
    })
  })

  describe('createMilestoneToast', () => {
    it('should create milestone toast with number value', () => {
      const toast = createMilestoneToast('Рекорд скорости', 120, '⚡')

      expect(toast.type).toBe('milestone')
      expect(toast.title).toBe('Рекорд скорости')
      expect(toast.value).toBe(120)
      expect(toast.icon).toBe('⚡')
    })

    it('should create milestone toast with string value', () => {
      const toast = createMilestoneToast('Серия дней', '30 дней', '🔥')

      expect(toast.type).toBe('milestone')
      expect(toast.title).toBe('Серия дней')
      expect(toast.value).toBe('30 дней')
      expect(toast.icon).toBe('🔥')
    })
  })

  describe('createLevelUpToast', () => {
    it('should create level up toast with default icon', () => {
      const toast = createLevelUpToast(5, 'Новый уровень!')

      expect(toast.type).toBe('levelup')
      expect(toast.level).toBe(5)
      expect(toast.title).toBe('Новый уровень!')
      expect(toast.icon).toBe('🎉')
    })

    it('should create level up toast with custom icon', () => {
      const toast = createLevelUpToast(10, 'Легендарный уровень!', '💎')

      expect(toast.type).toBe('levelup')
      expect(toast.level).toBe(10)
      expect(toast.title).toBe('Легендарный уровень!')
      expect(toast.icon).toBe('💎')
    })
  })

  describe('getSessionCompleteToast', () => {
    it('should create session complete toast message', () => {
      const toast = getSessionCompleteToast(60, 95)

      expect(toast.success).toContain('Сессия завершена!')
      expect(toast.success).toContain('WPM: 60')
      expect(toast.success).toContain('Точность: 95%')
      expect(toast.error).toBe('Ошибка при сохранении статистики')
    })
  })

  describe('getNewRecordToast', () => {
    it('should create new record toast message', () => {
      const toast = getNewRecordToast('WPM', 100)

      expect(toast.success).toBe('Новый рекорд: WPM = 100! 🏆')
      expect(toast.info).toBe('Предыдущий рекорд был превзойдён')
    })
  })

  describe('getPerformanceToastType', () => {
    it('should return success for excellent performance', () => {
      const type = getPerformanceToastType(80, 98, 50)
      expect(type).toBe('success')
    })

    it('should return warning for low accuracy', () => {
      const type = getPerformanceToastType(60, 75, 50)
      expect(type).toBe('warning')
    })

    it('should return info for below average performance', () => {
      const type = getPerformanceToastType(40, 90, 60)
      expect(type).toBe('info')
    })

    it('should return info for average performance', () => {
      const type = getPerformanceToastType(55, 92, 50)
      expect(type).toBe('info')
    })
  })

  describe('getPerformanceToastMessage', () => {
    it('should return excellent message for great performance', () => {
      const message = getPerformanceToastMessage(80, 98, 50)
      expect(message).toContain('Отличная работа!')
      expect(message).toContain('WPM: 80')
    })

    it('should return warning message for low accuracy', () => {
      const message = getPerformanceToastMessage(60, 75, 50)
      expect(message).toContain('Точность ниже обычной')
      expect(message).toContain('75%')
    })

    it('should return encouragement message for below average speed', () => {
      const message = getPerformanceToastMessage(40, 90, 60)
      expect(message).toContain('Скорость ниже обычной')
      expect(message).toContain('40 WPM')
    })

    it('should return standard message for average performance', () => {
      const message = getPerformanceToastMessage(55, 92, 50)
      expect(message).toContain('Сессия завершена')
      expect(message).toContain('WPM: 55')
    })
  })

  describe('SUCCESS_MESSAGES', () => {
    it('should contain expected success messages', () => {
      expect(SUCCESS_MESSAGES.sessionComplete).toBeDefined()
      expect(SUCCESS_MESSAGES.newRecord).toBeDefined()
      expect(SUCCESS_MESSAGES.levelUp).toBeDefined()
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should contain expected error messages', () => {
      expect(ERROR_MESSAGES.sessionError).toBeDefined()
      expect(ERROR_MESSAGES.networkError).toBeDefined()
    })
  })

  describe('INFO_MESSAGES', () => {
    it('should contain expected info messages', () => {
      expect(INFO_MESSAGES.sessionStarted).toBeDefined()
      expect(INFO_MESSAGES.offlineMode).toBeDefined()
    })
  })
})
