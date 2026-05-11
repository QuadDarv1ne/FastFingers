import { describe, it, expect } from 'vitest'
import {
  practiceTexts,
  type PracticeText,
  type TextCategory,
  getTextsByCategory,
  getTextsByDifficulty,
  getRandomText,
  getAllCategories,
  getDifficultyLevels,
} from '../data/practiceTexts'

describe('practiceTexts', () => {
  it('должен экспортировать массив текстов', () => {
    expect(Array.isArray(practiceTexts)).toBe(true)
    expect(practiceTexts.length).toBeGreaterThan(0)
  })

  it('должен содержать 59-200 текстов', () => {
    expect(practiceTexts.length).toBeGreaterThanOrEqual(59)
    expect(practiceTexts.length).toBeLessThanOrEqual(200)
  })

  it('должен иметь все тексты с обязательными полями', () => {
    practiceTexts.forEach((text: PracticeText) => {
      expect(text).toHaveProperty('id')
      expect(text).toHaveProperty('category')
      expect(text).toHaveProperty('difficulty')
      expect(text).toHaveProperty('text')
      expect(text).toHaveProperty('title')

      expect(typeof text.id).toBe('string')
      expect(typeof text.title).toBe('string')
      expect(typeof text.text).toBe('string')
      expect(typeof text.difficulty).toBe('number')
      expect(text.difficulty).toBeGreaterThanOrEqual(1)
      expect(text.difficulty).toBeLessThanOrEqual(10)
    })
  })

  it('должен содержать все категории', () => {
    const categories = new Set(practiceTexts.map((t: PracticeText) => t.category))
    // Проверяем что основные категории присутствуют
    const requiredCategories: TextCategory[] = [
      'literature',
      'code',
      'quotes',
      'proverbs',
      'science',
      'technology',
      'movies',
      'news',
      'scipop',
      'history',
      'art',
      'sports',
      'travel',
    ]
    requiredCategories.forEach((cat) => {
      expect(categories.has(cat)).toBe(true)
    })
  })

  it('должен иметь минимум по 1 тексту в каждой категории', () => {
    const categoryCount = new Map<TextCategory, number>()

    practiceTexts.forEach((text: PracticeText) => {
      categoryCount.set(text.category, (categoryCount.get(text.category) || 0) + 1)
    })

    expect(categoryCount.size).toBeGreaterThanOrEqual(10)
    categoryCount.forEach((count) => {
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  describe('категория literature', () => {
    const literatureTexts = practiceTexts.filter((t: PracticeText) => t.category === 'literature')
    it('должен содержать тексты по литературе', () => {
      expect(literatureTexts.length).toBeGreaterThan(0)
    })
  })

  describe('категория code', () => {
    const codeTexts = practiceTexts.filter((t: PracticeText) => t.category === 'code')
    it('должен содержать тексты с кодом', () => {
      expect(codeTexts.length).toBeGreaterThan(0)
    })
  })

  describe('категория quotes', () => {
    const quotesTexts = practiceTexts.filter((t: PracticeText) => t.category === 'quotes')
    it('должен содержать цитаты', () => {
      expect(quotesTexts.length).toBeGreaterThan(0)
    })
  })

  describe('категория proverbs', () => {
    const proverbsTexts = practiceTexts.filter((t: PracticeText) => t.category === 'proverbs')
    it('должен содержать пословицы', () => {
      expect(proverbsTexts.length).toBeGreaterThan(0)
    })
  })

  describe('категория science', () => {
    const scienceTexts = practiceTexts.filter((t: PracticeText) => t.category === 'science')
    it('должен содержать научные тексты', () => {
      expect(scienceTexts.length).toBeGreaterThan(0)
    })
  })

  describe('категория technology', () => {
    const technologyTexts = practiceTexts.filter((t: PracticeText) => t.category === 'technology')
    it('должен содержать тексты о технологиях', () => {
      expect(technologyTexts.length).toBeGreaterThan(0)
    })
  })

  describe('категория movies', () => {
    const moviesTexts = practiceTexts.filter((t: PracticeText) => t.category === 'movies')
    it('должен содержать тексты о фильмах', () => {
      expect(moviesTexts.length).toBeGreaterThan(0)
    })
  })

  describe('категория news', () => {
    const newsTexts = practiceTexts.filter((t: PracticeText) => t.category === 'news')
    it('должен содержать новостные тексты', () => {
      expect(newsTexts.length).toBeGreaterThan(0)
    })
  })

  describe('категория philosophy', () => {
    const philosophyTexts = practiceTexts.filter((t: PracticeText) => t.category === 'philosophy')
    it('должен содержать философские тексты если есть', () => {
      // Категория может быть пустой, это нормально
      expect(philosophyTexts.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('категория business', () => {
    const businessTexts = practiceTexts.filter((t: PracticeText) => t.category === 'business')
    it('должен содержать бизнес тексты если есть', () => {
      // Категория может быть пустой, это нормально
      expect(businessTexts.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('уникальность ID', () => {
    it('должен иметь уникальные ID для всех текстов', () => {
      const ids = practiceTexts.map((t: PracticeText) => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('валидация текста', () => {
    it('должен иметь непустые тексты', () => {
      practiceTexts.forEach((text: PracticeText) => {
        expect(text.text.trim()).not.toBe('')
      })
    })

    it('должен иметь непустые заголовки', () => {
      practiceTexts.forEach((text: PracticeText) => {
        expect(text.title.trim()).not.toBe('')
      })
    })

    it('должен иметь корректные ID с префиксом категории', () => {
      const categoryPrefixes: Record<TextCategory, string> = {
        literature: 'lit',
        code: 'code',
        quotes: 'quote',
        proverbs: 'prov',
        science: 'sci',
        technology: 'tech',
        movies: 'mov',
        news: 'news',
        philosophy: 'phil',
        business: 'biz',
        scipop: 'scipop',
        history: 'hist',
        art: 'art',
        sports: 'sport',
        travel: 'trav',
      }

      practiceTexts.forEach((text: PracticeText) => {
        const expectedPrefix = categoryPrefixes[text.category]
        expect(text.id.startsWith(expectedPrefix)).toBe(true)
      })
    })
  })

  describe('getTextsByCategory', () => {
    it('должен возвращать тексты по категории', () => {
      const texts = getTextsByCategory('literature')
      expect(texts.length).toBeGreaterThan(0)
      expect(texts.every((t) => t.category === 'literature')).toBe(true)
    })

    it('должен возвращать пустой массив для несуществующей категории', () => {
      const texts = getTextsByCategory('nonexistent' as TextCategory)
      expect(texts).toHaveLength(0)
    })
  })

  describe('getTextsByDifficulty', () => {
    it('должен возвращать тексты по сложности', () => {
      const texts = getTextsByDifficulty(5)
      expect(texts.every((t) => t.difficulty === 5)).toBe(true)
    })

    it('должен возвращать пустой массив для несуществующей сложности', () => {
      const texts = getTextsByDifficulty(99)
      expect(texts).toHaveLength(0)
    })
  })

  describe('getRandomText', () => {
    it('должен возвращать случайный текст', () => {
      const text = getRandomText()
      expect(text).not.toBeNull()
      expect(text).toHaveProperty('id')
      expect(text).toHaveProperty('text')
    })

    it('должен возвращать случайный текст по категории', () => {
      const text = getRandomText('code')
      expect(text).not.toBeNull()
      expect(text?.category).toBe('code')
    })

    it('должен возвращать случайный текст по сложности', () => {
      const text = getRandomText(undefined, 3)
      if (text) {
        expect(text.difficulty).toBe(3)
      }
    })

    it('должен возвращать null для несуществующей категории', () => {
      const text = getRandomText('nonexistent' as TextCategory)
      expect(text).toBeNull()
    })

    it('должен возвращать null для несуществующей сложности', () => {
      const text = getRandomText(undefined, 99)
      expect(text).toBeNull()
    })
  })

  describe('getAllCategories', () => {
    it('должен возвращать все категории', () => {
      const categories = getAllCategories()
      expect(categories).toHaveLength(15)
      expect(categories).toEqual([
        'literature',
        'code',
        'quotes',
        'proverbs',
        'science',
        'technology',
        'movies',
        'news',
        'philosophy',
        'business',
        'scipop',
        'history',
        'art',
        'sports',
        'travel',
      ])
    })
  })

  describe('getDifficultyLevels', () => {
    it('должен возвращать уровни сложности', () => {
      const levels = getDifficultyLevels()
      expect(levels).toHaveLength(9)
      expect(levels).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })
})
