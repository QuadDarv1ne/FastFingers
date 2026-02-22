import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { User } from '../types/auth'

export interface CertificateData {
  user: User
  testType: '15s' | '30s' | '60s' | '120s'
  wpm: number
  accuracy: number
  cpm: number
  date: string
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
}

export function generateCertificate(data: CertificateData): Promise<Blob> {
  return new Promise((resolve) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    // Градиентный фон (упрощённый)
    doc.setFillColor(30, 27, 75)
    doc.rect(0, 0, 297, 210, 'F')

    // Декоративные элементы
    doc.setDrawColor(139, 92, 246)
    doc.setLineWidth(0.5)
    doc.rect(10, 10, 277, 190)
    doc.rect(15, 15, 267, 180)

    // Заголовок
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(48)
    doc.setTextColor(167, 139, 250)
    doc.text('CERTIFICATE', 148.5, 50, { align: 'center' })
    doc.setFontSize(28)
    doc.setTextColor(255, 255, 255)
    doc.text('OF ACHIEVEMENT', 148.5, 65, { align: 'center' })

    // Логотип
    doc.setFontSize(14)
    doc.setTextColor(167, 139, 250)
    doc.text('⌨️ FastFingers', 148.5, 80, { align: 'center' })

    // Имя пользователя
    doc.setFontSize(32)
    doc.setTextColor(255, 255, 255)
    doc.text('This certifies that', 148.5, 95, { align: 'center' })
    doc.setFontSize(42)
    doc.setFont('helvetica', 'bolditalic')
    doc.setTextColor(167, 139, 250)
    doc.text(data.user.name, 148.5, 110, { align: 'center' })

    // Текст достижения
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 200, 200)
    doc.text('has successfully completed the', 148.5, 125, { align: 'center' })
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(`${data.testType} Speed Test`, 148.5, 135, { align: 'center' })

    // Результаты
    doc.setFontSize(20)
    doc.setTextColor(200, 200, 200)
    doc.setFont('helvetica', 'normal')
    doc.text('with outstanding performance', 148.5, 150, { align: 'center' })

    // Статистика в рамке
    const stats = [
      ['Speed', `${data.wpm} WPM`],
      ['Accuracy', `${data.accuracy}%`],
      ['CPM', `${data.cpm} CPM`],
      ['Rank', data.rank],
    ]

    autoTable(doc, {
      startY: 155,
      head: [['Metric', 'Value']],
      body: stats,
      theme: 'grid',
      headStyles: {
        fillColor: [124, 58, 237],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [30, 27, 75],
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 70 },
      },
      margin: { left: 80, right: 80 },
    })

    // Дата и подпись
    doc.setFontSize(12)
    doc.setTextColor(150, 150, 150)
    doc.text(`Date: ${new Date(data.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 40, 195)
    doc.text('Certificate ID: ' + Math.random().toString(36).substring(2, 12).toUpperCase(), 200, 195, { align: 'right' })

    // Печать
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('This certificate verifies the authenticity of the achievement', 148.5, 205, { align: 'center' })

    // Генерация PDF
    doc.save(`certificate-${data.user.name}-${data.testType}.pdf`)
    resolve(doc.output('blob'))
  })
}

// Определение ранга на основе WPM и точности
export function calculateRank(wpm: number, accuracy: number): CertificateData['rank'] {
  const score = wpm * (accuracy / 100)
  
  if (score >= 80) return 'Diamond'
  if (score >= 60) return 'Platinum'
  if (score >= 45) return 'Gold'
  if (score >= 30) return 'Silver'
  return 'Bronze'
}
