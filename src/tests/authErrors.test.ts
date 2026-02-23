import { describe, it, expect } from 'vitest'
import { AuthError, isValidEmail, isValidPassword, checkPasswordStrength } from '../services/authErrors'

describe('AuthError', () => {
  describe('constructor', () => {
    it('должен создавать ошибку с кодом и сообщением', () => {
      const error = new AuthError('invalid-email', 'Неверный email')
      
      expect(error.name).toBe('AuthError')
      expect(error.code).toBe('invalid-email')
      expect(error.message).toBe('Неверный email')
    })

    it('должен создавать ошибку с полем', () => {
      const error = new AuthError('weak-password', 'Слабый пароль', 'password')
      
      expect(error.field).toBe('password')
    })
  })

  describe('isAuthError', () => {
    it('должен возвращать true для AuthError', () => {
      const error = new AuthError('unknown', 'Ошибка')
      expect(AuthError.isAuthError(error)).toBe(true)
    })

    it('должен возвращать false для других ошибок', () => {
      const error = new Error('Обычная ошибка')
      expect(AuthError.isAuthError(error)).toBe(false)
    })

    it('должен возвращать false для null/undefined', () => {
      expect(AuthError.isAuthError(null)).toBe(false)
      expect(AuthError.isAuthError(undefined)).toBe(false)
    })
  })

  describe('fromApiError', () => {
    it('должен создавать ошибку из API ответа', () => {
      const error = AuthError.fromApiError('email-in-use', 'Email занят', 'email')
      
      expect(error.code).toBe('email-in-use')
      expect(error.message).toBe('Email занят')
      expect(error.field).toBe('email')
    })
  })
})

describe('isValidEmail', () => {
  it('должен возвращать true для валидных email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.org')).toBe(true)
    expect(isValidEmail('test+tag@example.co.uk')).toBe(true)
  })

  it('должен возвращать false для невалидных email', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('invalid @example.com')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('должен возвращать true для паролей от 8 символов', () => {
    expect(isValidPassword('12345678')).toBe(true)
    expect(isValidPassword('password123')).toBe(true)
    expect(isValidPassword('verylongpassword')).toBe(true)
  })

  it('должен возвращать false для паролей короче 8 символов', () => {
    expect(isValidPassword('')).toBe(false)
    expect(isValidPassword('1234567')).toBe(false)
    expect(isValidPassword('short')).toBe(false)
  })
})

describe('checkPasswordStrength', () => {
  it('должен оценивать слабые пароли', () => {
    const result = checkPasswordStrength('12345678')
    
    expect(result.score).toBeGreaterThanOrEqual(1)
    expect(result.feedback).toContain('Заглавные и строчные буквы')
  })

  it('должен оценивать средние пароли', () => {
    const result = checkPasswordStrength('Password1')
    
    expect(result.score).toBeGreaterThanOrEqual(2)
  })

  it('должен оценивать сильные пароли', () => {
    const result = checkPasswordStrength('P@ssw0rd!')
    
    expect(result.score).toBe(4)
    expect(result.feedback).toHaveLength(0)
  })

  it('должен возвращать feedback для короткого пароля', () => {
    const result = checkPasswordStrength('Ab1!')
    
    expect(result.feedback).toContain('Минимум 8 символов')
  })
})
