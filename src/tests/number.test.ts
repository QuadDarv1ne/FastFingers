import { describe, it, expect } from 'vitest'
import {
  isInRange,
  formatDuration,
  safeParseInt,
} from '../utils/number'

describe('number utils', () => {
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

  describe('safeParseInt', () => {
    it('должен парсить валидную строку', () => {
      expect(safeParseInt('42')).toBe(42)
      expect(safeParseInt('0')).toBe(0)
      expect(safeParseInt('-1')).toBe(-1)
    })

    it('должен возвращать 0 для null', () => {
      expect(safeParseInt(null)).toBe(0)
    })

    it('должен возвращать 0 для undefined', () => {
      expect(safeParseInt(undefined)).toBe(0)
    })

    it('должен возвращать 0 для невалидной строки', () => {
      expect(safeParseInt('abc')).toBe(0)
    })

    it('должен возвращать 0 для пустой строки', () => {
      expect(safeParseInt('')).toBe(0)
    })
  })
})
