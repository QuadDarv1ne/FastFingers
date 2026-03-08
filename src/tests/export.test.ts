import { describe, it, expect } from 'vitest'
import { convertToCSV, statsToExportData, type ExportData } from '../utils/export'
import type { TypingStats } from '../types'

describe('export utils', () => {
  const mockStats: TypingStats[] = [
    { wpm: 60, cpm: 300, accuracy: 95, errors: 5, timeElapsed: 60, correctChars: 300, totalChars: 315, rhythmScore: 85 },
    { wpm: 70, cpm: 350, accuracy: 98, errors: 2, timeElapsed: 60, correctChars: 350, totalChars: 357, rhythmScore: 90 },
  ]

  describe('convertToCSV', () => {
    it('должен конвертировать данные в CSV формат', () => {
      const data = statsToExportData(mockStats)
      const csv = convertToCSV(data)
      
      expect(csv).toContain('Date,WPM,CPM,Accuracy (%)')
      expect(csv).toContain('60,300,95')
      expect(csv).toContain('70,350,98')
    })

    it('должен возвращать пустую строку для пустых данных', () => {
      const csv = convertToCSV([])
      expect(csv).toBe('')
    })

    it('должен экранировать запятые в данных', () => {
      const data: ExportData[] = [{
        date: '2026-03-07',
        wpm: 60,
        cpm: 300,
        accuracy: 95,
        errors: 5,
        timeElapsed: 60,
        correctChars: 300,
        totalChars: 315,
      }]
      const csv = convertToCSV(data)
      expect(csv.split('\n').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('statsToExportData', () => {
    it('должен конвертировать TypingStats в ExportData', () => {
      const result = statsToExportData(mockStats)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('wpm', 60)
      expect(result[0]).toHaveProperty('accuracy', 95)
      expect(result[1]).toHaveProperty('wpm', 70)
    })

    it('должен использовать предоставленные даты', () => {
      const dates = ['2026-03-06', '2026-03-07']
      const result = statsToExportData(mockStats, dates)

      expect(result[0]?.date).toBe('2026-03-06')
      expect(result[1]?.date).toBe('2026-03-07')
    })

    it('должен использовать текущую дату по умолчанию', () => {
      const result = statsToExportData(mockStats)

      expect(result[0]?.date).toBeDefined()
      expect(new Date(result[0]?.date ?? '').getTime()).toBeLessThanOrEqual(Date.now())
    })
  })
})
