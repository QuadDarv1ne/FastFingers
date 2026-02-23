import { describe, it, expect } from 'vitest'
import {
  calculateStats,
  formatTime,
  formatWPM,
  calculateLevel,
  xpForLevel,
  calculateLevelProgress,
  calculateSessionXp,
  checkAchievement,
  updateKeyHeatmap,
  getHeatmapColor,
} from '../utils/stats'

describe('stats utils', () => {
  describe('calculateStats', () => {
    it('должен корректно рассчитывать статистику', () => {
      const stats = calculateStats(100, 110, 10, 60)
      
      expect(stats.wpm).toBe(20) // 100 символов / 5 / 1 минута
      expect(stats.cpm).toBe(100)
      expect(stats.accuracy).toBe(91) // 100/110 * 100
      expect(stats.errors).toBe(10)
    })

    it('должен возвращать 0 при нулевом времени', () => {
      const stats = calculateStats(100, 110, 10, 0)
      
      expect(stats.wpm).toBe(0)
      expect(stats.cpm).toBe(0)
    })

    it('должен возвращать 100% точности при пустых данных', () => {
      const stats = calculateStats(0, 0, 0, 10)
      
      expect(stats.accuracy).toBe(100)
    })
  })

  describe('formatTime', () => {
    it('должен форматировать секунды в ММ:СС', () => {
      expect(formatTime(0)).toBe('00:00')
      expect(formatTime(5)).toBe('00:05')
      expect(formatTime(65)).toBe('01:05')
      expect(formatTime(125)).toBe('02:05')
    })
  })

  describe('formatWPM', () => {
    it('должен форматировать WPM как строку', () => {
      expect(formatWPM(0)).toBe('0')
      expect(formatWPM(45)).toBe('45')
      expect(formatWPM(120)).toBe('120')
    })
  })

  describe('calculateLevel', () => {
    it('должен рассчитывать уровень на основе XP', () => {
      expect(calculateLevel(0)).toBe(1)
      expect(calculateLevel(100)).toBe(2)
      expect(calculateLevel(400)).toBe(3)
      expect(calculateLevel(900)).toBe(4)
    })
  })

  describe('xpForLevel', () => {
    it('должен возвращать необходимый XP для уровня', () => {
      expect(xpForLevel(1)).toBe(100)
      expect(xpForLevel(2)).toBe(400)
      expect(xpForLevel(3)).toBe(900)
    })
  })

  describe('calculateLevelProgress', () => {
    it('должен рассчитывать прогресс до следующего уровня', () => {
      expect(calculateLevelProgress(0)).toBe(0)
      expect(calculateLevelProgress(100)).toBeGreaterThanOrEqual(0)
      expect(calculateLevelProgress(100)).toBeLessThanOrEqual(100)
    })
  })

  describe('calculateSessionXp', () => {
    it('должен рассчитывать XP за сессию с бонусами', () => {
      const stats = {
        wpm: 50,
        cpm: 250,
        accuracy: 95,
        errors: 2,
        correctChars: 250,
        totalChars: 260,
        timeElapsed: 60,
      }

      const xp = calculateSessionXp(stats)
      
      // Базовый XP: 60/10 = 6
      // Бонус за точность (95%): +50
      // Бонус за WPM (50): +30
      // Штраф за ошибки: -4
      // Итого: 6 + 50 + 30 - 4 = 82
      expect(xp).toBe(82)
    })

    it('должен возвращать минимум 0 XP', () => {
      const stats = {
        wpm: 5,
        cpm: 25,
        accuracy: 50,
        errors: 50,
        correctChars: 50,
        totalChars: 100,
        timeElapsed: 10,
      }

      const xp = calculateSessionXp(stats)
      expect(xp).toBeGreaterThanOrEqual(0)
    })
  })

  describe('checkAchievement', () => {
    const progress = {
      bestWpm: 45,
      bestAccuracy: 96,
      totalWordsTyped: 1500,
    }

    it('должен проверять достижение first-steps', () => {
      const stats = { wpm: 15, accuracy: 90, errors: 5, correctChars: 100, totalChars: 110, timeElapsed: 60, cpm: 100 }
      expect(checkAchievement('first-steps', progress, stats)).toBe(true)
    })

    it('должен проверять достижение speed-demon', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(checkAchievement('speed-demon', progress, {} as any)).toBe(true)
    })

    it('должен проверять достижение accuracy-master', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(checkAchievement('accuracy-master', progress, {} as any)).toBe(true)
    })

    it('должен проверять достижение word-warrior', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(checkAchievement('word-warrior', progress, {} as any)).toBe(true)
    })
  })

  describe('updateKeyHeatmap', () => {
    it('должен обновлять тепловую карту для новой клавиши', () => {
      const heatmap = {}
      const result = updateKeyHeatmap(heatmap, 'а', true)
      
      expect(result['а']).toEqual({
        errors: 0,
        total: 1,
        accuracy: 100,
      })
    })

    it('должен обновлять тепловую карту при ошибке', () => {
      const heatmap = {
        'а': { errors: 0, total: 1, accuracy: 100 },
      }
      const result = updateKeyHeatmap(heatmap, 'а', false)
      
      expect(result['а']).toEqual({
        errors: 1,
        total: 2,
        accuracy: 50,
      })
    })
  })

  describe('getHeatmapColor', () => {
    it('должен возвращать зелёный для высокой точности', () => {
      expect(getHeatmapColor(100)).toBe('#22c55e')
      expect(getHeatmapColor(95)).toBe('#22c55e')
    })

    it('должен возвращать жёлтый для средней точности', () => {
      expect(getHeatmapColor(75)).toBe('#eab308')
    })

    it('должен возвращать красный для низкой точности', () => {
      expect(getHeatmapColor(50)).toBe('#ef4444')
      expect(getHeatmapColor(30)).toBe('#ef4444')
    })
  })
})
