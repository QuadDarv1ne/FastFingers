import { describe, it, expect } from 'vitest'
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
  })

  describe('formatDate', () => {
    it('должен форматировать дату', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toContain('2024')
      expect(formatDate(date)).toContain('января')
    })
  })

  describe('formatDateTime', () => {
    it('должен форматировать дату и время', () => {
      const date = new Date('2024-01-15T14:30:00')
      const formatted = formatDateTime(date)
      expect(formatted).toContain('2024')
      expect(formatted).toContain('14:30')
    })
  })

  describe('formatRelativeTime', () => {
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
  })

  describe('calculateAge', () => {
    it('должен рассчитывать возраст', () => {
      const birthDate = new Date('2000-01-01')
      const age = calculateAge(birthDate)
      expect(age).toBeGreaterThan(20)
      expect(age).toBeLessThan(30)
    })
  })
})
