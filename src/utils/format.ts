import { formatDuration } from './number'

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

export { formatDuration }

export function formatDurationLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return formatDuration(seconds)
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', DATE_FORMAT_OPTIONS)
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', DATE_TIME_OPTIONS)
}

export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'только что'
  if (diffMins < 60) return `${diffMins} мин. назад`
  if (diffHours < 24) return `${diffHours} ч. назад`
  if (diffDays < 7) return `${diffDays} дн. назад`
  return formatDate(date)
}

export function calculateAge(birthDate: Date | string | number): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}
