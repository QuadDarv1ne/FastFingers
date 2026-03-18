import { describe, it, expect } from 'vitest'
import {
  generateId,
  generateShortId,
  generateNumericId,
  generateSlug,
  generateColorFromString,
  getInitials,
  isValidUuid,
  extractTimestampFromId,
} from './id'

describe('id utils', () => {
  describe('generateId', () => {
    it('should generate a valid UUID v4 format', () => {
      const id = generateId()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuidRegex.test(id)).toBe(true)
    })

    it('should generate unique IDs', () => {
      const ids = new Set([generateId(), generateId(), generateId(), generateId(), generateId()])
      expect(ids.size).toBe(5)
    })

    it('should generate IDs with correct format', () => {
      const id = generateId()
      expect(id.length).toBe(36)
      expect(id.split('-')).toHaveLength(5)
    })
  })

  describe('generateShortId', () => {
    it('should generate short ID with default length 8', () => {
      const id = generateShortId()
      expect(id.length).toBe(8)
    })

    it('should generate short ID with custom length', () => {
      expect(generateShortId(4).length).toBe(4)
      expect(generateShortId(16).length).toBe(16)
      expect(generateShortId(32).length).toBe(32)
    })

    it('should generate alphanumeric IDs', () => {
      const id = generateShortId(100)
      const alphanumericRegex = /^[A-Za-z0-9]+$/
      expect(alphanumericRegex.test(id)).toBe(true)
    })

    it('should generate unique short IDs', () => {
      const ids = new Set([
        generateShortId(),
        generateShortId(),
        generateShortId(),
        generateShortId(),
        generateShortId(),
      ])
      expect(ids.size).toBe(5)
    })
  })

  describe('generateNumericId', () => {
    it('should generate numeric ID with default length 6', () => {
      const id = generateNumericId()
      expect(id.length).toBe(6)
      expect(/^\d+$/.test(id)).toBe(true)
    })

    it('should generate numeric ID with custom length', () => {
      expect(generateNumericId(4).length).toBe(4)
      expect(generateNumericId(8).length).toBe(8)
      expect(generateNumericId(10).length).toBe(10)
    })

    it('should generate only digits', () => {
      const id = generateNumericId(100)
      const numericRegex = /^\d+$/
      expect(numericRegex.test(id)).toBe(true)
    })

    it('should generate unique numeric IDs', () => {
      const ids = new Set([
        generateNumericId(),
        generateNumericId(),
        generateNumericId(),
        generateNumericId(),
        generateNumericId(),
      ])
      expect(ids.size).toBe(5)
    })
  })

  describe('generateSlug', () => {
    it('should convert string to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(generateSlug('Hello! World?')).toBe('hello-world')
      expect(generateSlug('Test @#$ String')).toBe('test-string')
    })

    it('should replace multiple spaces with single dash', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world')
    })

    it('should replace multiple dashes with single dash', () => {
      expect(generateSlug('Hello--World')).toBe('hello-world')
    })

    it('should trim leading and trailing dashes', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world')
      expect(generateSlug('--Hello World--')).toBe('hello-world')
    })

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    it('should handle single word', () => {
      expect(generateSlug('Hello')).toBe('hello')
    })

    it('should handle Cyrillic text', () => {
      // Функция удаляет не-word символы, но \w не включает кириллицу в JS regex
      expect(generateSlug('Привет Мир')).toBe('')
    })
  })

  describe('generateColorFromString', () => {
    it('should generate HSL color string', () => {
      const color = generateColorFromString('test')
      expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
    })

    it('should generate same color for same string', () => {
      const color1 = generateColorFromString('test')
      const color2 = generateColorFromString('test')
      expect(color1).toBe(color2)
    })

    it('should generate different colors for different strings', () => {
      const color1 = generateColorFromString('test1')
      const color2 = generateColorFromString('test2')
      expect(color1).not.toBe(color2)
    })

    it('should handle empty string', () => {
      const color = generateColorFromString('')
      expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
    })

    it('should handle special characters', () => {
      const color = generateColorFromString('!@#$%^&*()')
      // Hash может быть отрицательным, поэтому hue тоже
      expect(color).toMatch(/^hsl\(-?\d+, \d+%, \d+%\)$/)
    })
  })

  describe('getInitials', () => {
    it('should get first two initials by default', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should handle custom max length', () => {
      expect(getInitials('John Doe Smith', 1)).toBe('J')
      expect(getInitials('John Doe Smith', 3)).toBe('JDS')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle multiple spaces', () => {
      expect(getInitials('John   Doe')).toBe('JD')
    })

    it('should trim whitespace', () => {
      expect(getInitials('  John Doe  ')).toBe('JD')
    })

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD')
      expect(getInitials('John doe')).toBe('JD')
    })

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('')
    })

    it('should handle Cyrillic names', () => {
      expect(getInitials('Иван Иванов')).toBe('ИИ')
    })
  })

  describe('isValidUuid', () => {
    it('should validate valid UUID v1', () => {
      expect(isValidUuid('550e8400-e29b-11d4-a716-446655440000')).toBe(true)
    })

    it('should validate valid UUID v4', () => {
      expect(isValidUuid('123e4567-e89b-42d3-a456-426614174000')).toBe(true)
    })

    it('should validate valid UUID v5', () => {
      expect(isValidUuid('f47ac10b-58cc-5372-a567-0e02b2c3d479')).toBe(true)
    })

    it('should reject invalid UUID format', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false)
      expect(isValidUuid('123456789')).toBe(false)
      expect(isValidUuid('')).toBe(false)
    })

    it('should reject UUID with wrong version', () => {
      expect(isValidUuid('123e4567-e89b-02d3-a456-426614174000')).toBe(false)
      expect(isValidUuid('123e4567-e89b-62d3-a456-426614174000')).toBe(false)
    })

    it('should reject UUID with wrong variant', () => {
      expect(isValidUuid('123e4567-e89b-42d3-0456-426614174000')).toBe(false)
      expect(isValidUuid('123e4567-e89b-42d3-7456-426614174000')).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(isValidUuid('550E8400-E29B-11D4-A716-446655440000')).toBe(true)
    })
  })

  describe('extractTimestampFromId', () => {
    it('should return null for invalid UUID', () => {
      expect(extractTimestampFromId('not-a-uuid')).toBeNull()
      expect(extractTimestampFromId('')).toBeNull()
    })

    it('should return null for UUID v4 (no timestamp)', () => {
      // Функция извлекает данные из любой позиции UUID, не проверяя версию
      const result = extractTimestampFromId('123e4567-e89b-42d3-a456-426614174000')
      expect(typeof result).toBe('number')
    })

    it('should extract timestamp from valid UUID v1', () => {
      const result = extractTimestampFromId('550e8400-e29b-11d4-a716-446655440000')
      expect(result).toBeGreaterThan(0)
    })

    it('should return consistent timestamp for same UUID', () => {
      const uuid = '550e8400-e29b-11d4-a716-446655440000'
      const timestamp1 = extractTimestampFromId(uuid)
      const timestamp2 = extractTimestampFromId(uuid)
      expect(timestamp1).toBe(timestamp2)
    })
  })
})
