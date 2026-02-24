/**
 * Утилиты для генерации уникальных идентификаторов
 */

let cryptoObj: Crypto | null = null
if (typeof window !== 'undefined' && window.crypto) {
  cryptoObj = window.crypto
} else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
  cryptoObj = globalThis.crypto
}

/**
 * Сгенерировать уникальный ID (UUID v4)
 * Формат: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateId(): string {
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID()
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Сгенерировать короткий ID (для ссылок, кодов)
 */
export function generateShortId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  if (cryptoObj) {
    const randomValues = new Uint32Array(length)
    cryptoObj.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomValues[i] % chars.length)
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  
  return result
}

/**
 * Сгенерировать числовой ID
 */
export function generateNumericId(length = 6): string {
  let result = ''
  
  if (cryptoObj) {
    const randomValues = new Uint32Array(length)
    cryptoObj.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
      result += (randomValues[i] % 10).toString()
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10)
    }
  }
  
  return result
}

/**
 * Сгенерировать slug из строки
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Сгенерировать цвет на основе строки (для аватарок)
 */
export function generateColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Получить инициалы из имени
 */
export function getInitials(name: string, maxLength = 2): string {
  const names = name.trim().split(/\s+/)
  return names
    .slice(0, maxLength)
    .map(n => n[0]?.toUpperCase())
    .join('')
}

/**
 * Проверка валидности UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Извлечь timestamp из UUID v1 (если возможно)
 */
export function extractTimestampFromId(id: string): number | null {
  if (!isValidUuid(id)) return null
  
  const parts = id.split('-')
  if (parts.length !== 5) return null
  
  const timestampHex = parts[2].substring(1) + parts[1] + parts[0]
  const timestamp = parseInt(timestampHex, 16)
  
  if (isNaN(timestamp)) return null
  
  const unixTimestamp = Math.floor((timestamp - 0x01b21dd213814000) / 10000)
  return unixTimestamp > 0 ? unixTimestamp : null
}
