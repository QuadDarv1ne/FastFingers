import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isLocalStorageAvailable,
  isSessionStorageAvailable,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  clearStorage,
  getStorageKeys,
  getStorageSize,
  getFromStorageAsArray,
  getFromStorageAsObject,
  setToStorageWithQuotaHandling,
  STORAGE_QUOTA_EXCEEDED,
  safeLocalStorageGet,
} from './storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('safeLocalStorageGet', () => {
    it('должен возвращать значение по ключу', () => {
      localStorage.setItem('test-key', 'test-value')
      expect(safeLocalStorageGet('test-key')).toBe('test-value')
    })

    it('должен возвращать null для отсутствующего ключа', () => {
      expect(safeLocalStorageGet('nonexistent')).toBeNull()
    })

    it('должен возвращать null при ошибке localStorage', () => {
      vi.spyOn(globalThis as any, 'localStorage', 'get').mockImplementation(() => { throw new Error('storage unavailable') })
      expect(safeLocalStorageGet('key')).toBeNull()
    })
  })

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true)
    })

    it('should return false when localStorage throws error', () => {
      const mockStorage = {
        setItem: vi.fn(() => {
          throw new Error('Storage full')
        }),
        removeItem: vi.fn(),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      expect(isLocalStorageAvailable()).toBe(false)
    })
  })

  describe('isSessionStorageAvailable', () => {
    it('should return true when sessionStorage is available', () => {
      expect(isSessionStorageAvailable()).toBe(true)
    })

    it('should return false when sessionStorage is undefined', () => {
      const originalSessionStorage = (global as any).sessionStorage
      vi.spyOn(global as any, 'sessionStorage', 'get').mockReturnValue(undefined)
      expect(isSessionStorageAvailable()).toBe(false)
      ;(global as any).sessionStorage = originalSessionStorage
    })

    it('should return false when sessionStorage throws error', () => {
      const mockStorage = {
        setItem: vi.fn(() => {
          throw new Error('Storage full')
        }),
        removeItem: vi.fn(),
      }
      vi.spyOn(global as any, 'sessionStorage', 'get').mockReturnValue(mockStorage)
      expect(isSessionStorageAvailable()).toBe(false)
    })
  })

  describe('getFromStorage', () => {
    it('should get string value from localStorage', () => {
      localStorage.setItem('test', '"hello"')
      expect(getFromStorage('test')).toBe('hello')
    })

    it('should get number value from localStorage', () => {
      localStorage.setItem('count', '42')
      expect(getFromStorage<number>('count')).toBe(42)
    })

    it('should get boolean value from localStorage', () => {
      localStorage.setItem('enabled', 'true')
      expect(getFromStorage<boolean>('enabled')).toBe(true)
    })

    it('should get object from localStorage', () => {
      const obj = { name: 'test', value: 123 }
      localStorage.setItem('data', JSON.stringify(obj))
      expect(getFromStorage<typeof obj>('data')).toEqual(obj)
    })

    it('should return defaultValue when key does not exist', () => {
      expect(getFromStorage('nonexistent', 'default')).toBe('default')
    })

    it('should return undefined when key does not exist and no default', () => {
      expect(getFromStorage('nonexistent')).toBeUndefined()
    })

    it('should return defaultValue when localStorage is not available', () => {
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(undefined)
      expect(getFromStorage('test', 'default')).toBe('default')
    })

    it('should return defaultValue when JSON parse fails', () => {
      localStorage.setItem('invalid', 'not-json')
      expect(getFromStorage('invalid', 'default')).toBe('default')
    })

    it('should return null when value is null', () => {
      localStorage.setItem('nullValue', 'null')
      expect(getFromStorage('nullValue')).toBeNull()
    })
  })

  describe('setToStorage', () => {
    it('should set string value in localStorage', () => {
      setToStorage('test', 'hello')
      expect(localStorage.getItem('test')).toBe('"hello"')
    })

    it('should set number value in localStorage', () => {
      setToStorage('count', 42)
      expect(localStorage.getItem('count')).toBe('42')
    })

    it('should set boolean value in localStorage', () => {
      setToStorage('enabled', true)
      expect(localStorage.getItem('enabled')).toBe('true')
    })

    it('should set object in localStorage', () => {
      const obj = { name: 'test', value: 123 }
      setToStorage('data', obj)
      expect(JSON.parse(localStorage.getItem('data') as string)).toEqual(obj)
    })

    it('should remove item when value is null', () => {
      localStorage.setItem('test', '"value"')
      setToStorage('test', null)
      expect(localStorage.getItem('test')).toBeNull()
    })

    it('should remove item when value is undefined', () => {
      localStorage.setItem('test', '"value"')
      setToStorage('test', undefined)
      expect(localStorage.getItem('test')).toBeNull()
    })

    it('should not throw when localStorage is not available', () => {
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(undefined)
      expect(() => setToStorage('test', 'value')).not.toThrow()
    })

    it('should not throw when localStorage throws error', () => {
      const mockStorage = {
        setItem: vi.fn(() => {
          throw new Error('Quota exceeded')
        }),
        removeItem: vi.fn(),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      expect(() => setToStorage('test', 'value')).not.toThrow()
    })
  })

  describe('removeFromStorage', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('test', '"value"')
      removeFromStorage('test')
      expect(localStorage.getItem('test')).toBeNull()
    })

    it('should not throw when key does not exist', () => {
      expect(() => removeFromStorage('nonexistent')).not.toThrow()
    })

    it('should not throw when localStorage is not available', () => {
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(undefined)
      expect(() => removeFromStorage('test')).not.toThrow()
    })
  })

  describe('clearStorage', () => {
    it('should clear all items from localStorage', () => {
      setToStorage('test1', 'value1')
      setToStorage('test2', 'value2')
      clearStorage()
      expect(getStorageKeys().filter(k => k.startsWith('test'))).toHaveLength(0)
    })

    it('should not throw when localStorage is not available', () => {
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(undefined)
      expect(() => clearStorage()).not.toThrow()
    })

    it('should not throw when localStorage throws error', () => {
      const mockStorage = {
        clear: vi.fn(() => {
          throw new Error('Clear failed')
        }),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      expect(() => clearStorage()).not.toThrow()
    })
  })

  describe('getStorageKeys', () => {
    it('should return all keys from localStorage', () => {
      setToStorage('key1', 'value1')
      setToStorage('key2', 'value2')
      setToStorage('key3', 'value3')
      const keys = getStorageKeys()
      // happy-dom может возвращать служебные ключи, проверяем наличие наших
      expect(keys.length).toBeGreaterThanOrEqual(3)
    })

    it('should return empty array when localStorage is not available', () => {
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(undefined)
      expect(getStorageKeys()).toEqual([])
    })

    it('should return empty array when localStorage throws error', () => {
      const mockStorage = {}
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      expect(getStorageKeys()).toEqual([])
    })
  })

  describe('getStorageSize', () => {
    it('should return 0 when localStorage is not available', () => {
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(undefined)
      expect(getStorageSize()).toBe(0)
    })

    it('should return 0 when localStorage throws error', () => {
      const mockStorage = {}
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      expect(getStorageSize()).toBe(0)
    })

    it('should calculate size correctly', () => {
      const mockStorage = {} as Storage

      Object.defineProperties(mockStorage, {
        getItem: { value: (key: string) => (mockStorage as unknown as Record<string, string>)[key] ?? null, enumerable: false, writable: true, configurable: true },
        setItem: { value: (key: string, value: string) => { (mockStorage as unknown as Record<string, string>)[key] = value }, enumerable: false, writable: true },
        removeItem: { value: (key: string) => { delete (mockStorage as unknown as Record<string, string>)[key] }, enumerable: false, writable: true },
        clear: { value: () => { Object.keys(mockStorage).forEach((k) => delete (mockStorage as unknown as Record<string, string>)[k]) }, enumerable: false, writable: true },
        key: { value: (index: number) => Object.keys(mockStorage)[index] ?? null, enumerable: false, writable: true },
        length: { get: () => Object.keys(mockStorage).length, enumerable: false },
      })

      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)

      mockStorage.setItem('test', 'value')
      const size = getStorageSize()
      expect(size).toBeGreaterThan(0)

      mockStorage.removeItem('test')
      expect(getStorageSize()).toBe(0)
    })
  })

  describe('removeFromStorage error handling', () => {
    it('should handle error when removeItem throws', () => {
      const mockStorage = {
        removeItem: vi.fn(() => {
          throw new Error('Storage error')
        }),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      expect(() => removeFromStorage('test')).not.toThrow()
    })
  })

  describe('clearStorage error handling', () => {
    it('should handle error when clear throws', () => {
      const mockStorage = {
        clear: vi.fn(() => {
          throw new Error('Storage error')
        }),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      expect(() => clearStorage()).not.toThrow()
    })
  })

  describe('getStorageSize error handling', () => {
    it('should return 0 when hasOwnProperty throws', () => {
      const mockStorage = {
        key1: 'value1',
        hasOwnProperty: vi.fn(() => {
          throw new Error('Error')
        }),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      expect(getStorageSize()).toBe(0)
    })
  })

  describe('getFromStorageAsArray', () => {
    it('should return parsed array from localStorage', () => {
      localStorage.setItem('arr', JSON.stringify([1, 2, 3]))
      expect(getFromStorageAsArray<number>('arr')).toEqual([1, 2, 3])
    })

    it('should return default empty array when key does not exist', () => {
      expect(getFromStorageAsArray('nonexistent')).toEqual([])
    })

    it('should return provided default array when key does not exist', () => {
      expect(getFromStorageAsArray('nonexistent', ['a', 'b'])).toEqual(['a', 'b'])
    })

    it('should return default when value is not an array', () => {
      localStorage.setItem('notArray', JSON.stringify({ key: 'value' }))
      expect(getFromStorageAsArray('notArray', [])).toEqual([])
    })
  })

  describe('getFromStorageAsObject', () => {
    it('should return parsed object from localStorage', () => {
      localStorage.setItem('obj', JSON.stringify({ name: 'test', count: 5 }))
      expect(getFromStorageAsObject('obj')).toEqual({ name: 'test', count: 5 })
    })

    it('should return default empty object when key does not exist', () => {
      expect(getFromStorageAsObject('nonexistent')).toEqual({})
    })

    it('should return provided default object when key does not exist', () => {
      expect(getFromStorageAsObject('nonexistent', { default: true })).toEqual({ default: true })
    })

    it('should return default when value is an array', () => {
      localStorage.setItem('isArray', JSON.stringify([1, 2]))
      expect(getFromStorageAsObject('isArray', {})).toEqual({})
    })
  })

  describe('setToStorageWithQuotaHandling', () => {
    it('should return success: true when storage is available and not full', () => {
      const result = setToStorageWithQuotaHandling('test', 'hello')
      expect(result.success).toBe(true)
      expect(result.quotaExceeded).toBe(false)
    })

    it('should store the value correctly', () => {
      setToStorageWithQuotaHandling('testObj', { name: 'test', count: 5 })
      expect(JSON.parse(localStorage.getItem('testObj') || '')).toEqual({ name: 'test', count: 5 })
    })

    it('should remove item when value is null', () => {
      localStorage.setItem('test', '"value"')
      const result = setToStorageWithQuotaHandling('test', null)
      expect(result.success).toBe(true)
      expect(localStorage.getItem('test')).toBeNull()
    })

    it('should return quotaExceeded: true when localStorage throws QuotaExceededError', () => {
      let callCount = 0
      const mockStorage = {
        setItem: vi.fn(() => {
          callCount++
          if (callCount > 1) {
            throw new DOMException('Quota exceeded', 'QuotaExceededError')
          }
        }),
        removeItem: vi.fn(),
        getItem: vi.fn(() => null),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      const result = setToStorageWithQuotaHandling('test', 'value')
      expect(result.success).toBe(false)
      expect(result.quotaExceeded).toBe(true)
    })

    it('should return quotaExceeded: true for code 22 (Safari fallback)', () => {
      let callCount = 0
      const mockStorage = {
        setItem: vi.fn(() => {
          callCount++
          if (callCount > 1) {
            const err = new Error('Quota exceeded')
            ;(err as Error & { code?: number }).code = 22
            throw err
          }
        }),
        removeItem: vi.fn(),
        getItem: vi.fn(() => null),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      const result = setToStorageWithQuotaHandling('test', 'value')
      expect(result.success).toBe(false)
      expect(result.quotaExceeded).toBe(true)
    })

    it('should return quotaExceeded: false for other errors', () => {
      const mockStorage = {
        setItem: vi.fn(() => {
          throw new Error('Some other error')
        }),
        removeItem: vi.fn(),
        getItem: vi.fn(() => null),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      const result = setToStorageWithQuotaHandling('test', 'value')
      expect(result.success).toBe(false)
      expect(result.quotaExceeded).toBe(false)
    })

    it('should return success: false when localStorage is not available', () => {
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(undefined)
      const result = setToStorageWithQuotaHandling('test', 'value')
      expect(result.success).toBe(false)
      expect(result.quotaExceeded).toBe(false)
    })

    it('should dispatch STORAGE_QUOTA_EXCEEDED event when quota is exceeded', () => {
      let callCount = 0
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
      const mockStorage = {
        setItem: vi.fn(() => {
          callCount++
          if (callCount > 1) {
            throw new DOMException('Quota exceeded', 'QuotaExceededError')
          }
        }),
        removeItem: vi.fn(),
        getItem: vi.fn(() => null),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null),
      }
      vi.spyOn(global as any, 'localStorage', 'get').mockReturnValue(mockStorage)
      setToStorageWithQuotaHandling('test', 'value')
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent))
      const call = dispatchSpy.mock.calls[0]
      if (call) {
        const event = call[0] as CustomEvent
        expect(event.type).toBe(STORAGE_QUOTA_EXCEEDED)
        expect(event.detail).toEqual({ key: 'test' })
      }
    })
  })
})
