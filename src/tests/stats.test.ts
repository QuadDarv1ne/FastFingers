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
  calculateRhythmScore,
  calculateFingerBalance,
  calculateErrorRecoveryTime,
  calculateSessionEfficiency,
  calculateLearningVelocity,
  analyzeTimeOfDayPerformance,
  analyzeFunnel,
  predictGoalAchievement,
  calculateSkillProfile,
  calculateStreak,
  calculateStreakBonus,
} from '../utils/stats'
import { KeystrokeData, TypingStats } from '../types'

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

  describe('calculateRhythmScore', () => {
    it('должен возвращать 100 для пустого массива', () => {
      expect(calculateRhythmScore([])).toBe(100)
    })

    it('должен возвращать 100 для одного элемента', () => {
      const keystrokes: KeystrokeData[] = [{ timestamp: 1000, isCorrect: true, key: 'a', finger: 'index', hand: 'left' }]
      expect(calculateRhythmScore(keystrokes)).toBe(100)
    })

    it('должен рассчитывать ритм для равномерных интервалов', () => {
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: true, key: 'a', finger: 'index', hand: 'left' },
        { timestamp: 100, isCorrect: true, key: 'b', finger: 'middle', hand: 'left' },
        { timestamp: 200, isCorrect: true, key: 'c', finger: 'ring', hand: 'left' },
        { timestamp: 300, isCorrect: true, key: 'd', finger: 'pinky', hand: 'left' },
      ]
      expect(calculateRhythmScore(keystrokes)).toBe(100)
    })

    it('должен снижать оценку для неравномерных интервалов', () => {
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: true, key: 'a', finger: 'index', hand: 'left' },
        { timestamp: 100, isCorrect: true, key: 'b', finger: 'middle', hand: 'left' },
        { timestamp: 500, isCorrect: true, key: 'c', finger: 'ring', hand: 'left' },
        { timestamp: 600, isCorrect: true, key: 'd', finger: 'pinky', hand: 'left' },
      ]
      const score = calculateRhythmScore(keystrokes)
      expect(score).toBeLessThan(100)
      expect(score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateFingerBalance', () => {
    it('должен возвращать 50/50 для пустого массива', () => {
      expect(calculateFingerBalance([])).toEqual({ left: 50, right: 50 })
    })

    it('должен рассчитывать баланс для левой руки', () => {
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: true, key: 'а', finger: 'index', hand: 'left' },
        { timestamp: 100, isCorrect: true, key: 'б', finger: 'middle', hand: 'left' },
      ]
      expect(calculateFingerBalance(keystrokes)).toEqual({ left: 100, right: 0 })
    })

    it('должен рассчитывать баланс для правой руки', () => {
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: true, key: 'и', finger: 'index', hand: 'right' },
        { timestamp: 100, isCorrect: true, key: 'м', finger: 'middle', hand: 'right' },
      ]
      expect(calculateFingerBalance(keystrokes)).toEqual({ left: 0, right: 100 })
    })

    it('должен рассчитывать сбалансированную печать', () => {
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: true, key: 'а', finger: 'index', hand: 'left' },
        { timestamp: 100, isCorrect: true, key: 'и', finger: 'index', hand: 'right' },
      ]
      expect(calculateFingerBalance(keystrokes)).toEqual({ left: 50, right: 50 })
    })
  })

  describe('calculateErrorRecoveryTime', () => {
    it('должен возвращать 0 для пустого массива', () => {
      expect(calculateErrorRecoveryTime([])).toBe(0)
    })

    it('должен возвращать 0 если нет ошибок', () => {
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: true, key: 'a', finger: 'index', hand: 'left' },
        { timestamp: 100, isCorrect: true, key: 'b', finger: 'middle', hand: 'left' },
      ]
      expect(calculateErrorRecoveryTime(keystrokes)).toBe(0)
    })

    it('должен рассчитывать время восстановления после ошибки', () => {
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: false, key: 'a', finger: 'index', hand: 'left' },
        { timestamp: 200, isCorrect: true, key: 'b', finger: 'middle', hand: 'left' },
      ]
      expect(calculateErrorRecoveryTime(keystrokes)).toBe(200)
    })

    it('должен рассчитывать среднее время восстановления', () => {
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: false, key: 'a', finger: 'index', hand: 'left' },
        { timestamp: 100, isCorrect: true, key: 'b', finger: 'middle', hand: 'left' },
        { timestamp: 200, isCorrect: false, key: 'c', finger: 'ring', hand: 'left' },
        { timestamp: 400, isCorrect: true, key: 'd', finger: 'pinky', hand: 'left' },
      ]
      expect(calculateErrorRecoveryTime(keystrokes)).toBe(150)
    })
  })

  describe('calculateSessionEfficiency', () => {
    it('должен возвращать 0 при нулевом времени', () => {
      const stats: TypingStats = {
        wpm: 50,
        cpm: 250,
        accuracy: 95,
        errors: 5,
        correctChars: 100,
        totalChars: 110,
        timeElapsed: 0,
      }
      expect(calculateSessionEfficiency(stats)).toBe(0)
    })

    it('должен рассчитывать эффективность сессии', () => {
      const stats: TypingStats = {
        wpm: 60,
        cpm: 300,
        accuracy: 100,
        errors: 0,
        correctChars: 120,
        totalChars: 120,
        timeElapsed: 60,
      }
      expect(calculateSessionEfficiency(stats)).toBe(2)
    })
  })

  describe('calculateLearningVelocity', () => {
    it('должен возвращать 0 для пустого массива', () => {
      expect(calculateLearningVelocity([])).toBe(0)
    })

    it('должен возвращать 0 для одного элемента', () => {
      const data = [{ week: '2024-W1', avgWpm: 50, avgAccuracy: 90, sessions: 5 }]
      expect(calculateLearningVelocity(data)).toBe(0)
    })

    it('должен рассчитывать прирост WPM', () => {
      const data = [
        { week: '2024-W1', avgWpm: 40, avgAccuracy: 85, sessions: 5 },
        { week: '2024-W2', avgWpm: 50, avgAccuracy: 90, sessions: 7 },
      ]
      expect(calculateLearningVelocity(data)).toBe(10)
    })

    it('должен рассчитывать отрицательный прирост', () => {
      const data = [
        { week: '2024-W1', avgWpm: 60, avgAccuracy: 95, sessions: 10 },
        { week: '2024-W2', avgWpm: 50, avgAccuracy: 90, sessions: 8 },
      ]
      expect(calculateLearningVelocity(data)).toBe(-10)
    })
  })

  describe('analyzeTimeOfDayPerformance', () => {
    it('должен возвращать 4 периода суток', () => {
      const result = analyzeTimeOfDayPerformance([])
      expect(result).toHaveLength(4)
      expect(result.map(r => r.timeOfDay)).toEqual(['morning', 'afternoon', 'evening', 'night'])
    })

    it('должен группировать сессии по утру (5-12 часов)', () => {
      const sessions = [
        { wpm: 50, accuracy: 90, errors: 2, correctChars: 100, totalChars: 110, timeElapsed: 60, cpm: 100, timestamp: '2024-01-01T10:00:00' },
      ]
      const result = analyzeTimeOfDayPerformance(sessions)
      expect(result.find(r => r.timeOfDay === 'morning')?.avgWpm).toBe(50)
    })

    it('должен группировать сессии по дню (12-17 часов)', () => {
      const sessions = [
        { wpm: 60, accuracy: 95, errors: 1, correctChars: 120, totalChars: 125, timeElapsed: 60, cpm: 120, timestamp: '2024-01-01T15:00:00' },
      ]
      const result = analyzeTimeOfDayPerformance(sessions)
      expect(result.find(r => r.timeOfDay === 'afternoon')?.avgWpm).toBe(60)
    })

    it('должен группировать сессии по вечеру (17-22 часов)', () => {
      const sessions = [
        { wpm: 55, accuracy: 92, errors: 3, correctChars: 110, totalChars: 115, timeElapsed: 60, cpm: 110, timestamp: '2024-01-01T20:00:00' },
      ]
      const result = analyzeTimeOfDayPerformance(sessions)
      expect(result.find(r => r.timeOfDay === 'evening')?.avgWpm).toBe(55)
    })

    it('должен группировать сессии по ночи (22-5 часов)', () => {
      const sessions = [
        { wpm: 45, accuracy: 88, errors: 4, correctChars: 90, totalChars: 95, timeElapsed: 60, cpm: 90, timestamp: '2024-01-01T23:30:00' },
      ]
      const result = analyzeTimeOfDayPerformance(sessions)
      expect(result.find(r => r.timeOfDay === 'night')?.avgWpm).toBe(45)
    })
  })

  describe('analyzeFunnel', () => {
    it('должен возвращать пустой массив для пустых данных', () => {
      expect(analyzeFunnel([], { started: 0, completed50: 30, completed80: 48, completed100: 60, highAccuracy: 90 })).toEqual([])
    })

    it('должен рассчитывать воронку для сессий', () => {
      const sessions = [
        { wpm: 50, accuracy: 95, errors: 2, correctChars: 100, totalChars: 110, timeElapsed: 60, cpm: 100, timestamp: '2024-01-01T10:00:00Z' },
        { wpm: 60, accuracy: 90, errors: 3, correctChars: 120, totalChars: 130, timeElapsed: 30, cpm: 120, timestamp: '2024-01-01T11:00:00Z' },
      ]
      const result = analyzeFunnel(sessions, { started: 0, completed50: 30, completed80: 48, completed100: 60, highAccuracy: 90 })
      expect(result).toHaveLength(5)
      expect(result[0]?.count).toBe(2)
    })
  })

  describe('predictGoalAchievement', () => {
    it('должен возвращать 0 недель если цель достигнута', () => {
      const result = predictGoalAchievement(60, 50, 2)
      expect(result.weeks).toBe(0)
      expect(result.achievable).toBe(true)
    })

    it('должен возвращать недостижимую цель при нулевом прогрессе', () => {
      const result = predictGoalAchievement(40, 60, 0)
      expect(result.weeks).toBe(Infinity)
      expect(result.achievable).toBe(false)
    })

    it('должен рассчитывать недели до достижения цели', () => {
      const result = predictGoalAchievement(40, 60, 2)
      expect(result.weeks).toBe(10)
      expect(result.achievable).toBe(true)
    })
  })

  describe('calculateSkillProfile', () => {
    it('должен рассчитывать профиль навыков', () => {
      const stats: TypingStats = {
        wpm: 60,
        cpm: 300,
        accuracy: 95,
        errors: 2,
        correctChars: 120,
        totalChars: 125,
        timeElapsed: 60,
      }
      const keystrokes: KeystrokeData[] = [
        { timestamp: 0, isCorrect: true, key: 'a', finger: 'index', hand: 'left' },
        { timestamp: 100, isCorrect: true, key: 'b', finger: 'middle', hand: 'left' },
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

  describe('calculateStreak', () => {
    it('должен возвращать 0 для пустого массива', () => {
      expect(calculateStreak([])).toBe(0)
    })

    it('должен возвращать 0 если нет активности сегодня и вчера', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
      expect(calculateStreak([threeDaysAgo])).toBe(0)
    })

    it('должен рассчитывать текущую серию', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      expect(calculateStreak([today.getTime(), yesterday.getTime()])).toBeGreaterThanOrEqual(1)
    })
  })

  describe('calculateStreakBonus', () => {
    it('должен возвращать 1.0 для серии менее 3', () => {
      expect(calculateStreakBonus(0)).toBe(1.0)
      expect(calculateStreakBonus(2)).toBe(1.0)
    })

    it('должен возвращать 1.1 для серии 3-6', () => {
      expect(calculateStreakBonus(3)).toBe(1.1)
      expect(calculateStreakBonus(6)).toBe(1.1)
    })

    it('должен возвращать 1.25 для серии 7-13', () => {
      expect(calculateStreakBonus(7)).toBe(1.25)
      expect(calculateStreakBonus(13)).toBe(1.25)
    })

    it('должен возвращать 1.5 для серии 14-29', () => {
      expect(calculateStreakBonus(14)).toBe(1.5)
      expect(calculateStreakBonus(29)).toBe(1.5)
    })

    it('должен возвращать 2.0 для серии 30+', () => {
      expect(calculateStreakBonus(30)).toBe(2.0)
      expect(calculateStreakBonus(100)).toBe(2.0)
    })
  })
})
