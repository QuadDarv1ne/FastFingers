/**
 * FastFingers — Экспорт статистики (оптимизированный, без jspdf)
 * Использует Canvas API вместо jspdf для экономии ~390KB
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
 * Экспорт статистики в PNG через Canvas API
 */
export async function exportStatsToPNG(data: ExportData): Promise<void> {
  const canvas = document.createElement('canvas')
  const width = 1200
  const height = 1600
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas not supported')
  }

  // Фон
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#1E1B4B')
  gradient.addColorStop(1, '#0F0F2E')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  let y = 40

  // Заголовок
  ctx.fillStyle = '#7C3AED'
  ctx.font = 'bold 48px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('FastFingers', width / 2, y)
  y += 40
  ctx.fillStyle = '#A0A0A0'
  ctx.font = '24px Helvetica, Arial, sans-serif'
  ctx.fillText('Статистика прогресса', width / 2, y)
  y += 30
  ctx.fillStyle = '#808080'
  ctx.font = '16px Helvetica, Arial, sans-serif'
  ctx.fillText(`Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}`, width / 2, y)
  y += 50

  // Общий прогресс
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 24px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('📊 Общий прогресс', 40, y)
  y += 30

  const progressData: [string, string][] = [
    ['Уровень', data.progress.level.toString()],
    ['Опыт (XP)', `${data.progress.xp} / ${data.progress.xpToNextLevel}`],
    ['Лучший WPM', data.progress.bestWpm.toString()],
    ['Лучшая точность', `${data.progress.bestAccuracy}%`],
    ['Всего слов', data.progress.totalWordsTyped.toLocaleString('ru-RU')],
    ['Время практики', formatMinutes(data.progress.totalPracticeTime)],
    ['Серия', `${data.progress.streak} дней`],
  ]

  // Таблица прогресса
  const tableX = 40
  const tableWidth = width - 80
  const rowHeight = 40

  // Заголовок таблицы
  ctx.fillStyle = '#7C3AED'
  ctx.fillRect(tableX, y, tableWidth, rowHeight)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 18px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Метрика', tableX + 10, y + 26)
  ctx.textAlign = 'right'
  ctx.fillText('Значение', tableX + tableWidth - 10, y + 26)
  y += rowHeight

  // Строки
  progressData.forEach((row, index) => {
    ctx.fillStyle = index % 2 === 0 ? '#2A2A4A' : '#3A3A5A'
    ctx.fillRect(tableX, y, tableWidth, rowHeight)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 18px Helvetica, Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(row[0], tableX + 10, y + 26)
    ctx.textAlign = 'right'
    ctx.fillText(row[1], tableX + tableWidth - 10, y + 26)
    y += rowHeight
  })

  y += 30

  // Последние сессии
  if (data.recentSessions.length > 0) {
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 24px Helvetica, Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('📈 Последние 10 сессий', 40, y)
    y += 30

    const sessionsData: [string, string, string, string][] = data.recentSessions.slice(0, 10).map(session => [
      new Date(session.timestamp).toLocaleDateString('ru-RU'),
      session.wpm.toString(),
      `${session.accuracy}%`,
      session.correctChars.toString(),
    ])

    const sessionTableWidth = tableWidth / 4
    ctx.fillStyle = '#7C3AED'
    ctx.fillRect(tableX, y, tableWidth, rowHeight)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 16px Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Дата', tableX + sessionTableWidth / 2, y + 24)
    ctx.fillText('WPM', tableX + sessionTableWidth * 1.5, y + 24)
    ctx.fillText('Точность', tableX + sessionTableWidth * 2.5, y + 24)
    ctx.fillText('Правильно', tableX + sessionTableWidth * 3.5, y + 24)
    y += rowHeight

    sessionsData.forEach((row, index) => {
      ctx.fillStyle = index % 2 === 0 ? '#2A2A4A' : '#3A3A5A'
      ctx.fillRect(tableX, y, tableWidth, rowHeight)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '16px Helvetica, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(row[0], tableX + sessionTableWidth / 2, y + 24)
      ctx.fillText(row[1], tableX + sessionTableWidth * 1.5, y + 24)
      ctx.fillText(row[2], tableX + sessionTableWidth * 2.5, y + 24)
      ctx.fillText(row[3], tableX + sessionTableWidth * 3.5, y + 24)
      y += rowHeight
    })
  }

  // Футер
  y += 40
  ctx.fillStyle = '#808080'
  ctx.font = '16px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('FastFingers © 2026', width / 2, y)
  y += 30
  ctx.fillText('Тренажёр слепой печати', width / 2, y)

  // Сохранение
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png', 0.95)
  })
  const link = document.createElement('a')
  link.download = `fastfingers-stats-${new Date().toISOString().split('T')[0]}.png`
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours} ч ${mins} мин`
}

/**
 * Экспорт сертификата достижения через Canvas
 */
export async function exportCertificatePNG(data: {
  userName: string
  wpm: number
  accuracy: number
  level: number
}): Promise<void> {
  const canvas = document.createElement('canvas')
  const width = 1200
  const height = 850
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas not supported')
  }

  // Фон
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#1E1B4B')
  gradient.addColorStop(1, '#0F0F2E')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Рамка
  ctx.strokeStyle = '#7C3AED'
  ctx.lineWidth = 8
  ctx.strokeRect(20, 20, width - 40, height - 40)
  ctx.lineWidth = 4
  ctx.strokeRect(30, 30, width - 60, height - 60)

  // Заголовок
  ctx.fillStyle = '#7C3AED'
  ctx.font = 'bold 72px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('СЕРТИФИКАТ', width / 2, 160)
  ctx.fillStyle = '#A0A0A0'
  ctx.font = '28px Helvetica, Arial, sans-serif'
  ctx.fillText('о достижениях в слепой печати', width / 2, 210)

  // Имя
  ctx.fillStyle = '#A0A0A0'
  ctx.font = '20px Helvetica, Arial, sans-serif'
  ctx.fillText('Настоящим подтверждается, что', width / 2, 270)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 56px Helvetica, Arial, sans-serif'
  ctx.fillText(data.userName || 'Пользователь', width / 2, 340)

  // Достижения
  ctx.fillStyle = '#A0A0A0'
  ctx.font = '20px Helvetica, Arial, sans-serif'
  ctx.fillText('достиг следующих результатов:', width / 2, 410)

  const achievements = [
    `Скорость печати: ${data.wpm} WPM`,
    `Точность: ${data.accuracy}%`,
    `Уровень: ${data.level}`,
  ]
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 28px Helvetica, Arial, sans-serif'
  achievements.forEach((achievement) => {
    ctx.fillText(achievement, width / 2, 470)
  })

  // Дата
  ctx.fillStyle = '#808080'
  ctx.font = '20px Helvetica, Arial, sans-serif'
  ctx.fillText(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, width / 2, height - 100)

  // Подпись
  ctx.fillStyle = '#7C3AED'
  ctx.font = 'bold 32px Helvetica, Arial, sans-serif'
  ctx.fillText('FastFingers', width / 2, height - 60)

  // Сохранение
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png', 0.95)
  })
  const link = document.createElement('a')
  link.download = `fastfingers-certificate-${new Date().toISOString().split('T')[0]}.png`
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}
