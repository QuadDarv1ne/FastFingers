import { formatDuration as formatDurationNum } from './number'
import i18n from 'i18next'
import { logger } from './logger'

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

export { formatDurationNum as formatDuration }

export function formatDurationLong(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const mins = Math.floor((safeSeconds % 3600) / 60)
  const secs = safeSeconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return formatDurationNum(safeSeconds)
}

export function formatDate(date: Date | string | number): string {
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(i18n.language, DATE_FORMAT_OPTIONS)
  } catch (error) {
    logger.warn('Failed to format date', error)
    return '—'
  }
}

export function calculateAge(birthDate: Date | string | number): number {
  try {
    const today = new Date()
    const birth = new Date(birthDate)
    if (isNaN(birth.getTime())) return 0

    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return Math.max(0, age)
  } catch (error) {
    logger.warn('Failed to calculate age', error)
    return 0
  }
}

/** Return today's date as ISO YYYY-MM-DD string */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0] as string
}
