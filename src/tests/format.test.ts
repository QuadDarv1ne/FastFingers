import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDuration,
  formatDurationLong,
  formatDate,
  calculateAge,
} from '../utils/format'

vi.mock('i18next', () => ({
  default: {
    language: 'ru',
  },
}))

describe('format utils', () => {
  describe('formatDuration', () => {
    it('должен форматировать секунды в ММ:СС', () => {
      expect(formatDuration(0)).toBe('00:00')
      expect(formatDuration(5)).toBe('00:05')
      expect(formatDuration(65)).toBe('01:05')
      expect(formatDuration(125)).toBe('02:05')
    })
  })

  describe('formatDurationLong', () => {
    it('должен форматировать секунды в ЧЧ:ММ:СС', () => {
      expect(formatDurationLong(3665)).toBe('01:01:05')
      expect(formatDurationLong(7200)).toBe('02:00:00')
    })

    it('должен использовать ММ:СС если меньше часа', () => {
      expect(formatDurationLong(3600)).toBe('01:00:00')
      expect(formatDurationLong(3599)).toBe('59:59')
    })

    it('должен обрабатывать отрицательные значения', () => {
      expect(formatDurationLong(-10)).toBe('00:00')
      expect(formatDurationLong(-100)).toBe('00:00')
    })
  })

  describe('formatDate', () => {
    it('должен форматировать дату', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toContain('2024')
      expect(formatDate(date)).toContain('января')
    })

    it('должен возвращать тире для невалидной даты', () => {
      expect(formatDate('invalid')).toBe('—')
      expect(formatDate('')).toBe('—')
      expect(formatDate(undefined as any)).toBe('—')
    })

    it('должен форматировать timestamp', () => {
      const timestamp = Date.now()
      expect(formatDate(timestamp)).not.toBe('—')
    })
  })

  describe('calculateAge', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('должен рассчитывать возраст', () => {
      const birthDate = new Date('2000-01-01')
      const age = calculateAge(birthDate)
      expect(age).toBe(24)
    })

    it('должен рассчитывать возраст с днем рождения в будущем', () => {
      const birthDate = new Date('2000-07-01')
      const age = calculateAge(birthDate)
      expect(age).toBe(23)
    })

    it('должен возвращать 0 для невалидной даты', () => {
      expect(calculateAge('invalid')).toBe(0)
      expect(calculateAge('')).toBe(0)
    })

    it('должен возвращать 0 для отрицательного возраста', () => {
      const futureDate = new Date('2030-01-01')
      expect(calculateAge(futureDate)).toBe(0)
    })
  })
})
