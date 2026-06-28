import type { TypingStats } from '../types'
import { logger } from '../utils/logger'

export interface ExportData {
  date: string
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  timeElapsed: number
  correctChars: number
  totalChars: number
}

export function convertToCSV(data: ExportData[]): string {
  if (!data || data.length === 0) return ''

  const headers = ['Date', 'WPM', 'CPM', 'Accuracy (%)', 'Errors', 'Time (s)', 'Correct Chars', 'Total Chars']
  const escapeCsv = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  const rows = data.map(row => [
    escapeCsv(row.date ?? ''),
    escapeCsv(row.wpm?.toString() ?? '0'),
    escapeCsv(row.cpm?.toString() ?? '0'),
    escapeCsv(row.accuracy?.toString() ?? '0'),
    escapeCsv(row.errors?.toString() ?? '0'),
    escapeCsv(row.timeElapsed?.toString() ?? '0'),
    escapeCsv(row.correctChars?.toString() ?? '0'),
    escapeCsv(row.totalChars?.toString() ?? '0'),
  ])

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function downloadCSV(data: ExportData[], filename = 'fastfingers_stats.csv'): void {
  try {
    const csv = convertToCSV(data)
    if (!csv) return

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, filename)
  } catch (error) {
    logger.error('Error downloading CSV:', error)
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function statsToExportData(stats: TypingStats[], dates?: string[]): ExportData[] {
  if (!stats || stats.length === 0) return []

  return stats
    .filter((stat): stat is TypingStats => stat !== null && stat !== undefined)
    .map((stat, index) => ({
    date: dates?.[index] ?? new Date().toISOString(),
    wpm: stat.wpm ?? 0,
    cpm: stat.cpm ?? 0,
    accuracy: stat.accuracy ?? 0,
    errors: stat.errors ?? 0,
    timeElapsed: stat.timeElapsed ?? 0,
    correctChars: stat.correctChars ?? 0,
    totalChars: stat.totalChars ?? 0,
  }))
}
