import { TypingStats } from '../types'

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
  const rows = data.map(row => [
    row.date,
    row.wpm.toString(),
    row.cpm.toString(),
    row.accuracy.toString(),
    row.errors.toString(),
    row.timeElapsed.toString(),
    row.correctChars.toString(),
    row.totalChars.toString(),
  ])

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function downloadCSV(data: ExportData[], filename = 'fastfingers_stats.csv'): void {
  const csv = convertToCSV(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function statsToExportData(stats: TypingStats[], dates?: string[]): ExportData[] {
  return stats.map((stat, index) => ({
    date: dates?.[index] ?? new Date().toISOString(),
    wpm: stat.wpm,
    cpm: stat.cpm,
    accuracy: stat.accuracy,
    errors: stat.errors,
    timeElapsed: stat.timeElapsed,
    correctChars: stat.correctChars,
    totalChars: stat.totalChars,
  }))
}
