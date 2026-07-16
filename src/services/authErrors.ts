/**
 * Authentication error types
 */
export type AuthErrorCode =
  | 'invalid-email'
  | 'weak-password'
  | 'password-mismatch'
  | 'locked-out'
  | 'terms-not-accepted'
  | 'email-in-use'
  | 'user-not-found'
  | 'wrong-password'
  | 'email-not-confirmed'
  | 'invalid-token'
  | 'token-expired'
  | 'unauthorized'
  | 'network-error'
  | 'crypto-unavailable'
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
   * Create error from API response
   */
  static fromApiError(code: string, message: string, field?: string): AuthError {
    const errorCode = code as AuthErrorCode
    return new AuthError(errorCode, message, field)
  }
}

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Email validation utility
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Minimum allowed password length
 */
export const MIN_PASSWORD_LENGTH = 8

/**
 * Password validation utility
 */
export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH
}

/**
 * Password strength check
 */
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
  estimatedCrackTime?: string
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= MIN_PASSWORD_LENGTH) score++
  else feedback.push(`Minimum ${MIN_PASSWORD_LENGTH} characters`)

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Uppercase and lowercase letters')
  }

  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('At least one digit')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Special character')
  }

  // Crack time estimation
  const entropy = password.length * Math.log2(94)
  const guessesPerSecond = 1e10
  const secondsToCrack = Math.pow(2, entropy) / guessesPerSecond
  
  let estimatedCrackTime: string | undefined
  if (secondsToCrack < 60) estimatedCrackTime = 'instantly'
  else if (secondsToCrack < 3600) estimatedCrackTime = `${Math.round(secondsToCrack / 60)} min`
  else if (secondsToCrack < 86400) estimatedCrackTime = `${Math.round(secondsToCrack / 3600)} hr`
  else if (secondsToCrack < 31536000) estimatedCrackTime = `${Math.round(secondsToCrack / 86400)} days`
  else estimatedCrackTime = '> 1 year'

  return { score, feedback, estimatedCrackTime }
}
