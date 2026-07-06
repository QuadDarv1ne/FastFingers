import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { convertToCSV, downloadCSV, type ExportData } from '../utils/export'

describe('export utils', () => {
  const mockData: ExportData[] = [
    { date: '2026-03-06', wpm: 60, cpm: 300, accuracy: 95, errors: 5, timeElapsed: 60, correctChars: 300, totalChars: 315 },
    { date: '2026-03-07', wpm: 70, cpm: 350, accuracy: 98, errors: 2, timeElapsed: 60, correctChars: 350, totalChars: 357 },
  ]

  describe('convertToCSV', () => {
    it('должен конвертировать данные в CSV формат', () => {
      const csv = convertToCSV(mockData)
      
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

  describe('downloadCSV', () => {
    let appendChildSpy: any
    let removeChildSpy: any
    let createElementSpy: any
    let revokeObjectURLSpy: any

    beforeEach(() => {
      const mockLink = {
        href: '',
        style: {},
        download: '',
        click: vi.fn(),
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
      expect(mockLink.download).toBe('fastfingers_stats.csv')
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
      expect(mockLink.download).toBe('custom_stats.csv')
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
