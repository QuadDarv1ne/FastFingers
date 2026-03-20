import type { User } from '../types/auth'
import type { CertificateData, CertificateOptions } from './certificateTypes'
import { generateCertificateId } from './certificateTypes'

const rankColors = {
  Bronze: { primary: [205, 127, 50] as [number, number, number], secondary: [139, 69, 19] as [number, number, number], gradient: ['#cd7f32', '#8b4513'] },
  Silver: { primary: [192, 192, 192] as [number, number, number], secondary: [169, 169, 169] as [number, number, number], gradient: ['#c0c0c0', '#a9a9a9'] },
  Gold: { primary: [255, 215, 0] as [number, number, number], secondary: [184, 134, 11] as [number, number, number], gradient: ['#ffd700', '#b8860b'] },
  Platinum: { primary: [229, 228, 226] as [number, number, number], secondary: [166, 166, 166] as [number, number, number], gradient: ['#e5e4e2', '#a6a6a6'] },
  Diamond: { primary: [185, 242, 255] as [number, number, number], secondary: [0, 206, 209] as [number, number, number], gradient: ['#b9f2ff', '#00ced1'] },
  Master: { primary: [138, 43, 226] as [number, number, number], secondary: [75, 0, 130] as [number, number, number], gradient: ['#8a2be2', '#4b0082'] },
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

/**
 * Генерация PDF сертификата с динамической загрузкой jsPDF
 * Оптимизированная версия без jspdf-autotable для уменьшения bundle size
 */
export async function generateCertificate(
  data: CertificateData,
  options: CertificateOptions = {}
): Promise<Blob> {
  // Динамический импорт только jspdf (без autotable)
  const [{ default: jsPDF }] = await Promise.all([
    import('jspdf'),
  ])

  return new Promise((resolve) => {
    const {
      language = 'ru',
      download = true,
      theme = 'classic',
    } = options

    const t = translations[language]
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const rankColor = rankColors[data.rank]

    // Фон в зависимости от темы
    if (theme === 'neon') {
      // Неоновая тема
      doc.setFillColor(10, 10, 30)
      doc.rect(0, 0, 297, 210, 'F')

      // Неоновая рамка
      const [rSec, gSec, bSec] = rankColor.secondary
      doc.setDrawColor(rSec, gSec, bSec)
      doc.setLineWidth(1)
      doc.rect(8, 8, 281, 194)
      const [rPri, gPri, bPri] = rankColor.primary
      doc.setDrawColor(rPri, gPri, bPri)
      doc.setLineWidth(0.5)
      doc.rect(12, 12, 273, 186)
    } else if (theme === 'modern') {
      // Современная тема с градиентом
      doc.setFillColor(200, 200, 255)
      doc.rect(0, 0, 297, 210, 'F')

      // Белая рамка
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.5)
      doc.rect(10, 10, 277, 190)
    } else {
      // Классическая тема
      doc.setFillColor(30, 27, 75)
      doc.rect(0, 0, 297, 210, 'F')

      // Декоративные элементы
      const [rPri, gPri, bPri] = rankColor.primary
      doc.setDrawColor(rPri, gPri, bPri)
      doc.setLineWidth(0.5)
      doc.rect(10, 10, 277, 190)
      doc.rect(15, 15, 267, 180)

      // Угловые элементы
      const cornerSize = 20
      doc.setFillColor(rPri, gPri, bPri)
      doc.triangle(10, 10, 10 + cornerSize, 10, 10, 10 + cornerSize, 'F')
      doc.triangle(287, 10, 287 - cornerSize, 10, 287, 10 + cornerSize, 'F')
      doc.triangle(10, 190, 10, 190 - cornerSize, 10 + cornerSize, 190, 'F')
      doc.triangle(287, 190, 287, 190 - cornerSize, 287 - cornerSize, 190, 'F')
    }

    // Заголовок
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(48)
    const [rPriTxt, gPriTxt, bPriTxt] = rankColor.primary
    doc.setTextColor(rPriTxt, gPriTxt, bPriTxt)
    doc.text(t.title, 148.5, 45, { align: 'center' })
    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.text(t.subtitle, 148.5, 58, { align: 'center' })

    // Логотип
    doc.setFontSize(16)
    doc.setTextColor(rPriTxt, gPriTxt, bPriTxt)
    doc.text('⌨️ FastFingers', 148.5, 72, { align: 'center' })

    // Имя пользователя
    doc.setFontSize(28)
    doc.setTextColor(255, 255, 255)
    doc.text(t.certifies, 148.5, 88, { align: 'center' })
    doc.setFontSize(40)
    doc.setFont('helvetica', 'bolditalic')
    doc.setTextColor(rPriTxt, gPriTxt, bPriTxt)
    doc.text(data.user.name, 148.5, 102, { align: 'center' })

    // Текст достижения
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 200, 200)
    doc.text(t.completed, 148.5, 115, { align: 'center' })
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)

    const testTypeLabels = {
      '15s': language === 'ru' ? '15 секунд' : '15 Seconds',
      '30s': language === 'ru' ? '30 секунд' : '30 Seconds',
      '60s': language === 'ru' ? '60 секунд' : '60 Seconds',
      '120s': language === 'ru' ? '120 секунд' : '120 Seconds',
      'sprint': language === 'ru' ? 'Спринт' : 'Sprint',
      'hardcore': language === 'ru' ? 'Без ошибок' : 'Hardcore',
    }

    doc.text(testTypeLabels[data.testType], 148.5, 126, { align: 'center' })

    doc.setFontSize(16)
    doc.setTextColor(200, 200, 200)
    doc.setFont('helvetica', 'normal')
    doc.text(t.performance, 148.5, 138, { align: 'center' })

    // Статистика в рамке
    const stats = [
      [t.speed, `${data.wpm} WPM`],
      [t.accuracy, `${data.accuracy}%`],
      [t.characters, `${data.cpm} CPM`],
      [t.rank, data.rank],
    ]

    if (data.level) {
      stats.push([t.level, data.level.toString()])
    }

    if (data.streak) {
      stats.push([t.streak, `${data.streak} 🔥`])
    }

    // Рисуем таблицу статистики вручную (без autoTable для экономии места)
    const startY = 145
    const rowHeight = 12
    const tableWidth = 140
    const tableX = (297 - tableWidth) / 2 // Центр
    const [rPri, gPri, bPri] = rankColor.primary
    const [rSec, gSec, bSec] = rankColor.secondary

    // Заголовок таблицы
    doc.setFillColor(rPri, gPri, bPri)
    doc.rect(tableX, startY, tableWidth, rowHeight, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(t.metric, tableX + 5, startY + 8)
    doc.text(t.value, tableX + tableWidth - 75, startY + 8)

    // Строки таблицы
    let currentY = startY + rowHeight
    stats.forEach((stat, index) => {
      const isEven = index % 2 === 0
      doc.setFillColor(isEven ? (theme === 'modern' ? 240 : 40) : (theme === 'modern' ? 250 : 50))
      doc.rect(tableX, currentY, tableWidth, rowHeight, 'F')

      // Граница
      doc.setDrawColor(rSec, gSec, bSec)
      doc.setLineWidth(0.2)
      doc.rect(tableX, currentY, tableWidth, rowHeight)

      // Текст
      doc.setFont('helvetica', isEven ? 'bold' : 'normal')
      doc.setTextColor(255, 255, 255)
      doc.text(stat[0], tableX + 5, currentY + 8)
      doc.text(stat[1], tableX + tableWidth - 75, currentY + 8)

      currentY += rowHeight
    })

    // Общая граница таблицы
    doc.setDrawColor(rPri, gPri, bPri)
    doc.setLineWidth(0.5)
    doc.rect(tableX, startY, tableWidth, rowHeight * (stats.length + 1))

    // Дата и подпись
    doc.setFontSize(11)
    doc.setTextColor(150, 150, 150)
    const dateStr = new Date(data.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.text(`${t.date}: ${dateStr}`, 40, 192)

    const certId = generateCertificateId()
    doc.text(`${t.certificateId}: ${certId}`, 257, 192, { align: 'right' })

    // Печать
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(t.verified, 148.5, 202, { align: 'center' })

    // Сохранение или возврат blob
    if (download) {
      const sanitizedName = data.user.name.replace(/[^a-z0-9а-яё]/gi, '_')
      doc.save(`certificate-${sanitizedName}-${data.testType}.pdf`)
    }

    resolve(doc.output('blob'))
  })
}

// Определение ранга на основе WPM и точности
export function calculateRank(wpm: number, accuracy: number): CertificateData['rank'] {
  const score = wpm * (accuracy / 100)

  if (score >= 100) return 'Master'
  if (score >= 80) return 'Diamond'
  if (score >= 60) return 'Platinum'
  if (score >= 45) return 'Gold'
  if (score >= 30) return 'Silver'
  return 'Bronze'
}

// Генерация сертификата для спринта
export function generateSprintCertificate(
  user: User,
  wpm: number,
  accuracy: number,
  correctChars: number
): Promise<Blob> {
  const data: CertificateData = {
    user,
    testType: 'sprint',
    wpm,
    accuracy,
    cpm: correctChars,
    date: new Date().toISOString(),
    rank: calculateRank(wpm, accuracy),
  }

  return generateCertificate(data, { language: 'ru', download: true, theme: 'classic' })
}
