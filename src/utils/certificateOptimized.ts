/**
 * FastFingers — Генерация сертификата через Canvas + html2canvas
 * Оптимизированная версия без jspdf (экономия ~390KB)
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import type { CertificateData, CertificateOptions } from './certificateTypes'
import { generateCertificateId } from './certificateTypes'

const rankColors = {
  Bronze: { primary: '#CD7F32', secondary: '#8B4513' },
  Silver: { primary: '#C0C0C0', secondary: '#A9A9A9' },
  Gold: { primary: '#FFD700', secondary: '#B8860B' },
  Platinum: { primary: '#E5E4E2', secondary: '#A6A6A6' },
  Diamond: { primary: '#B9F2FF', secondary: '#00CED1' },
  Master: { primary: '#8A2BE2', secondary: '#4B0082' },
}

const translations = {
  en: {
    title: 'CERTIFICATE',
    subtitle: 'OF ACHIEVEMENT',
    certifies: 'This certifies that',
    completed: 'has successfully completed the',
    performance: 'with outstanding performance',
    metrics: 'Performance Metrics',
    metric: 'Metric',
    value: 'Value',
    speed: 'Speed',
    accuracy: 'Accuracy',
    characters: 'Characters',
    rank: 'Rank',
    date: 'Date',
    certificateId: 'Certificate ID',
    verified: 'This certificate verifies the authenticity of the achievement',
    level: 'Level',
    streak: 'Day Streak',
  },
  ru: {
    title: 'СЕРТИФИКАТ',
    subtitle: 'О ДОСТИЖЕНИИ',
    certifies: 'Настоящий сертификат подтверждает, что',
    completed: 'успешно завершил(а) тест',
    performance: 'показав выдающийся результат',
    metrics: 'Показатели',
    metric: 'Метрика',
    value: 'Значение',
    speed: 'Скорость',
    accuracy: 'Точность',
    characters: 'Символы',
    rank: 'Ранг',
    date: 'Дата',
    certificateId: 'ID сертификата',
    verified: 'Этот сертификат подтверждает подлинность достижения',
    level: 'Уровень',
    streak: 'Дней подряд',
  },
}

export async function generateCertificate(
  data: CertificateData,
  options: CertificateOptions = {}
): Promise<Blob> {
  const { language = 'ru', download = true, theme = 'classic' } = options
  const t = translations[language] ?? translations['ru']
  const rankColor = rankColors[data.rank as keyof typeof rankColors] || rankColors.Bronze

  const width = 1200
  const height = 850
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas not supported')
  }

  // Фон
  if (theme === 'neon') {
    ctx.fillStyle = '#0A0A1E'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = rankColor.secondary
    ctx.lineWidth = 4
    ctx.strokeRect(20, 20, width - 40, height - 40)
    ctx.strokeStyle = rankColor.primary
    ctx.lineWidth = 2
    ctx.strokeRect(30, 30, width - 60, height - 60)
  } else if (theme === 'modern') {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#F0F0FF')
    gradient.addColorStop(1, '#E0E0F0')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(40, 40, width - 80, height - 80)
  } else {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#1E1B4B')
    gradient.addColorStop(1, '#0F0F2E')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = rankColor.primary
    ctx.lineWidth = 6
    ctx.strokeRect(40, 40, width - 80, height - 80)
    ctx.lineWidth = 3
    ctx.strokeRect(50, 50, width - 100, height - 100)
  }

  // Заголовок
  ctx.textAlign = 'center'
  ctx.fillStyle = theme === 'modern' ? '#1E1B4B' : rankColor.primary
  ctx.font = 'bold 72px Helvetica, Arial, sans-serif'
  ctx.fillText(t.title, width / 2, 180)
  ctx.fillStyle = theme === 'modern' ? '#4B4B6B' : '#FFFFFF'
  ctx.font = '36px Helvetica, Arial, sans-serif'
  ctx.fillText(t.subtitle, width / 2, 220)

  // Логотип
  ctx.font = '28px Helvetica, Arial, sans-serif'
  ctx.fillStyle = rankColor.primary
  ctx.fillText('⌨️ FastFingers', width / 2, 260)

  // Текст сертификата
  ctx.fillStyle = theme === 'modern' ? '#2D2D4D' : '#FFFFFF'
  ctx.font = '24px Helvetica, Arial, sans-serif'
  ctx.fillText(t.certifies, width / 2, 310)

  // Имя пользователя
  ctx.fillStyle = rankColor.primary
  ctx.font = 'bold 64px Helvetica, Arial, sans-serif'
  ctx.fillText(String(data.user.name || ''), width / 2, 370)

  ctx.fillStyle = theme === 'modern' ? '#6B6B8B' : '#C8C8C8'
  ctx.font = '24px Helvetica, Arial, sans-serif'
  ctx.fillText(t.completed, width / 2, 420)

  // Тип теста
  const testTypeLabels: Record<string, string> = {
    '15s': language === 'ru' ? '15 секунд' : '15 Seconds',
    '30s': language === 'ru' ? '30 секунд' : '30 Seconds',
    '60s': language === 'ru' ? '60 секунд' : '60 Seconds',
    '120s': language === 'ru' ? '120 секунд' : '120 Seconds',
    'sprint': language === 'ru' ? 'Спринт' : 'Sprint',
    'hardcore': language === 'ru' ? 'Без ошибок' : 'Hardcore',
  }
  const testType = data.testType ?? 'sprint'
  const label = testTypeLabels[testType] || testTypeLabels['sprint']
  ctx.fillStyle = theme === 'modern' ? '#1E1B4B' : '#FFFFFF'
  ctx.font = 'bold 36px Helvetica, Arial, sans-serif'
  ctx.fillText(String(label || ''), width / 2, 470)

  ctx.fillStyle = theme === 'modern' ? '#6B6B8B' : '#C8C8C8'
  ctx.font = '24px Helvetica, Arial, sans-serif'
  ctx.fillText(t.performance, width / 2, 520)

  // Таблица результатов
  const stats: [string, string][] = [
    [t.speed, `${data.wpm} WPM`],
    [t.accuracy, `${data.accuracy}%`],
    [t.characters, `${data.cpm} CPM`],
    [t.rank, data.rank],
  ]
  if (data.level) stats.push([t.level, data.level.toString()])
  if (data.streak) stats.push([t.streak || 'Streak', `${data.streak} 🔥`])

  const tableX = width * 0.25
  const tableY = 580
  const tableWidth = width * 0.5
  const rowHeight = 50

  // Заголовок таблицы
  ctx.fillStyle = rankColor.primary
  ctx.fillRect(tableX, tableY, tableWidth, rowHeight)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 20px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(t.metric, tableX + 20, tableY + 32)
  ctx.textAlign = 'right'
  ctx.fillText(t.value, tableX + tableWidth - 20, tableY + 32)

  // Строки таблицы
  stats.forEach((stat, index) => {
    const isEven = index % 2 === 0
    ctx.fillStyle = theme === 'modern' ? (isEven ? '#F0F0F5' : '#E8E8F0') : (isEven ? '#2A2A4A' : '#3A3A5A')
    ctx.fillRect(tableX, tableY + rowHeight + index * rowHeight, tableWidth, rowHeight)
    ctx.fillStyle = theme === 'modern' ? '#1E1B4B' : '#FFFFFF'
    ctx.font = isEven ? 'bold 20px Helvetica, Arial, sans-serif' : '20px Helvetica, Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(String(stat[0]), tableX + 20, tableY + rowHeight + (index + 1) * rowHeight + 8)
    ctx.textAlign = 'right'
    ctx.fillText(String(stat[1]), tableX + tableWidth - 20, tableY + rowHeight + (index + 1) * rowHeight + 8)
  })

  // Дата и ID
  ctx.textAlign = 'left'
  ctx.fillStyle = theme === 'modern' ? '#8B8B9B' : '#969696'
  ctx.font = '18px Helvetica, Arial, sans-serif'
  const dateStr = new Date(data.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  ctx.fillText(`${t.date}: ${dateStr}`, 80, height - 80)

  const certId = generateCertificateId()
  ctx.textAlign = 'right'
  ctx.fillText(`${t.certificateId}: ${certId}`, width - 80, height - 80)

  ctx.font = '16px Helvetica, Arial, sans-serif'
  ctx.fillText(t.verified, width / 2, height - 50)

  // Конвертация в Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create certificate'))
        return
      }
      if (download) {
        const sanitizedName = (data.user.name || 'user').replace(/[^a-z0-9а-яё]/gi, '_')
        const link = document.createElement('a')
        link.download = `certificate-${sanitizedName}-${data.testType}.png`
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)
      }
      resolve(blob)
    }, 'image/png', 0.95)
  })
}

