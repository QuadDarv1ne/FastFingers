import { describe, it, expect } from 'vitest'
import { QUOTES } from '@components/MotivationalQuote'

describe('Motivational Quotes', () => {
  it('should have at least 10 quotes', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(10)
  })

  it('should have valid quote structure', () => {
    QUOTES.forEach(quote => {
      expect(quote).toHaveProperty('text')
      expect(quote).toHaveProperty('author')
      expect(quote).toHaveProperty('category')
      expect(quote.text.length).toBeGreaterThan(0)
      expect(quote.author.length).toBeGreaterThan(0)
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

  it('should have non-empty text', () => {
    QUOTES.forEach(quote => {
      expect(quote.text.trim().length).toBeGreaterThan(10)
    })
  })

  it('should have proper punctuation', () => {
    QUOTES.forEach(quote => {
      expect(quote.text).toMatch(/[.!?]$/)
    })
  })
})
