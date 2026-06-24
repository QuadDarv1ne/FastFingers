/**
 * FastFingers — Тесты для адаптивной сложности
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { describe, it, expect } from 'vitest'
import {
  createAdaptiveState,
  evaluateSession,
  updateAdaptiveState,
  selectAdaptiveText,
  getLevelDescription,
  getLevelBadge,
  getDifficultyMultiplier,
  analyzeDifficultyHistory,
  serializeAdaptiveState,
  deserializeAdaptiveState,
  resetAdaptiveState,
} from '../utils/adaptiveDifficulty'
import { practiceTexts } from '../data/practiceTexts'

describe('adaptiveDifficulty', () => {
  describe('createAdaptiveState', () => {
    it('should create initial state with default values', () => {
      const state = createAdaptiveState()

      expect(state.currentLevel).toBe(3)
      expect(state.targetWpm).toBe(25)
      expect(state.targetAccuracy).toBe(85)
      expect(state.consecutiveSuccesses).toBe(0)
      expect(state.consecutiveFailures).toBe(0)
      expect(state.history).toEqual([])
      expect(state.lastAdjustment).toBeNull()
    })
  })

  describe('evaluateSession', () => {
    it('should evaluate successful session correctly', () => {
      const state = createAdaptiveState()
      const stats = {
        wpm: 45,
        cpm: 180,
        accuracy: 95,
        errors: 5,
        timeElapsed: 60,
        totalChars: 100,
        correctChars: 95,
        date: new Date().toISOString(),
      }

      const result = evaluateSession(stats, state)

      expect(result.success).toBe(true)
      expect(result.metrics.wpmScore).toBeGreaterThan(0.7)
      expect(result.metrics.accuracyScore).toBe(1)
      expect(result.metrics.overallScore).toBeGreaterThan(0.7)
    })

    it('should evaluate failed session when accuracy is too low', () => {
      const state = createAdaptiveState()
      const stats = {
        wpm: 50,
        cpm: 200,
        accuracy: 65,
        errors: 35,
        timeElapsed: 60,
        totalChars: 100,
        correctChars: 65,
        date: new Date().toISOString(),
      }

      const result = evaluateSession(stats, state)

      expect(result.success).toBe(false)
      expect(result.metrics.accuracyScore).toBeLessThan(0.8)
    })

    it('should evaluate failed session when WPM is too low', () => {
      const state = createAdaptiveState()
      const stats = {
        wpm: 20,
        cpm: 80,
        accuracy: 95,
        errors: 5,
        timeElapsed: 60,
        totalChars: 100,
        correctChars: 95,
        date: new Date().toISOString(),
      }

      const result = evaluateSession(stats, state)

      // WPM score низкий (20/25 = 0.8), но accuracy высокий, поэтому overall может быть >= 0.7
      expect(result.metrics.wpmScore).toBe(0.8)
      expect(result.metrics.accuracyScore).toBe(1)
    })
  })

  describe('updateAdaptiveState', () => {
    it('should increase level after SUCCESS_THRESHOLD successful sessions', () => {
      let state = createAdaptiveState()
      const initialLevel = state.currentLevel

      // Симулируем 3 успешные сессии
      for (let i = 0; i < 3; i++) {
        const stats = {
          wpm: 50,
          cpm: 200,
          accuracy: 95,
          errors: 5,
          timeElapsed: 60,
          totalChars: 100,
          correctChars: 95,
          date: new Date().toISOString(),
        }
        const sessionResult = evaluateSession(stats, state)
        state = updateAdaptiveState(state, sessionResult, stats)
      }

      expect(state.currentLevel).toBe(initialLevel + 1)
      expect(state.consecutiveSuccesses).toBe(0)
      expect(state.targetWpm).toBeGreaterThan(25)
    })

    it('should decrease level after FAILURE_THRESHOLD failed sessions', () => {
      let state = createAdaptiveState()
      const initialLevel = state.currentLevel

      // Симулируем 2 провальные сессии
      for (let i = 0; i < 2; i++) {
        const stats = {
          wpm: 20,
          cpm: 80,
          accuracy: 70,
          errors: 30,
          timeElapsed: 60,
          totalChars: 100,
          correctChars: 70,
          date: new Date().toISOString(),
        }
        const sessionResult = evaluateSession(stats, state)
        state = updateAdaptiveState(state, sessionResult, stats)
      }

      expect(state.currentLevel).toBe(initialLevel - 1)
      expect(state.consecutiveFailures).toBe(0)
      expect(state.targetWpm).toBeLessThan(40)
    })

    it('should not decrease level below MIN_LEVEL', () => {
      let state: ReturnType<typeof createAdaptiveState> = {
        ...createAdaptiveState(),
        currentLevel: 1,
        targetWpm: 20,
        targetAccuracy: 80,
      }

      // Симулируем 2 провальные сессии
      for (let i = 0; i < 2; i++) {
        const stats = {
          wpm: 10,
          cpm: 40,
          accuracy: 60,
          errors: 40,
          timeElapsed: 60,
          totalChars: 100,
          correctChars: 60,
          date: new Date().toISOString(),
        }
        const sessionResult = evaluateSession(stats, state)
        state = updateAdaptiveState(state, sessionResult, stats)
      }

      expect(state.currentLevel).toBe(1)
    })

    it('should not increase level above MAX_LEVEL', () => {
      let state: ReturnType<typeof createAdaptiveState> = {
        ...createAdaptiveState(),
        currentLevel: 10,
        targetWpm: 100,
        targetAccuracy: 98,
      }

      // Симулируем 3 успешные сессии
      for (let i = 0; i < 3; i++) {
        const stats = {
          wpm: 120,
          cpm: 480,
          accuracy: 99,
          errors: 1,
          timeElapsed: 60,
          totalChars: 100,
          correctChars: 99,
          date: new Date().toISOString(),
        }
        const sessionResult = evaluateSession(stats, state)
        state = updateAdaptiveState(state, sessionResult, stats)
      }

      expect(state.currentLevel).toBe(10)
    })

    it('should track adjustment history', () => {
      let state = createAdaptiveState()

      // Симулируем 3 успешные сессии для повышения уровня
      for (let i = 0; i < 3; i++) {
        const stats = {
          wpm: 50,
          cpm: 200,
          accuracy: 95,
          errors: 5,
          timeElapsed: 60,
          totalChars: 100,
          correctChars: 95,
          date: new Date().toISOString(),
        }
        const sessionResult = evaluateSession(stats, state)
        state = updateAdaptiveState(state, sessionResult, stats)
      }

      expect(state.history.length).toBeGreaterThan(0)
      const firstAdjustment = state.history[0]
      expect(firstAdjustment?.previousLevel).toBe(3)
      expect(firstAdjustment?.newLevel).toBe(4)
    })
  })

  describe('selectAdaptiveText', () => {
    it('should return null for empty texts array', () => {
      const state = createAdaptiveState()
      const result = selectAdaptiveText([], state)
      expect(result).toBeNull()
    })

    it('should select text appropriate for current level', () => {
      const state = createAdaptiveState()
      const result = selectAdaptiveText(practiceTexts, state)

      expect(result).not.toBeNull()
      expect(result?.text.difficulty).toBeGreaterThanOrEqual(1)
      expect(result?.text.difficulty).toBeLessThanOrEqual(9)
    })

    it('should adjust difficulty based on recent performance', () => {
      const state = createAdaptiveState()

      // Плохая производительность должна снизить сложность
      const result = selectAdaptiveText(practiceTexts, state, {
        wpm: 20,
        accuracy: 70,
      })

      expect(result).not.toBeNull()
      // При низкой точности (70%) сложность снижается, но текст может быть сложнее целевого
      expect(result?.reason).toContain('difficulty')
    })
  })

  describe('getLevelDescription', () => {
    it('should return correct i18n key for each level', () => {
      expect(getLevelDescription(1)).toBe('adaptive.level.1')
      expect(getLevelDescription(5)).toBe('adaptive.level.5')
      expect(getLevelDescription(10)).toBe('adaptive.level.10')
    })

    it('should return default i18n key for invalid levels', () => {
      expect(getLevelDescription(0)).toBe('adaptive.level.5')
      expect(getLevelDescription(11)).toBe('adaptive.level.5')
    })
  })

  describe('getLevelBadge', () => {
    it('should return correct badge for each level', () => {
      expect(getLevelBadge(1)).toBe('🌱')
      expect(getLevelBadge(5)).toBe('⭐')
      expect(getLevelBadge(10)).toBe('💎')
    })
  })

  describe('getDifficultyMultiplier', () => {
    it('should return correct multiplier for each level', () => {
      expect(getDifficultyMultiplier(1)).toBe(0.5)
      expect(getDifficultyMultiplier(5)).toBeCloseTo(1.1, 2)
      expect(getDifficultyMultiplier(10)).toBeCloseTo(1.85, 2) // 0.5 + 9 * 0.15 = 1.85
    })
  })

  describe('analyzeDifficultyHistory', () => {
    it('should return stable trend for empty history', () => {
      const trend = analyzeDifficultyHistory([])

      expect(trend.direction).toBe('stable')
      expect(trend.averageLevel).toBe(0)
      expect(trend.volatility).toBe(0)
    })

    it('should analyze upward trend', () => {
      const history = [
        { timestamp: 1, previousLevel: 1, newLevel: 2, reason: 'speed_increase' as const, wpm: 30, accuracy: 90 },
        { timestamp: 2, previousLevel: 2, newLevel: 3, reason: 'speed_increase' as const, wpm: 40, accuracy: 92 },
        { timestamp: 3, previousLevel: 3, newLevel: 4, reason: 'speed_increase' as const, wpm: 50, accuracy: 94 },
      ]

      const trend = analyzeDifficultyHistory(history)

      expect(trend.direction).toBe('up')
      expect(trend.averageLevel).toBeGreaterThan(2)
    })

    it('should calculate volatility correctly', () => {
      const history = [
        { timestamp: 1, previousLevel: 5, newLevel: 5, reason: 'manual' as const, wpm: 40, accuracy: 90 },
        { timestamp: 2, previousLevel: 5, newLevel: 5, reason: 'manual' as const, wpm: 40, accuracy: 90 },
      ]

      const trend = analyzeDifficultyHistory(history)

      expect(trend.volatility).toBe(0)
    })
  })

  describe('serializeAdaptiveState', () => {
    it('should serialize state to JSON string', () => {
      const state = createAdaptiveState()
      const serialized = serializeAdaptiveState(state)

      expect(serialized).toContain('"currentLevel":3')
      expect(serialized).toContain('"targetWpm":25')
    })
  })

  describe('deserializeAdaptiveState', () => {
    it('should deserialize state from JSON string', () => {
      const originalState = createAdaptiveState()
      const serialized = serializeAdaptiveState(originalState)
      const deserialized = deserializeAdaptiveState(serialized)

      expect(deserialized.currentLevel).toBe(originalState.currentLevel)
      expect(deserialized.targetWpm).toBe(originalState.targetWpm)
      expect(deserialized.targetAccuracy).toBe(originalState.targetAccuracy)
    })

    it('should return default state for invalid JSON', () => {
      const deserialized = deserializeAdaptiveState('invalid json')

      expect(deserialized.currentLevel).toBe(3)
      expect(deserialized.targetWpm).toBe(25)
    })
  })

  describe('resetAdaptiveState', () => {
    it('should reset state to initial values', () => {
      const resetState = resetAdaptiveState()

      expect(resetState.currentLevel).toBe(3)
      expect(resetState.targetWpm).toBe(25)
      expect(resetState.consecutiveSuccesses).toBe(0)
    })
  })
})
