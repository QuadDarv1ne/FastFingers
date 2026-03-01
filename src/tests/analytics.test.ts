import { describe, it, expect } from 'vitest'
import {
  calculateTrend,
  calculateConsistency,
  calculateImprovementRate,
  analyzeKeyPerformance,
  generateRecommendations,
  analyzeTypingProgress,
} from '@utils/analytics'
import { TypingStats } from '@/types'

describe('Analytics Utils', () => {
  describe('calculateTrend', () => {
    it('should detect upward trend', () => {
      const trend = calculateTrend(100, 80)
      expect(trend.direction).toBe('up')
      expect(trend.percentage).toBe(25)
    })

    it('should detect downward trend', () => {
      const trend = calculateTrend(80, 100)
      expect(trend.direction).toBe('down')
      expect(trend.percentage).toBe(20)
    })

    it('should detect stable trend', () => {
      const trend = calculateTrend(100, 99)
      expect(trend.direction).toBe('stable')
    })

    it('should handle zero previous value', () => {
      const trend = calculateTrend(100, 0)
      expect(trend.direction).toBe('stable')
      expect(trend.percentage).toBe(0)
    })
  })

  describe('calculateConsistency', () => {
    it('should return 100 for single stat', () => {
      const stats: TypingStats[] = [
        {
          wpm: 50,
          cpm: 250,
          accuracy: 95,
          correctChars: 100,
          errors: 5,
          totalChars: 105,
          timeElapsed: 60,
        },
      ]
      expect(calculateConsistency(stats)).toBe(100)
    })

    it('should calculate consistency for multiple stats', () => {
      const stats: TypingStats[] = [
        {
          wpm: 50,
          cpm: 250,
          accuracy: 95,
          correctChars: 100,
          errors: 5,
          totalChars: 105,
          timeElapsed: 60,
        },
        {
          wpm: 52,
          cpm: 260,
          accuracy: 96,
          correctChars: 104,
          errors: 4,
          totalChars: 108,
          timeElapsed: 60,
        },
        {
          wpm: 48,
          cpm: 240,
          accuracy: 94,
          correctChars: 96,
          errors: 6,
          totalChars: 102,
          timeElapsed: 60,
        },
      ]
      const consistency = calculateConsistency(stats)
      expect(consistency).toBeGreaterThan(0)
      expect(consistency).toBeLessThanOrEqual(100)
    })
  })

  describe('calculateImprovementRate', () => {
    it('should return 0 for insufficient data', () => {
      const stats: TypingStats[] = [
        {
          wpm: 50,
          cpm: 250,
          accuracy: 95,
          correctChars: 100,
          errors: 5,
          totalChars: 105,
          timeElapsed: 60,
        },
      ]
      expect(calculateImprovementRate(stats)).toBe(0)
    })

    it('should calculate positive improvement rate', () => {
      const stats: TypingStats[] = Array.from({ length: 10 }, (_, i) => ({
        wpm: 50 + i * 2,
        cpm: 250 + i * 10,
        accuracy: 95,
        correctChars: 100,
        errors: 5,
        totalChars: 105,
        timeElapsed: 60,
      }))
      const rate = calculateImprovementRate(stats)
      expect(rate).toBeGreaterThan(0)
    })

    it('should calculate negative improvement rate', () => {
      const stats: TypingStats[] = Array.from({ length: 10 }, (_, i) => ({
        wpm: 70 - i * 2,
        cpm: 350 - i * 10,
        accuracy: 95,
        correctChars: 100,
        errors: 5,
        totalChars: 105,
        timeElapsed: 60,
      }))
      const rate = calculateImprovementRate(stats)
      expect(rate).toBeLessThan(0)
    })
  })

  describe('analyzeKeyPerformance', () => {
    it('should identify weakest and strongest keys', () => {
      const heatmap = {
        a: { errors: 10, total: 100, accuracy: 90 },
        b: { errors: 2, total: 100, accuracy: 98 },
        c: { errors: 15, total: 100, accuracy: 85 },
        d: { errors: 1, total: 100, accuracy: 99 },
        e: { errors: 20, total: 100, accuracy: 80 },
        f: { errors: 3, total: 100, accuracy: 97 },
      }

      const result = analyzeKeyPerformance(heatmap)
      expect(result.weakest).toContain('e')
      expect(result.strongest).toContain('d')
    })

    it('should filter out keys with insufficient data', () => {
      const heatmap = {
        a: { errors: 1, total: 3, accuracy: 67 },
        b: { errors: 2, total: 100, accuracy: 98 },
      }

      const result = analyzeKeyPerformance(heatmap)
      expect(result.weakest).not.toContain('a')
    })
  })

  describe('generateRecommendations', () => {
    it('should generate recommendations for declining WPM', () => {
      const analytics = {
        wpmTrend: {
          direction: 'down' as const,
          percentage: 10,
          description: 'Снижение',
        },
      }
      const stats: TypingStats[] = []

      const recommendations = generateRecommendations(analytics, stats)
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(r => r.includes('снизилась'))).toBe(true)
    })

    it('should generate recommendations for low accuracy', () => {
      const stats: TypingStats[] = Array.from({ length: 5 }, () => ({
        wpm: 50,
        cpm: 250,
        accuracy: 85,
        correctChars: 85,
        errors: 15,
        totalChars: 100,
        timeElapsed: 60,
      }))

      const recommendations = generateRecommendations({}, stats)
      expect(recommendations.some(r => r.includes('точности'))).toBe(true)
    })

    it('should generate recommendations for weak keys', () => {
      const analytics = {
        weakestKeys: ['a', 'b', 'c'],
      }

      const recommendations = generateRecommendations(analytics, [])
      expect(recommendations.some(r => r.includes('Проблемные клавиши'))).toBe(
        true
      )
    })
  })

  describe('analyzeTypingProgress', () => {
    it('should return default analytics for empty stats', () => {
      const analytics = analyzeTypingProgress([], {})
      expect(analytics.wpmTrend.direction).toBe('stable')
      expect(analytics.recommendations.length).toBeGreaterThan(0)
    })

    it('should analyze complete typing progress', () => {
      const stats: TypingStats[] = Array.from({ length: 20 }, (_, i) => ({
        wpm: 50 + i,
        cpm: 250 + i * 5,
        accuracy: 95,
        correctChars: 100,
        errors: 5,
        totalChars: 105,
        timeElapsed: 60,
      }))

      const heatmap = {
        a: { errors: 10, total: 100, accuracy: 90 },
        b: { errors: 2, total: 100, accuracy: 98 },
      }

      const analytics = analyzeTypingProgress(stats, heatmap)
      expect(analytics.wpmTrend).toBeDefined()
      expect(analytics.accuracyTrend).toBeDefined()
      expect(analytics.consistencyScore).toBeGreaterThanOrEqual(0)
      expect(analytics.improvementRate).toBeGreaterThan(0)
      expect(analytics.recommendations.length).toBeGreaterThan(0)
    })
  })
})
