import { describe, it, expect } from 'vitest'
import {
  calculateRhythmScore,
  calculateFingerBalance,
  calculateErrorRecoveryTime,
  calculateSessionEfficiency,
  calculateLearningVelocity,
  analyzeTimeOfDayPerformance,
  analyzeFunnel,
  predictGoalAchievement,
  calculateSkillProfile,
} from '../utils/stats'
import { KeystrokeData, TypingStats } from '@/types'

describe('Новые метрики статистики', () => {
  describe('calculateRhythmScore', () => {
    it('должен возвращать 100 для менее чем 2 нажатий', () => {
      expect(calculateRhythmScore([])).toBe(100)
      expect(calculateRhythmScore([{ key: 'a', timestamp: 1000, isCorrect: true, finger: 'left-index', hand: 'left' }])).toBe(100)
    })

    it('должен возвращать высокий score для равномерных интервалов', () => {
      const keystrokes: KeystrokeData[] = [
        { key: 'a', timestamp: 0, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'b', timestamp: 100, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'c', timestamp: 200, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'd', timestamp: 300, isCorrect: true, finger: 'left-index', hand: 'left' },
      ]
      expect(calculateRhythmScore(keystrokes)).toBeGreaterThan(90)
    })

    it('должен возвращать низкий score для неравномерных интервалов', () => {
      const keystrokes: KeystrokeData[] = [
        { key: 'a', timestamp: 0, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'b', timestamp: 100, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'c', timestamp: 500, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'd', timestamp: 600, isCorrect: true, finger: 'left-index', hand: 'left' },
      ]
      expect(calculateRhythmScore(keystrokes)).toBeLessThan(80)
    })
  })

  describe('calculateFingerBalance', () => {
    it('должен возвращать 50/50 для пустого массива', () => {
      expect(calculateFingerBalance([])).toEqual({ left: 50, right: 50 })
    })

    it('должен правильно рассчитывать баланс для смешанных нажатий', () => {
      const keystrokes: KeystrokeData[] = [
        { key: 'a', timestamp: 0, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'b', timestamp: 100, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'c', timestamp: 200, isCorrect: true, finger: 'right-index', hand: 'right' },
        { key: 'd', timestamp: 300, isCorrect: true, finger: 'right-index', hand: 'right' },
      ]
      expect(calculateFingerBalance(keystrokes)).toEqual({ left: 50, right: 50 })
    })

    it('должен правильно рассчитывать баланс с перевесом влево', () => {
      const keystrokes: KeystrokeData[] = [
        { key: 'a', timestamp: 0, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'b', timestamp: 100, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'c', timestamp: 200, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'd', timestamp: 300, isCorrect: true, finger: 'right-index', hand: 'right' },
      ]
      expect(calculateFingerBalance(keystrokes)).toEqual({ left: 75, right: 25 })
    })
  })

  describe('calculateErrorRecoveryTime', () => {
    it('должен возвращать 0 если нет ошибок', () => {
      const keystrokes: KeystrokeData[] = [
        { key: 'a', timestamp: 0, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'b', timestamp: 100, isCorrect: true, finger: 'left-index', hand: 'left' },
      ]
      expect(calculateErrorRecoveryTime(keystrokes)).toBe(0)
    })

    it('должен правильно рассчитывать время восстановления после ошибки', () => {
      const keystrokes: KeystrokeData[] = [
        { key: 'a', timestamp: 0, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'b', timestamp: 100, isCorrect: false, finger: 'left-index', hand: 'left' },
        { key: 'c', timestamp: 300, isCorrect: true, finger: 'left-index', hand: 'left' },
      ]
      expect(calculateErrorRecoveryTime(keystrokes)).toBe(200)
    })

    it('должен рассчитывать среднее время восстановления для нескольких ошибок', () => {
      const keystrokes: KeystrokeData[] = [
        { key: 'a', timestamp: 0, isCorrect: false, finger: 'left-index', hand: 'left' },
        { key: 'b', timestamp: 200, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'c', timestamp: 300, isCorrect: false, finger: 'left-index', hand: 'left' },
        { key: 'd', timestamp: 600, isCorrect: true, finger: 'left-index', hand: 'left' },
      ]
      // (200 + 300) / 2 = 250
      expect(calculateErrorRecoveryTime(keystrokes)).toBe(250)
    })
  })

  describe('calculateSessionEfficiency', () => {
    it('должен возвращать 0 если время равно 0', () => {
      const stats: TypingStats = {
        wpm: 50,
        cpm: 250,
        accuracy: 95,
        errors: 2,
        correctChars: 100,
        totalChars: 105,
        timeElapsed: 0,
      }
      expect(calculateSessionEfficiency(stats)).toBe(0)
    })

    it('должен правильно рассчитывать эффективность', () => {
      const stats: TypingStats = {
        wpm: 50,
        cpm: 250,
        accuracy: 100,
        errors: 0,
        correctChars: 100,
        totalChars: 100,
        timeElapsed: 10, // 10 символов в секунду
      }
      // (100 / 10) * 1.0 = 10
      expect(calculateSessionEfficiency(stats)).toBe(10)
    })

    it('должен учитывать точность при расчёте', () => {
      const stats: TypingStats = {
        wpm: 50,
        cpm: 250,
        accuracy: 80,
        errors: 5,
        correctChars: 100,
        totalChars: 125,
        timeElapsed: 10,
      }
      // (100 / 10) * 0.8 = 8
      expect(calculateSessionEfficiency(stats)).toBe(8)
    })
  })

  describe('calculateLearningVelocity', () => {
    it('должен возвращать 0 если недостаточно данных', () => {
      expect(calculateLearningVelocity([])).toBe(0)
      expect(calculateLearningVelocity([{ week: '2024-01-01', avgWpm: 50, sessions: 5 }])).toBe(0)
    })

    it('должен правильно рассчитывать прирост WPM', () => {
      const data = [
        { week: '2024-01-01', avgWpm: 40, sessions: 5 },
        { week: '2024-01-08', avgWpm: 50, sessions: 6 },
      ]
      expect(calculateLearningVelocity(data)).toBe(10)
    })

    it('должен возвращать отрицательное значение при регрессе', () => {
      const data = [
        { week: '2024-01-01', avgWpm: 50, sessions: 5 },
        { week: '2024-01-08', avgWpm: 40, sessions: 6 },
      ]
      expect(calculateLearningVelocity(data)).toBe(-10)
    })
  })

  describe('analyzeTimeOfDayPerformance', () => {
    it('должен возвращать пустые данные для пустого массива', () => {
      const result = analyzeTimeOfDayPerformance([])
      expect(result).toHaveLength(4)
      expect(result.every(r => r.sessions === 0)).toBe(true)
    })

    it('должен правильно группировать сессии по времени суток', () => {
      const sessions = [
        { wpm: 50, accuracy: 90, errors: 2, correctChars: 100, totalChars: 110, timeElapsed: 60, cpm: 250, timestamp: new Date('2024-01-01T10:00:00').toISOString() },
        { wpm: 60, accuracy: 95, errors: 1, correctChars: 120, totalChars: 125, timeElapsed: 60, cpm: 300, timestamp: new Date('2024-01-01T15:00:00').toISOString() },
        { wpm: 55, accuracy: 92, errors: 3, correctChars: 110, totalChars: 120, timeElapsed: 60, cpm: 275, timestamp: new Date('2024-01-01T20:00:00').toISOString() },
        { wpm: 45, accuracy: 88, errors: 4, correctChars: 90, totalChars: 100, timeElapsed: 60, cpm: 225, timestamp: new Date('2024-01-02T02:00:00').toISOString() },
      ]
      const result = analyzeTimeOfDayPerformance(sessions)
      expect(result).toHaveLength(4)

      const morning = result.find(r => r.timeOfDay === 'morning')
      const afternoon = result.find(r => r.timeOfDay === 'afternoon')

      expect(morning?.sessions).toBeGreaterThan(0)
      expect(afternoon?.sessions).toBeGreaterThan(0)
    })
  })

  describe('analyzeFunnel', () => {
    it('должен возвращать пустой массив для пустого массива сессий', () => {
      expect(analyzeFunnel([], { started: 0, completed50: 30, completed80: 60, completed100: 90, highAccuracy: 90 })).toEqual([])
    })

    it('должен правильно рассчитывать воронку', () => {
      const sessions = [
        { wpm: 50, accuracy: 90, errors: 2, correctChars: 100, totalChars: 110, timeElapsed: 100, cpm: 250, timestamp: '2024-01-01T08:00:00Z' },
        { wpm: 60, accuracy: 95, errors: 1, correctChars: 120, totalChars: 125, timeElapsed: 50, cpm: 300, timestamp: '2024-01-01T14:00:00Z' },
        { wpm: 55, accuracy: 92, errors: 3, correctChars: 110, totalChars: 120, timeElapsed: 80, cpm: 275, timestamp: '2024-01-01T19:00:00Z' },
      ]
      const result = analyzeFunnel(sessions, { started: 0, completed50: 30, completed80: 60, completed100: 90, highAccuracy: 90 })
      expect(result).toHaveLength(5)
      expect(result[0]?.count).toBe(3)
      expect(result[0]?.percentage).toBe(100)
    })
  })

  describe('predictGoalAchievement', () => {
    it('должен возвращать 0 недель если цель уже достигнута', () => {
      const result = predictGoalAchievement(70, 60, 5)
      expect(result.weeks).toBe(0)
      expect(result.achievable).toBe(true)
    })

    it('должен возвращать недостижимую цель если velocity <= 0', () => {
      const result = predictGoalAchievement(40, 60, 0)
      expect(result.achievable).toBe(false)
      expect(result.weeks).toBe(Infinity)
    })

    it('должен правильно рассчитывать недели до цели', () => {
      const result = predictGoalAchievement(40, 60, 5)
      expect(result.weeks).toBe(4)
      expect(result.achievable).toBe(true)
    })
  })

  describe('calculateSkillProfile', () => {
    it('должен возвращать профиль навыков', () => {
      const stats: TypingStats = {
        wpm: 60,
        cpm: 300,
        accuracy: 95,
        errors: 2,
        correctChars: 100,
        totalChars: 105,
        timeElapsed: 60,
      }
      const keystrokes: KeystrokeData[] = [
        { key: 'a', timestamp: 0, isCorrect: true, finger: 'left-index', hand: 'left' },
        { key: 'b', timestamp: 100, isCorrect: true, finger: 'right-index', hand: 'right' },
      ]
      const profile = calculateSkillProfile(stats, keystrokes)
      expect(profile).toHaveProperty('Скорость (WPM)')
      expect(profile).toHaveProperty('Точность')
      expect(profile).toHaveProperty('Ритм')
      expect(profile).toHaveProperty('Эффективность')
      expect(profile).toHaveProperty('Баланс рук')
      expect(profile).toHaveProperty('Реакция')
    })
  })
})
