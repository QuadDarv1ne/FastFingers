/**
 * Утилиты для валидации данных
 */

import { logger } from './logger'

/**
 * Проверка email на валидность
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Проверка пароля на сложность
 * Требования: минимум 8 символов, 1 заглавная, 1 строчная, 1 цифра
 */
export function isPasswordStrong(password: string): boolean {
  if (!password || typeof password !== 'string') return false
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

/**
 * Получить оценку сложности пароля (0-4)
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0
  
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
  if (!username || typeof username !== 'string') return false
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username.trim())
}

/**
 * Проверка URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    new URL(url)
    return true
  } catch (err) {
    logger.warn(`isValidUrl failed for url="${url}"`, err)
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
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}


