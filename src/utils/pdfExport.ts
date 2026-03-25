/**
 * FastFingers — Экспорт статистики в PDF
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import type { UserProgress, TypingStats } from '../types'

interface ExportData {
  progress: UserProgress
  recentSessions: (TypingStats & { timestamp: string })[]
  heatmap: Record<string, { errors: number; total: number; accuracy: number }>
}

/**
 * Нарисовать таблицу вручную (без autoTable)
 */
function drawTable(
  doc: any,
  startY: number,
  head: string[],
  body: string[][],
  headColor: [number, number, number] = [124, 58, 237]
): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  const tableWidth = pageWidth - margin * 2
  const rowHeight = 8
  const colWidth = tableWidth / head.length

  // Заголовок
  doc.setFillColor(...headColor)
  doc.rect(margin, startY, tableWidth, rowHeight, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  head.forEach((h, i) => {
    doc.text(h, margin + i * colWidth + 2, startY + 5.5)
  })

  // Строки
  let currentY = startY + rowHeight
  body.forEach((row, rowIndex) => {
    const isEven = rowIndex % 2 === 0
    doc.setFillColor(isEven ? 245 : 250)
    doc.rect(margin, currentY, tableWidth, rowHeight, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    row.forEach((cell, i) => {
      doc.text(cell, margin + i * colWidth + 2, currentY + 5.5)
    })
    currentY += rowHeight
  })

  // Граница
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.rect(margin, startY, tableWidth, rowHeight * (body.length + 1))

  return currentY
}

/**
 * Экспорт статистики в PDF с динамической загрузкой jsPDF
 */
export async function exportStatsToPDF(data: ExportData): Promise<void> {
  const [{ default: jsPDF }] = await Promise.all([import('jspdf')])

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 20

  // Заголовок
  doc.setFontSize(24)
  doc.setTextColor(124, 58, 237)
  doc.text('FastFingers', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 10
  doc.setFontSize(16)
  doc.setTextColor(100, 100, 100)
  doc.text('Статистика прогресса', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 5
  doc.setFontSize(10)
  doc.setTextColor(150, 150, 150)
  doc.text(`Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}`, pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 15

  // Общий прогресс
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('📊 Общий прогресс', 14, yPosition)
  yPosition += 10

  const progressData = [
    ['Уровень', data.progress.level.toString()],
    ['Опыт (XP)', `${data.progress.xp} / ${data.progress.xpToNextLevel}`],
    ['Лучший WPM', data.progress.bestWpm.toString()],
    ['Лучшая точность', `${data.progress.bestAccuracy}%`],
    ['Всего слов', data.progress.totalWordsTyped.toLocaleString('ru-RU')],
    ['Время практики', formatMinutes(data.progress.totalPracticeTime)],
    ['Серия', `${data.progress.streak} дней`],
  ]

  yPosition = drawTable(doc, yPosition, ['Метрика', 'Значение'], progressData)
  yPosition += 15

  // Последние сессии
  if (data.recentSessions.length > 0) {
    doc.setFontSize(14)
    doc.text('📈 Последние 10 сессий', 14, yPosition)
    yPosition += 10

    const sessionsData = data.recentSessions.slice(0, 10).map(session => [
      new Date(session.timestamp).toLocaleDateString('ru-RU'),
      session.wpm.toString(),
      `${session.accuracy}%`,
      session.correctChars.toString(),
      '0',
    ])

    yPosition = drawTable(doc, yPosition, ['Дата', 'WPM', 'Точность', 'Правильно', 'Ошибок'], sessionsData)
    yPosition += 15
  }

  // Проблемные клавиши
  const problemKeys = Object.entries(data.heatmap)
    .filter(([_, stats]) => stats.total >= 10)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 10)

  if (problemKeys.length > 0 && yPosition < 250) {
    doc.setFontSize(14)
    doc.text('⚠️ Проблемные клавиши', 14, yPosition)
    yPosition += 10

    const keysData = problemKeys.map(([key, stats]) => [
      key,
      stats.total.toString(),
      stats.errors.toString(),
      `${stats.accuracy}%`,
    ])

    yPosition = drawTable(doc, yPosition, ['Клавиша', 'Всего', 'Ошибок', 'Точность'], keysData, [239, 68, 68])
  }

  // Новая страница если нужно
  if (yPosition > 250) doc.addPage()

  // Футер
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`FastFingers © 2026 | Страница ${i} из ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
  }

  const filename = `fastfingers-stats-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours} ч ${mins} мин`
}

/**
 * Экспорт сертификата достижения
 */
export async function exportCertificatePDF(data: {
  userName: string
  wpm: number
  accuracy: number
  level: number
}): Promise<void> {
  const [{ default: jsPDF }] = await Promise.all([import('jspdf')])

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Фон
  doc.setFillColor(15, 15, 15)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Рамка
  doc.setDrawColor(124, 58, 237)
  doc.setLineWidth(2)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  // Заголовок
  doc.setFontSize(40)
  doc.setTextColor(124, 58, 237)
  doc.text('СЕРТИФИКАТ', pageWidth / 2, 40, { align: 'center' })

  doc.setFontSize(16)
  doc.setTextColor(200, 200, 200)
  doc.text('о достижениях в слепой печати', pageWidth / 2, 55, { align: 'center' })

  // Имя
  doc.setFontSize(12)
  doc.setTextColor(150, 150, 150)
  doc.text('Настоящим подтверждается, что', pageWidth / 2, 80, { align: 'center' })

  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text(data.userName || 'Пользователь', pageWidth / 2, 95, { align: 'center' })

  // Достижения
  doc.setFontSize(12)
  doc.setTextColor(150, 150, 150)
  doc.text('достиг следующих результатов:', pageWidth / 2, 110, { align: 'center' })

  const achievements = [
    `Скорость печати: ${data.wpm} WPM`,
    `Точность: ${data.accuracy}%`,
    `Уровень: ${data.level}`,
  ]

  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  achievements.forEach((achievement, index) => {
    doc.text(achievement, pageWidth / 2, 130 + index * 12, { align: 'center' })
  })

  // Дата
  doc.setFontSize(10)
  doc.setTextColor(150, 150, 150)
  doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, pageWidth / 2, pageHeight - 30, { align: 'center' })

  // Подпись
  doc.setFontSize(14)
  doc.setTextColor(124, 58, 237)
  doc.text('FastFingers', pageWidth / 2, pageHeight - 20, { align: 'center' })

  const filename = `fastfingers-certificate-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
