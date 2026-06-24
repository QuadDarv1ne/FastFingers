import { describe, it, expect } from 'vitest'
import { AuthError, isValidEmail, isValidPassword, checkPasswordStrength } from '../services/authErrors'

describe('AuthError', () => {
  describe('constructor', () => {
    it('creates error with code and message', () => {
      const error = new AuthError('invalid-email', 'Invalid email')

      expect(error.name).toBe('AuthError')
      expect(error.code).toBe('invalid-email')
      expect(error.message).toBe('Invalid email')
    })

    it('creates error with field', () => {
      const error = new AuthError('weak-password', 'Weak password', 'password')

      expect(error.field).toBe('password')
    })
  })

  describe('isAuthError', () => {
    it('returns true for AuthError', () => {
      const error = new AuthError('unknown', 'Error')
      expect(AuthError.isAuthError(error)).toBe(true)
    })

    it('returns false for other errors', () => {
      const error = new Error('Regular error')
      expect(AuthError.isAuthError(error)).toBe(false)
    })

    it('returns false for null/undefined', () => {
      expect(AuthError.isAuthError(null)).toBe(false)
      expect(AuthError.isAuthError(undefined)).toBe(false)
    })
  })

  describe('fromApiError', () => {
    it('creates error from API response', () => {
      const error = AuthError.fromApiError('email-in-use', 'Email taken', 'email')

      expect(error.code).toBe('email-in-use')
      expect(error.message).toBe('Email taken')
      expect(error.field).toBe('email')
    })
  })
})

describe('isValidEmail', () => {
  it('returns true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.org')).toBe(true)
    expect(isValidEmail('test+tag@example.co.uk')).toBe(true)
  })

  it('returns false for invalid emails', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('invalid @example.com')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('returns true for passwords 8+ characters', () => {
    expect(isValidPassword('12345678')).toBe(true)
    expect(isValidPassword('password123')).toBe(true)
    expect(isValidPassword('verylongpassword')).toBe(true)
  })

  it('returns false for passwords shorter than 8', () => {
    expect(isValidPassword('')).toBe(false)
    expect(isValidPassword('1234567')).toBe(false)
    expect(isValidPassword('short')).toBe(false)
  })
})

describe('checkPasswordStrength', () => {
  it('evaluates weak passwords', () => {
    const result = checkPasswordStrength('12345678')

    expect(result.score).toBeGreaterThanOrEqual(1)
    expect(result.feedback).toContain('Uppercase and lowercase letters')
  })

  it('evaluates medium passwords', () => {
    const result = checkPasswordStrength('Password1')

    expect(result.score).toBeGreaterThanOrEqual(2)
  })

  it('evaluates strong passwords', () => {
    const result = checkPasswordStrength('P@ssw0rd!')

    expect(result.score).toBe(4)
    expect(result.feedback).toHaveLength(0)
  })

  it('returns feedback for short password', () => {
    const result = checkPasswordStrength('Ab1!')

    expect(result.feedback).toContain('Minimum 8 characters')
  })
})
