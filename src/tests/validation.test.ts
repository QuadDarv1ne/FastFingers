import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isPasswordStrong,
  getPasswordStrength,
  isValidUsername,
  isValidPhone,
  cleanPhone,
  isValidUrl,
  isEmpty,
  truncate,
  maskCardNumber,
} from '../utils/validation'

describe('validation utils', () => {
  describe('isValidEmail', () => {
    it('должен принимать валидные email', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.org')).toBe(true)
    })

    it('должен отклонять невалидные email', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('isPasswordStrong', () => {
    it('должен принимать сложные пароли', () => {
      expect(isPasswordStrong('Password1')).toBe(true)
      expect(isPasswordStrong('Str0ngPass')).toBe(true)
    })

    it('должен отклонять простые пароли', () => {
      expect(isPasswordStrong('password')).toBe(false)
      expect(isPasswordStrong('12345678')).toBe(false)
      expect(isPasswordStrong('Short1')).toBe(false)
    })
  })

  describe('getPasswordStrength', () => {
    it('должен возвращать 0 для пустого пароля', () => {
      expect(getPasswordStrength('')).toBe(0)
    })

    it('должен возвращать 4 для очень сложного пароля', () => {
      expect(getPasswordStrength('Str0ng_Pass!')).toBe(4)
    })
  })

  describe('isValidUsername', () => {
    it('должен принимать валидные имена', () => {
      expect(isValidUsername('user123')).toBe(true)
      expect(isValidUsername('test_user')).toBe(true)
    })

    it('должен отклонять невалидные имена', () => {
      expect(isValidUsername('ab')).toBe(false)
      expect(isValidUsername('user-name')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('должен принимать российские номера', () => {
      expect(isValidPhone('+7 999 123-45-67')).toBe(true)
      expect(isValidPhone('8 999 123 45 67')).toBe(true)
    })
  })

  describe('cleanPhone', () => {
    it('должен очищать номер от лишних символов', () => {
      expect(cleanPhone('+7 (999) 123-45-67')).toBe('+79991234567')
      expect(cleanPhone('8-999-123-45-67')).toBe('89991234567')
    })
  })

  describe('isValidUrl', () => {
    it('должен принимать валидные URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
    })

    it('должен отклонять невалидные URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('должен возвращать true для пустых значений', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('должен возвращать false для непустых значений', () => {
      expect(isEmpty('text')).toBe(false)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ key: 'value' })).toBe(false)
    })
  })

  describe('truncate', () => {
    it('должен обрезать длинные строки', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...')
    })

    it('должен возвращать короткие строки без изменений', () => {
      expect(truncate('Hi', 5)).toBe('Hi')
    })
  })

  describe('maskCardNumber', () => {
    it('должен маскировать номер карты', () => {
      expect(maskCardNumber('1234567890123456')).toBe('************3456')
    })
  })
})
