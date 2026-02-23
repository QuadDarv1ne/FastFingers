import { describe, it, expect } from 'vitest'
import {
  generateId,
  generateShortId,
  generateNumericId,
  generateSlug,
  generateColorFromString,
  getInitials,
} from '../utils/id'

describe('id utils', () => {
  describe('generateId', () => {
    it('должен генерировать уникальный ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })
  })

  describe('generateShortId', () => {
    it('должен генерировать короткий ID', () => {
      const id = generateShortId()
      expect(id).toHaveLength(8)
      expect(id).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('должен поддерживать разную длину', () => {
      expect(generateShortId(4)).toHaveLength(4)
      expect(generateShortId(16)).toHaveLength(16)
    })
  })

  describe('generateNumericId', () => {
    it('должен генерировать числовой ID', () => {
      const id = generateNumericId()
      expect(id).toHaveLength(6)
      expect(id).toMatch(/^\d+$/)
    })
  })

  describe('generateSlug', () => {
    it('должен создавать slug из строки', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('должен удалять специальные символы', () => {
      expect(generateSlug('Hello! @World#')).toBe('hello-world')
    })

    it('должен удалять лишние дефисы', () => {
      expect(generateSlug('  Hello   World  ')).toBe('hello-world')
    })
  })

  describe('generateColorFromString', () => {
    it('должен генерировать цвет из строки', () => {
      const color = generateColorFromString('test')
      expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
    })

    it('должен генерировать одинаковый цвет для одной строки', () => {
      const color1 = generateColorFromString('test')
      const color2 = generateColorFromString('test')
      expect(color1).toBe(color2)
    })
  })

  describe('getInitials', () => {
    it('должен получать инициалы из имени', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Иван Петров')).toBe('ИП')
    })

    it('должен поддерживать максимальную длину', () => {
      expect(getInitials('John Ronald Reuel Tolkien', 3)).toBe('JRR')
    })

    it('должен обрабатывать лишние пробелы', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD')
    })
  })
})
