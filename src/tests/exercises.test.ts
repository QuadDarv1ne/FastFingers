import { describe, it, expect } from 'vitest'
import { exercises, getRandomExercise, generatePracticeText } from '../utils/exercises'

describe('exercises utils', () => {
  describe('exercises array', () => {
    it('должен содержать упражнения', () => {
      expect(exercises.length).toBeGreaterThan(0)
    })

    it('все упражнения должны иметь обязательные поля', () => {
      exercises.forEach(exercise => {
        expect(exercise).toHaveProperty('id')
        expect(exercise).toHaveProperty('title')
        expect(exercise).toHaveProperty('description')
        expect(exercise).toHaveProperty('text')
        expect(exercise).toHaveProperty('difficulty')
        expect(exercise).toHaveProperty('category')
        expect(exercise).toHaveProperty('focusKeys')
      })
    })

    it('все упражнения должны иметь валидные категории', () => {
      const validCategories = ['basic', 'upper', 'lower', 'words', 'sentences', 'pangrams', 'code']
      exercises.forEach(exercise => {
        expect(validCategories).toContain(exercise.category)
      })
    })

    it('сложность должна быть от 1 до 10', () => {
      exercises.forEach(exercise => {
        expect(exercise.difficulty).toBeGreaterThanOrEqual(1)
        expect(exercise.difficulty).toBeLessThanOrEqual(10)
      })
    })
  })

  describe('getRandomExercise', () => {
    it('должен возвращать случайное упражнение', () => {
      const exercise = getRandomExercise()
      expect(exercise).toBeDefined()
      expect(exercise.id).toBeDefined()
    })

    it('должен фильтровать по категории', () => {
      const exercise = getRandomExercise('basic')
      expect(exercise.category).toBe('basic')
    })

    it('должен фильтровать по сложности', () => {
      const exercise = getRandomExercise(undefined, 3)
      expect(exercise.difficulty).toBeLessThanOrEqual(3)
    })

    it('должен возвращать упражнение при несуществующей категории', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exercise = getRandomExercise('nonexistent' as any)
      expect(exercise).toBeDefined()
    })
  })

  describe('generatePracticeText', () => {
    it('должен генерировать текст с указанным количеством слов', () => {
      const text = generatePracticeText(10, 3)
      const words = text.split(' ')
      
      expect(words.length).toBe(10)
    })

    it('должен генерировать простые слова для низкой сложности', () => {
      const text = generatePracticeText(5, 2)
      
      expect(text.length).toBeLessThan(100)
    })

    it('должен генерировать сложные слова для высокой сложности', () => {
      const text = generatePracticeText(50, 8)
      
      // Проверяем что средняя длина слова больше при высокой сложности
      const words = text.split(' ')
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
      
      // При высокой сложности средняя длина должна быть больше 4
      expect(avgWordLength).toBeGreaterThan(4)
    })

    it('должен возвращать пустую строку при 0 слов', () => {
      const text = generatePracticeText(0, 5)
      
      expect(text).toBe('')
    })
  })
})
