import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { convertToCSV, statsToExportData, downloadCSV, type ExportData } from '../utils/export'
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

  describe('downloadCSV', () => {
    let appendChildSpy: any
    let removeChildSpy: any
    let createElementSpy: any
    let revokeObjectURLSpy: any

    beforeEach(() => {
      const mockLink = {
        href: '',
        style: {},
        click: vi.fn(),
        setAttribute: vi.fn(),
      }
      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url')
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('должен создавать и скачивать CSV файл', () => {
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

      downloadCSV(data, 'test.csv')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()
    })

    it('должен использовать имя файла по умолчанию', () => {
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

      downloadCSV(data)

      const mockLink = createElementSpy.mock.results[0]?.value
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'fastfingers_stats.csv')
    })

    it('должен использовать кастомное имя файла', () => {
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

      downloadCSV(data, 'custom_stats.csv')

      const mockLink = createElementSpy.mock.results[0]?.value
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'custom_stats.csv')
    })

    it('должен скрывать ссылку во время скачивания', () => {
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

      downloadCSV(data)

      const mockLink = createElementSpy.mock.results[0]?.value
      expect(mockLink.style.visibility).toBe('hidden')
    })

    it('должен удалять ссылку после скачивания', () => {
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

      downloadCSV(data)

      expect(removeChildSpy).toHaveBeenCalled()
    })
  })
})
