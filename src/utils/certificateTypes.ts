import type { User } from '../types/auth'

export interface CertificateData {
  user: User
  testType: '15s' | '30s' | '60s' | '120s' | 'sprint' | 'hardcore'
  wpm: number
  accuracy: number
  cpm: number
  date: string
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master'
  level?: number
  streak?: number
}

export interface CertificateOptions {
  language?: 'ru' | 'en'
  download?: boolean
  theme?: 'classic' | 'modern' | 'neon'
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

// Генерация ID сертификата
export function generateCertificateId(): string {
  return 'FF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
}
