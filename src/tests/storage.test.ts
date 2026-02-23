import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getFromStorage,
  setToStorage,
  removeFromStorage,
  clearStorage,
  getStorageKeys,
  getStorageSize,
} from '../utils/storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getFromStorage', () => {
    it('должен возвращать значение из localStorage', () => {
      localStorage.setItem('test', JSON.stringify('value'))
      const result = getFromStorage<string>('test')
      expect(result).toBe('value')
    })

    it('должен возвращать значение по умолчанию', () => {
      const result = getFromStorage('nonexistent', 'default')
      expect(result).toBe('default')
    })

    it('должен возвращать undefined если нет значения', () => {
      const result = getFromStorage('nonexistent')
      expect(result).toBeUndefined()
    })

    it('должен парсить объект', () => {
      const obj = { foo: 'bar', num: 42 }
      localStorage.setItem('obj', JSON.stringify(obj))
      const result = getFromStorage<typeof obj>('obj')
      expect(result).toEqual(obj)
    })
  })

  describe('setToStorage', () => {
    it('должен сохранять строку', () => {
      setToStorage('key', 'value')
      expect(localStorage.getItem('key')).toBe(JSON.stringify('value'))
    })

    it('должен сохранять число', () => {
      setToStorage('num', 42)
      expect(localStorage.getItem('num')).toBe('42')
    })

    it('должен сохранять объект', () => {
      const obj = { foo: 'bar' }
      setToStorage('obj', obj)
      expect(JSON.parse(localStorage.getItem('obj')!)).toEqual(obj)
    })

    it('должен удалять ключ при null значении', () => {
      localStorage.setItem('key', JSON.stringify('value'))
      setToStorage('key', null)
      expect(localStorage.getItem('key')).toBeNull()
    })

    it('должен удалять ключ при undefined значении', () => {
      localStorage.setItem('key', JSON.stringify('value'))
      setToStorage('key', undefined)
      expect(localStorage.getItem('key')).toBeNull()
    })
  })

  describe('removeFromStorage', () => {
    it('должен удалять ключ', () => {
      localStorage.setItem('key', JSON.stringify('value'))
      removeFromStorage('key')
      expect(localStorage.getItem('key')).toBeNull()
    })
  })

  describe('clearStorage', () => {
    it('должен вызывать localStorage.clear', () => {
      const clearSpy = vi.spyOn(localStorage, 'clear')
      clearStorage()
      expect(clearSpy).toHaveBeenCalled()
      clearSpy.mockRestore()
    })
  })

  describe('getStorageKeys', () => {
    it('должен возвращать массив', () => {
      const keys = getStorageKeys()
      expect(Array.isArray(keys)).toBe(true)
    })
  })

  describe('getStorageSize', () => {
    it('должен возвращать число', () => {
      setToStorage('testKey', 'testValue')
      const size = getStorageSize()
      expect(typeof size).toBe('number')
    })
  })
})
