/**
 * Утилиты для валидации данных
 */

/**
 * Проверка email на валидность
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Проверка пароля на сложность
 * Требования: минимум 8 символов, 1 заглавная, 1 строчная, 1 цифра
 */
export function isPasswordStrong(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

/**
 * Получить оценку сложности пароля (0-4)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++

  return Math.min(4, strength)
}

/**
 * Проверка имени пользователя
 * Требования: 3-20 символов, только буквы, цифры, подчёркивание
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * Проверка телефона (российский формат)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
  return phoneRegex.test(phone)
}

/**
 * Очистить телефон от лишних символов
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

/**
 * Проверка URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Проверка на пустое значение
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Обрезать строку до максимальной длины
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Маска для кредитной карты
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '')
  const masked = cleaned.slice(-4).padStart(cleaned.length, '*')
  return masked.replace(/(\d{4})/g, '$1 ').trim()
}
