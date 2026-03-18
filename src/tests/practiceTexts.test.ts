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

  it('должен содержать 59-60 текстов', () => {
    expect(practiceTexts.length).toBeGreaterThanOrEqual(59)
    expect(practiceTexts.length).toBeLessThanOrEqual(60)
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

  it('должен содержать все 10 категорий', () => {
    const categories = new Set(practiceTexts.map((t: PracticeText) => t.category))
    expect(categories).toEqual(
      new Set<TextCategory>([
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
      ])
    )
  })

  it('должен иметь по 4+ текстов в каждой категории', () => {
    const categoryCount = new Map<TextCategory, number>()
    
    practiceTexts.forEach((text: PracticeText) => {
      categoryCount.set(text.category, (categoryCount.get(text.category) || 0) + 1)
    })

    expect(categoryCount.size).toBe(10)
    // Некоторые категории имеют больше текстов
    categoryCount.forEach((count) => {
      expect(count).toBeGreaterThanOrEqual(4)
    })
  })

  describe('категория literature', () => {
    const literatureTexts = practiceTexts.filter((t: PracticeText) => t.category === 'literature')

    it('должен содержать тексты по литературе', () => {
      expect(literatureTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать тексты из русской классики', () => {
      const titles = literatureTexts.map((t: PracticeText) => t.title)
      expect(titles.some(title => title.includes('Пушкин'))).toBe(true)
      expect(titles.some(title => title.includes('Толстой'))).toBe(true)
      expect(titles.some(title => title.includes('Достоевский'))).toBe(true)
    })

    it('должен иметь разную сложность (1-10)', () => {
      const difficulties = literatureTexts.map((t: PracticeText) => t.difficulty)
      expect(Math.min(...difficulties)).toBeLessThanOrEqual(3)
      expect(Math.max(...difficulties)).toBeGreaterThanOrEqual(7)
    })
  })

  describe('категория code', () => {
    const codeTexts = practiceTexts.filter((t: PracticeText) => t.category === 'code')

    it('должен содержать тексты с кодом', () => {
      expect(codeTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать код на разных языках', () => {
      const texts = codeTexts.map((t: PracticeText) => t.text)
      const allTexts = texts.join(' ')
      expect(allTexts).toMatch(/[{}();\[\]]/)
    })
  })

  describe('категория quotes', () => {
    const quotesTexts = practiceTexts.filter((t: PracticeText) => t.category === 'quotes')

    it('должен содержать цитаты', () => {
      expect(quotesTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать цитаты известных людей', () => {
      const titles = quotesTexts.map((t: PracticeText) => t.title)
      expect(titles.some(title => title.includes('Эйнштейн'))).toBe(true)
      expect(titles.some(title => title.includes('Твен'))).toBe(true)
    })
  })

  describe('категория proverbs', () => {
    const proverbsTexts = practiceTexts.filter((t: PracticeText) => t.category === 'proverbs')

    it('должен содержать пословицы', () => {
      expect(proverbsTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать русские пословицы', () => {
      const texts = proverbsTexts.map((t: PracticeText) => t.text)
      expect(texts.join(' ').length).toBeGreaterThan(50)
    })
  })

  describe('категория science', () => {
    const scienceTexts = practiceTexts.filter((t: PracticeText) => t.category === 'science')

    it('должен содержать научные тексты', () => {
      expect(scienceTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать тексты о науке', () => {
      const texts = scienceTexts.map((t: PracticeText) => t.text)
      expect(texts.join(' ').length).toBeGreaterThan(100)
    })
  })

  describe('категория technology', () => {
    const technologyTexts = practiceTexts.filter((t: PracticeText) => t.category === 'technology')

    it('должен содержать тексты о технологиях', () => {
      expect(technologyTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать тексты о современных технологиях', () => {
      const texts = technologyTexts.map((t: PracticeText) => t.text)
      expect(texts.join(' ').length).toBeGreaterThan(100)
    })
  })

  describe('категория movies', () => {
    const moviesTexts = practiceTexts.filter((t: PracticeText) => t.category === 'movies')

    it('должен содержать тексты о фильмах', () => {
      expect(moviesTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать цитаты из фильмов', () => {
      const titles = moviesTexts.map((t: PracticeText) => t.title)
      expect(titles.some(title => title.includes('Крёстный отец'))).toBe(true)
      expect(titles.some(title => title.includes('Матрица'))).toBe(true)
    })
  })

  describe('категория news', () => {
    const newsTexts = practiceTexts.filter((t: PracticeText) => t.category === 'news')

    it('должен содержать новостные тексты', () => {
      expect(newsTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать тексты в новостном стиле', () => {
      const texts = newsTexts.map((t: PracticeText) => t.text)
      const allTexts = texts.join(' ').toLowerCase()
      expect(allTexts.length).toBeGreaterThan(100)
    })
  })

  describe('категория philosophy', () => {
    const philosophyTexts = practiceTexts.filter((t: PracticeText) => t.category === 'philosophy')

    it('должен содержать философские тексты', () => {
      expect(philosophyTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать тексты философов', () => {
      const titles = philosophyTexts.map((t: PracticeText) => t.title)
      expect(titles.some(title => title.includes('Ницше'))).toBe(true)
      expect(titles.some(title => title.includes('Сократ'))).toBe(true)
    })
  })

  describe('категория business', () => {
    const businessTexts = practiceTexts.filter((t: PracticeText) => t.category === 'business')

    it('должен содержать бизнес тексты', () => {
      expect(businessTexts.length).toBeGreaterThan(0)
    })

    it('должен содержать тексты о бизнесе', () => {
      const texts = businessTexts.map((t: PracticeText) => t.text)
      const allTexts = texts.join(' ').toLowerCase()
      expect(allTexts).toMatch(/(бизнес|компания|рынок|инвестиции)/)
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
      expect(texts.every(t => t.category === 'literature')).toBe(true)
    })

    it('должен возвращать пустой массив для несуществующей категории', () => {
      const texts = getTextsByCategory('nonexistent' as TextCategory)
      expect(texts).toHaveLength(0)
    })
  })

  describe('getTextsByDifficulty', () => {
    it('должен возвращать тексты по сложности', () => {
      const texts = getTextsByDifficulty(5)
      expect(texts.length).toBeGreaterThan(0)
      expect(texts.every(t => t.difficulty === 5)).toBe(true)
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
      expect(text).not.toBeNull()
      expect(text?.difficulty).toBe(3)
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
      expect(categories).toHaveLength(10)
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
