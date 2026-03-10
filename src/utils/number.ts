/**
 * Утилиты для форматирования чисел
 */

/**
 * Форматировать число с разделителями тысяч
 */
export function formatNumber(num: number, locale = 'ru-RU'): string {
  try {
    const safeNum = Number(num) || 0
    return safeNum.toLocaleString(locale)
  } catch {
    return String(num)
  }
}

/**
 * Форматировать число с указанием сокращений (K, M, B)
 */
export function formatCompactNumber(num: number, locale = 'ru-RU'): string {
  try {
    const safeNum = Number(num) || 0
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(safeNum)
  } catch {
    return String(num)
  }
}

/**
 * Форматировать число как проценты
 */
export function formatPercent(value: number, decimals = 0, locale = 'ru-RU'): string {
  try {
    const safeValue = Number(value) || 0
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(safeValue / 100)
  } catch {
    return '0%'
  }
}

/**
 * Форматировать число как валюту
 */
export function formatCurrency(
  amount: number,
  currency = 'RUB',
  locale = 'ru-RU'
): string {
  try {
    const safeAmount = Number(amount) || 0
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(safeAmount)
  } catch {
    return '0'
  }
}

/**
 * Форматировать байты в человекочитаемый формат
 */
export function formatBytes(bytes: number, decimals = 2): string {
  try {
    const safeBytes = Number(bytes) || 0
    if (safeBytes === 0) return '0 Б'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ']

    const i = Math.floor(Math.log(safeBytes) / Math.log(k))
    const value = safeBytes / Math.pow(k, i)

    return `${parseFloat(value.toFixed(dm))} ${sizes[i]}`
  } catch {
    return '0 Б'
  }
}

export function roundTo(num: number, decimals = 0): number {
  try {
    const safeNum = Number(num) || 0
    const factor = Math.pow(10, decimals)
    return Math.round(safeNum * factor) / factor
  } catch {
    return 0
  }
}

export function clamp(num: number, min: number, max: number): number {
  try {
    const safeNum = Number(num) || 0
    const safeMin = Number(min) || 0
    const safeMax = Number(max) || 0
    return Math.min(Math.max(safeNum, safeMin), safeMax)
  } catch {
    return 0
  }
}

export function isInRange(num: number, min: number, max: number): boolean {
  try {
    const safeNum = Number(num) || 0
    const safeMin = Number(min) || 0
    const safeMax = Number(max) || 0
    return safeNum >= safeMin && safeNum <= safeMax
  } catch {
    return false
  }
}

/**
 * Форматировать длительность в ММ:СС
 */
export function formatDuration(seconds: number): string {
  try {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
    const mins = Math.floor(safeSeconds / 60)
    const secs = safeSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } catch {
    return '00:00'
  }
}
