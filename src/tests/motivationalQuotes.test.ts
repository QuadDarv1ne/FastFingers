import { describe, it, expect } from 'vitest'
import { QUOTES } from '@components/MotivationalQuote'

describe('Motivational Quotes', () => {
  it('should have at least 10 quotes', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(10)
  })

  it('should have valid quote structure', () => {
    QUOTES.forEach(quote => {
      expect(quote).toHaveProperty('textKey')
      expect(quote).toHaveProperty('authorKey')
      expect(quote).toHaveProperty('category')
      expect(quote.textKey.length).toBeGreaterThan(0)
      expect(quote.authorKey.length).toBeGreaterThan(0)
    })
  })

  it('should have valid categories', () => {
    const validCategories = ['motivation', 'practice', 'success', 'learning']
    QUOTES.forEach(quote => {
      expect(validCategories).toContain(quote.category)
    })
  })

  it('should have quotes in each category', () => {
    const categories = ['motivation', 'practice', 'success', 'learning']
    categories.forEach(category => {
      const quotesInCategory = QUOTES.filter(q => q.category === category)
      expect(quotesInCategory.length).toBeGreaterThan(0)
    })
  })

  it('should have valid translation keys', () => {
    QUOTES.forEach(quote => {
      expect(quote.textKey.startsWith('quote.')).toBe(true)
      expect(quote.authorKey.startsWith('quote.')).toBe(true)
    })
  })
})
