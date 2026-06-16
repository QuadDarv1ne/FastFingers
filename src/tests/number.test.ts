import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  roundTo,
  clamp,
  isInRange,
  formatDuration,
} from '../utils/number'

describe('number utils', () => {
  describe('formatNumber', () => {
    it('должен форматировать число с разделителями', () => {
      const result = formatNumber(1000000)
      expect(result).toMatch(/\d[\s]\d{3}[\s]\d{3}/)
    })
  })

  describe('formatCompactNumber', () => {
    it('должен сокращать большие числа', () => {
      expect(formatCompactNumber(1000)).toMatch(/1\s?тыс/)
      expect(formatCompactNumber(1000000)).toMatch(/1\s?млн/)
    })
  })

  describe('formatPercent', () => {
    it('должен форматировать проценты', () => {
      expect(formatPercent(50)).toContain('50')
      expect(formatPercent(50)).toContain('%')
      expect(formatPercent(75.5, 1)).toContain('75')
    })
  })

  describe('roundTo', () => {
    it('должен округлять число', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14)
      expect(roundTo(3.14159, 0)).toBe(3)
    })
  })

  describe('clamp', () => {
    it('должен ограничивать число в диапазоне', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('isInRange', () => {
    it('должен проверять диапазон', () => {
      expect(isInRange(5, 0, 10)).toBe(true)
      expect(isInRange(-5, 0, 10)).toBe(false)
      expect(isInRange(15, 0, 10)).toBe(false)
    })
  })

  describe('formatDuration', () => {
    it('должен форматировать секунды в ММ:СС', () => {
      expect(formatDuration(0)).toBe('00:00')
      expect(formatDuration(5)).toBe('00:05')
      expect(formatDuration(60)).toBe('01:00')
      expect(formatDuration(3661)).toBe('61:01')
    })

    it('должен обрабатывать отрицательные значения', () => {
      expect(formatDuration(-1)).toBe('00:00')
      expect(formatDuration(-100)).toBe('00:00')
    })

    it('должен обрабатывать дробные значения', () => {
      expect(formatDuration(90.7)).toBe('01:30')
    })
  })
})
