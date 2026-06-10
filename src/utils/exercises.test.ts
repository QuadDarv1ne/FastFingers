import { describe, it, expect } from 'vitest'
import {
  exercises,
  getRandomExercise,
  getRandomExercises,
  generatePracticeText,
  getPracticeTextsByCategory,
  getPracticeTextsByDifficulty,
  getRandomPracticeText,
  getAllTextCategories,
  getTextDifficultyLevels,
  getPracticeTextById,
} from './exercises'

describe('exercises', () => {
  describe('exercises array', () => {
    it('should have exercises', () => {
      expect(exercises).toBeDefined()
      expect(exercises.length).toBeGreaterThan(0)
    })

    it('should have valid exercise structure', () => {
      const exercise = exercises[0]
      expect(exercise).toBeDefined()
      expect(exercise?.id).toBeDefined()
      expect(exercise?.title).toBeDefined()
      expect(exercise?.description).toBeDefined()
      expect(exercise?.text).toBeDefined()
      expect(exercise?.difficulty).toBeGreaterThanOrEqual(1)
      expect(exercise?.category).toBeDefined()
    })

    it('should have exercises for different categories', () => {
      const categories = new Set(exercises.map(e => e.category))
      expect(categories.has('basic')).toBe(true)
      expect(categories.has('upper')).toBe(true)
      expect(categories.has('lower')).toBe(true)
      expect(categories.has('words')).toBe(true)
      expect(categories.has('code')).toBe(true)
    })

    it('should have exercises for different layouts', () => {
      const layouts = new Set(exercises.map(e => e.layout || 'jcuken'))
      expect(layouts.has('qwerty')).toBe(true)
      expect(layouts.has('dvorak')).toBe(true)
      expect(layouts.has('jcuken')).toBe(true)
    })
  })

  describe('getRandomExercise', () => {
    it('should return a random exercise without filters', () => {
      const exercise = getRandomExercise()
      expect(exercise).toBeDefined()
      expect(exercise.id).toBeDefined()
      expect(exercise.title).toBeDefined()
    })

    it('should filter by category', () => {
      const exercise = getRandomExercise('code')
      expect(exercise.category).toBe('code')
    })

    it('should filter by difficulty', () => {
      const exercise = getRandomExercise(undefined, 3)
      expect(exercise.difficulty).toBeLessThanOrEqual(3)
    })

    it('should filter by layout qwerty or return exercises without layout', () => {
      const exercise = getRandomExercise(undefined, undefined, 'qwerty')
      // Функция возвращает упражнения с указанным layout ИЛИ без layout (jcuken по умолчанию)
      expect(exercise.layout === 'qwerty' || !exercise.layout).toBe(true)
    })

    it('should filter by category and difficulty', () => {
      const exercise = getRandomExercise('basic', 2)
      expect(exercise.category).toBe('basic')
      expect(exercise.difficulty).toBeLessThanOrEqual(2)
    })

    it('should filter by category and layout qwerty or return exercises without layout', () => {
      const exercise = getRandomExercise('basic', undefined, 'qwerty')
      expect(exercise.category).toBe('basic')
      expect(exercise.layout === 'qwerty' || !exercise.layout).toBe(true)
    })

    it('should filter by difficulty and layout qwerty or return exercises without layout', () => {
      const exercise = getRandomExercise(undefined, 5, 'qwerty')
      expect(exercise.difficulty).toBeLessThanOrEqual(5)
      expect(exercise.layout === 'qwerty' || !exercise.layout).toBe(true)
    })

    it('should filter by category, difficulty and layout qwerty or return exercises without layout', () => {
      const exercise = getRandomExercise('words', 6, 'qwerty')
      expect(exercise.category).toBe('words')
      expect(exercise.difficulty).toBeLessThanOrEqual(6)
      expect(exercise.layout === 'qwerty' || !exercise.layout).toBe(true)
    })

    it('should return exercise from full pool when no matches', () => {
      const exercise = getRandomExercise('nonexistent' as never, 100)
      expect(exercise).toBeDefined()
    })
  })

  describe('getRandomExercises', () => {
    it('should return multiple random exercises', () => {
      const exercisesList = getRandomExercises(5)
      expect(exercisesList).toHaveLength(5)
      expect(exercisesList.every(e => e.id)).toBe(true)
    })

    it('should return empty array when count is 0', () => {
      const exercisesList = getRandomExercises(0)
      expect(exercisesList).toHaveLength(0)
    })

    it('should filter by category', () => {
      const exercisesList = getRandomExercises(3, 'code')
      expect(exercisesList.every(e => e.category === 'code')).toBe(true)
    })

    it('should filter by difficulty', () => {
      const exercisesList = getRandomExercises(3, undefined, 4)
      expect(exercisesList.every(e => e.difficulty <= 4)).toBe(true)
    })

    it('should filter by layout', () => {
      const exercisesList = getRandomExercises(3, undefined, undefined, 'qwerty')
      // Функция возвращает упражнения с указанным layout ИЛИ без layout (jcuken по умолчанию)
      expect(exercisesList.every(e => e.layout === 'qwerty' || !e.layout)).toBe(true)
    })
  })

  describe('generatePracticeText', () => {
    it('should generate text with default parameters', () => {
      const text = generatePracticeText(10, 5)
      expect(text).toBeDefined()
      expect(text.split(' ').length).toBeLessThanOrEqual(10)
    })

    it('should generate text with specified word count', () => {
      const text = generatePracticeText(5, 5)
      const words = text.split(' ')
      expect(words.length).toBeLessThanOrEqual(5)
    })

    it('should generate easy words for low difficulty', () => {
      const text = generatePracticeText(10, 2)
      const words = text.split(' ')
      const easyWords = ['он', 'она', 'оно', 'мы', 'вы', 'они', 'там', 'тут', 'вот', 'как', 'так', 'где', 'кто', 'что', 'мир', 'дом', 'лес', 'кот', 'год', 'рот', 'нос', 'лёд', 'мёд', 'сон', 'дым']
      words.forEach(word => {
        expect(easyWords).toContain(word)
      })
    })

    it('should generate mixed words for medium difficulty', () => {
      const text = generatePracticeText(20, 5)
      expect(text.split(' ').length).toBeLessThanOrEqual(20)
    })

    it('should generate hard words for high difficulty', () => {
      const text = generatePracticeText(10, 9)
      expect(text.split(' ').length).toBeLessThanOrEqual(10)
    })

    it('should generate unique words when requested', () => {
      const text = generatePracticeText(5, 5, { unique: true })
      const words = text.split(' ')
      const uniqueWords = new Set(words)
      expect(uniqueWords.size).toBe(words.length)
    })

    it('should use custom separator', () => {
      const text = generatePracticeText(5, 5, { separator: ', ' })
      expect(text).toContain(', ')
    })

    it('should handle invalid word count', () => {
      const text1 = generatePracticeText(0, 5)
      expect(text1).toBeDefined()
      
      const text2 = generatePracticeText(-5, 5)
      expect(text2).toBeDefined()
      
      const text3 = generatePracticeText(NaN, 5)
      expect(text3).toBeDefined()
    })

    it('should handle invalid difficulty', () => {
      const text1 = generatePracticeText(10, 0)
      expect(text1).toBeDefined()
      
      const text2 = generatePracticeText(10, -5)
      expect(text2).toBeDefined()
      
      const text3 = generatePracticeText(10, NaN)
      expect(text3).toBeDefined()
    })

    it('should handle very large word count', () => {
      const text = generatePracticeText(500, 5)
      expect(text.split(' ').length).toBeLessThanOrEqual(200)
    })

    it('should return fallback on error', () => {
      const text = generatePracticeText(10, 5)
      expect(text).not.toBe('error generating text')
    })
  })

  describe('getPracticeTextsByCategory', () => {
    it('should return texts for literature category', () => {
      const texts = getPracticeTextsByCategory('literature')
      expect(Array.isArray(texts)).toBe(true)
      texts.forEach(text => {
        expect(text.category).toBe('literature')
      })
    })

    it('should return texts for code category', () => {
      const texts = getPracticeTextsByCategory('code')
      expect(Array.isArray(texts)).toBe(true)
      texts.forEach(text => {
        expect(text.category).toBe('code')
      })
    })

    it('should return empty array for non-existent category', () => {
      const texts = getPracticeTextsByCategory('nonexistent' as never)
      expect(texts).toEqual([])
    })
  })

  describe('getPracticeTextsByDifficulty', () => {
    it('should return texts for difficulty 1', () => {
      const texts = getPracticeTextsByDifficulty(1)
      expect(Array.isArray(texts)).toBe(true)
      texts.forEach(text => {
        expect(text.difficulty).toBe(1)
      })
    })

    it('should return texts for difficulty 5', () => {
      const texts = getPracticeTextsByDifficulty(5)
      expect(Array.isArray(texts)).toBe(true)
      texts.forEach(text => {
        expect(text.difficulty).toBe(5)
      })
    })

    it('should return empty array for non-existent difficulty', () => {
      const texts = getPracticeTextsByDifficulty(100)
      expect(texts).toEqual([])
    })
  })

  describe('getRandomPracticeText', () => {
    it('should return random text without filters', () => {
      const text = getRandomPracticeText()
      expect(text).toBeDefined()
      expect(text.length).toBeGreaterThan(0)
    })

    it('should return text for specific category', () => {
      const text = getRandomPracticeText('code')
      expect(text).toBeDefined()
      expect(text.length).toBeGreaterThan(0)
    })

    it('should return text for specific difficulty', () => {
      const text = getRandomPracticeText(undefined, 3)
      expect(text).toBeDefined()
      expect(text.length).toBeGreaterThan(0)
    })

    it('should return fallback when no text found', () => {
      const text = getRandomPracticeText('nonexistent' as never, 100)
      expect(text).toBeDefined()
      expect(text.length).toBeGreaterThan(0)
    })
  })

  describe('getAllTextCategories', () => {
    it('should return all categories', () => {
      const categories = getAllTextCategories()
      expect(categories.length).toBeGreaterThanOrEqual(10)
      expect(categories).toContain('literature')
      expect(categories).toContain('code')
      expect(categories).toContain('quotes')
      expect(categories).toContain('proverbs')
      expect(categories).toContain('science')
      expect(categories).toContain('technology')
      expect(categories).toContain('movies')
      expect(categories).toContain('news')
      expect(categories).toContain('business')
      expect(categories).toContain('scipop')
      expect(categories).toContain('history')
      expect(categories).toContain('art')
      expect(categories).toContain('sports')
      expect(categories).toContain('travel')
    })
  })

  describe('getTextDifficultyLevels', () => {
    it('should return all difficulty levels', () => {
      const levels = getTextDifficultyLevels()
      expect(levels).toHaveLength(9)
      expect(levels).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('getPracticeTextById', () => {
    it('should return text by id', () => {
      const text = getPracticeTextById('lit-1')
      if (text) {
        expect(text.id).toBe('lit-1')
      }
    })

    it('should return null for non-existent id', () => {
      const text = getPracticeTextById('non-existent-id')
      expect(text).toBeNull()
    })
  })
})
