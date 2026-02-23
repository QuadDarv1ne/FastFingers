/**
 * Утилиты для генерации уникальных идентификаторов
 */

/**
 * Сгенерировать уникальный ID
 * Формат: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateId(): string {
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
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Сгенерировать числовой ID
 */
export function generateNumericId(length = 6): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10)
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
