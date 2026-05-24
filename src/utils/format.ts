import { formatDuration as formatDurationNum } from './number'
import i18n from 'i18next'
import { logger } from './logger'

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
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

export function formatDateTime(date: Date | string | number): string {
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(i18n.language, DATE_TIME_OPTIONS)
  } catch (error) {
    logger.warn('Failed to format date-time', error)
    return '—'
  }
}

export function formatRelativeTime(date: Date | string | number): string {
  try {
    const now = new Date()
    const then = new Date(date)
    if (isNaN(then.getTime())) return '—'

    const diffMs = now.getTime() - then.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return i18n.t('time.justNow')
    if (diffMins < 60) return i18n.t('time.minutesAgo', { count: diffMins })
    if (diffHours < 24) return i18n.t('time.hoursAgo', { count: diffHours })
    if (diffDays < 7) return i18n.t('time.daysAgo', { count: diffDays })
    return formatDate(date)
  } catch (error) {
    logger.warn('Failed to format relative time', error)
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
