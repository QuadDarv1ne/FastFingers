import { describe, it, expect } from 'vitest'
import { isLessonUnlocked, isLessonCompleted, lessons } from '../utils/lessons'

describe('lessons utils', () => {
  describe('isLessonUnlocked', () => {
    it('should unlock first lesson of each layout', () => {
      expect(isLessonUnlocked(1, [])).toBe(true)
      expect(isLessonUnlocked(101, [])).toBe(true)
      expect(isLessonUnlocked(201, [])).toBe(true)
    })

    it('should unlock lesson when previous is completed', () => {
      expect(isLessonUnlocked(2, [1])).toBe(true)
      expect(isLessonUnlocked(3, [1, 2])).toBe(true)
    })

    it('should not unlock lesson when previous is not completed', () => {
      expect(isLessonUnlocked(2, [])).toBe(false)
      expect(isLessonUnlocked(3, [1])).toBe(false)
    })
  })

  describe('isLessonCompleted', () => {
    const firstLesson = lessons.find(l => l.id === 1)
    if (!firstLesson) throw new Error('Test lesson not found')

    it('should return true when wpm and accuracy meet requirements', () => {
      const lesson = { ...firstLesson, minWpm: 10, minAccuracy: 90 }
      expect(isLessonCompleted(15, 95, lesson)).toBe(true)
    })

    it('should return false when wpm is below requirement', () => {
      const lesson = { ...firstLesson, minWpm: 10, minAccuracy: 90 }
      expect(isLessonCompleted(5, 95, lesson)).toBe(false)
    })

    it('should return false when accuracy is below requirement', () => {
      const lesson = { ...firstLesson, minWpm: 10, minAccuracy: 90 }
      expect(isLessonCompleted(15, 80, lesson)).toBe(false)
    })
  })
})
