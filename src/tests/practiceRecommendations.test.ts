import { describe, it, expect } from 'vitest'
import {
  generatePracticeRecommendations,
  getRecommendationsByCategory,
  getHighPriorityRecommendations,
} from '@utils/practiceRecommendations'
import type { TypingStats } from '../../types'

describe('Practice Recommendations Utils', () => {
  describe('generatePracticeRecommendations', () => {
    it('should return beginner recommendations for empty stats', () => {
      const recommendations = generatePracticeRecommendations([], {}, 0, 0)

      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0].category).toBe('general')
    })

    it('should recommend speed improvement for low WPM', () => {
      const stats: TypingStats[] = [
        {
          wpm: 15,
          cpm: 75,
          accuracy: 90,
          correctChars: 90,
          incorrectChars: 10,
          totalChars: 100,
          timeElapsed: 60,
          errors: 10,
        },
      ]

      const recommendations = generatePracticeRecommendations(
        stats,
        {},
        15,
        90
      )

      expect(recommendations.some(r => r.category === 'speed')).toBe(true)
    })

    it('should recommend accuracy improvement for low accuracy', () => {
      const stats: TypingStats[] = [
        {
          wpm: 40,
          cpm: 200,
          accuracy: 80,
          correctChars: 80,
          incorrectChars: 20,
          totalChars: 100,
          timeElapsed: 60,
          errors: 20,
        },
      ]

      const recommendations = generatePracticeRecommendations(
        stats,
        {},
        40,
        80
      )

      expect(recommendations.some(r => r.category === 'accuracy')).toBe(true)
    })

    it('should recommend key practice for weak keys', () => {
      const heatmap = {
        a: { errors: 20, total: 100, accuracy: 80 },
        s: { errors: 15, total: 100, accuracy: 85 },
        d: { errors: 10, total: 100, accuracy: 90 },
      }

      const stats: TypingStats[] = [
        {
          wpm: 40,
          cpm: 200,
          accuracy: 90,
          correctChars: 90,
          incorrectChars: 10,
          totalChars: 100,
          timeElapsed: 60,
          errors: 10,
        },
      ]

      const recommendations = generatePracticeRecommendations(
        stats,
        heatmap,
        40,
        90
      )

      expect(recommendations.some(r => r.category === 'keys')).toBe(true)
    })

    it('should limit recommendations to 5', () => {
      const stats: TypingStats[] = Array.from({ length: 20 }, (_, i) => ({
        wpm: 20 + i,
        cpm: 100 + i * 5,
        accuracy: 85,
        correctChars: 85,
        incorrectChars: 15,
        totalChars: 100,
        timeElapsed: 60,
        errors: 15,
      }))

      const recommendations = generatePracticeRecommendations(
        stats,
        {},
        40,
        85
      )

      expect(recommendations.length).toBeLessThanOrEqual(5)
    })

    it('should prioritize high priority recommendations', () => {
      const stats: TypingStats[] = [
        {
          wpm: 15,
          cpm: 75,
          accuracy: 80,
          correctChars: 80,
          incorrectChars: 20,
          totalChars: 100,
          timeElapsed: 60,
          errors: 20,
        },
      ]

      const recommendations = generatePracticeRecommendations(
        stats,
        {},
        15,
        80
      )

      // Первая рекомендация должна быть высокого приоритета
      expect(recommendations[0].priority).toBe('high')
    })
  })

  describe('getRecommendationsByCategory', () => {
    it('should filter recommendations by category', () => {
      const recommendations = generatePracticeRecommendations([], {}, 0, 0)
      const generalRecs = getRecommendationsByCategory(recommendations, 'general')

      expect(generalRecs.every(r => r.category === 'general')).toBe(true)
    })
  })

  describe('getHighPriorityRecommendations', () => {
    it('should return only high priority recommendations', () => {
      const recommendations = generatePracticeRecommendations([], {}, 0, 0)
      const highPriority = getHighPriorityRecommendations(recommendations)

      expect(highPriority.every(r => r.priority === 'high')).toBe(true)
    })
  })
})
