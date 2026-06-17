/**
 * Утилиты для форматирования чисел
 */

import { logger } from './logger'

/**
 * Форматировать число с разделителями тысяч
 */
export function formatNumber(num: number, locale = 'ru-RU'): string {
  try {
    const safeNum = Number(num) || 0
    return safeNum.toLocaleString(locale)
  } catch (err) {
    logger.warn(`formatNumber failed for value=${num}`, err)
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
  } catch (err) {
    logger.warn(`formatCompactNumber failed for value=${num}, locale=${locale}`, err)
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
  } catch (err) {
    logger.warn(`formatPercent failed for value=${value}, decimals=${decimals}`, err)
    return '0%'
  }
}

export function roundTo(num: number, decimals = 0): number {
  try {
    const safeNum = Number(num) || 0
    const factor = Math.pow(10, decimals)
    return Math.round(safeNum * factor) / factor
  } catch (err) {
    logger.warn(`roundTo failed for value=${num}, decimals=${decimals}`, err)
    return 0
  }
}

export function clamp(num: number, min: number, max: number): number {
  try {
    const safeNum = Number(num) || 0
    const safeMin = Number(min) || 0
    const safeMax = Number(max) || 0
    return Math.min(Math.max(safeNum, safeMin), safeMax)
  } catch (err) {
    logger.warn(`clamp failed for num=${num}, min=${min}, max=${max}`, err)
    return 0
  }
}

export function isInRange(num: number, min: number, max: number): boolean {
  try {
    const safeNum = Number(num) || 0
    const safeMin = Number(min) || 0
    const safeMax = Number(max) || 0
    return safeNum >= safeMin && safeNum <= safeMax
  } catch (err) {
    logger.warn(`isInRange failed for num=${num}, min=${min}, max=${max}`, err)
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
  } catch (err) {
    logger.warn(`formatDuration failed for seconds=${seconds}`, err)
    return '00:00'
  }
}
