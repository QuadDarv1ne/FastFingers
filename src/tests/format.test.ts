import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDuration,
  formatDurationLong,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  calculateAge,
} from '../utils/format'

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

  describe('formatDateTime', () => {
    it('должен форматировать дату и время', () => {
      const date = new Date('2024-01-15T14:30:00')
      const formatted = formatDateTime(date)
      expect(formatted).toContain('2024')
      expect(formatted).toContain('14:30')
    })

    it('должен возвращать тире для невалидной даты', () => {
      expect(formatDateTime('invalid')).toBe('—')
      expect(formatDateTime('')).toBe('—')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('должен показывать "только что" для недавнего времени', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('только что')
    })

    it('должен показывать минуты назад', () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeTime(fiveMinsAgo)).toContain('мин.')
    })

    it('должен показывать часы назад', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
      expect(formatRelativeTime(threeHoursAgo)).toContain('ч.')
    })

    it('должен показывать дни назад', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(fiveDaysAgo)).toContain('дн.')
    })

    it('должен возвращать дату для старых дат', () => {
      const oldDate = new Date('2023-01-01')
      expect(formatRelativeTime(oldDate)).not.toBe('только что')
    })

    it('должен возвращать тире для невалидной даты', () => {
      expect(formatRelativeTime('invalid')).toBe('—')
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
