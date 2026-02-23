/**
 * Типы ошибок аутентификации
 */
export type AuthErrorCode =
  | 'invalid-email'
  | 'weak-password'
  | 'password-mismatch'
  | 'terms-not-accepted'
  | 'email-in-use'
  | 'user-not-found'
  | 'wrong-password'
  | 'invalid-token'
  | 'token-expired'
  | 'unauthorized'
  | 'network-error'
  | 'unknown'

export interface AuthErrorData {
  code: AuthErrorCode
  message: string
  field?: string
}

export class AuthError extends Error {
  public readonly code: AuthErrorCode
  public readonly field?: string

  constructor(code: AuthErrorCode, message: string, field?: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.field = field
  }

  static isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError
  }

  /**
   * Создание ошибки из ответа API
   */
  static fromApiError(code: string, message: string, field?: string): AuthError {
    const errorCode = code as AuthErrorCode
    return new AuthError(errorCode, message, field)
  }
}

/**
 * Утилита для валидации email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Утилита для валидации пароля
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

/**
 * Проверка сложности пароля
 */
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else feedback.push('Минимум 8 символов')

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Заглавные и строчные буквы')
  }

  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Хотя бы одна цифра')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Специальный символ')
  }

  return { score, feedback }
}
