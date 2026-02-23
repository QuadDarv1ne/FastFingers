/**
 * Утилиты для форматирования чисел
 */

/**
 * Форматировать число с разделителями тысяч
 */
export function formatNumber(num: number, locale = 'ru-RU'): string {
  return num.toLocaleString(locale)
}

/**
 * Форматировать число с указанием сокращений (K, M, B)
 */
export function formatCompactNumber(num: number, locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

/**
 * Форматировать число как проценты
 */
export function formatPercent(value: number, decimals = 0, locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Форматировать число как валюту
 */
export function formatCurrency(
  amount: number,
  currency = 'RUB',
  locale = 'ru-RU'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Форматировать байты в человекочитаемый формат
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Б'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Округлить число до указанного количества знаков
 */
export function roundTo(num: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

/**
 * Ограничить число в диапазоне
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

/**
 * Проверить, является ли число в диапазоне
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max
}
