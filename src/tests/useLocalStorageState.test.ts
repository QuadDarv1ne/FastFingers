import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'

describe('useLocalStorageState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with default value', () => {
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', 'default')
    )
    expect(result.current[0]).toBe('default')
  })

  it('should load value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', 'default')
    )
    expect(result.current[0]).toBe('stored-value')
  })

  it('should update localStorage when state changes', () => {
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', 'initial')
    )

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
  })

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', 10))

    act(() => {
      result.current[1](prev => prev + 5)
    })

    expect(result.current[0]).toBe(15)
  })

  it('should work with complex objects', () => {
    const defaultValue = { count: 0, name: 'test' }
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', defaultValue)
    )

    act(() => {
      result.current[1]({ count: 5, name: 'updated' })
    })

    expect(result.current[0]).toEqual({ count: 5, name: 'updated' })
    const stored = localStorage.getItem('test-key')
    expect(stored).not.toBeNull()
    if (stored) {
      expect(JSON.parse(stored)).toEqual({
        count: 5,
        name: 'updated',
      })
    }
  })

  it('should use default value when localStorage has invalid JSON', () => {
    localStorage.setItem('test-key', 'invalid-json')
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', 'default')
    )
    expect(result.current[0]).toBe('default')
  })

  it('should use default value when localStorage throws error', () => {
    const originalGetItem = Storage.prototype.getItem
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('Storage error')
    })
    
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', 'default')
    )
    
    expect(result.current[0]).toBe('default')
    Storage.prototype.getItem = originalGetItem
  })

  it('should silently handle save errors', () => {
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('Storage error')
    })
    
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', 'default')
    )
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
    Storage.prototype.setItem = originalSetItem
  })

  it('should remove item from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('value'))
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', 'default')
    )
    
    expect(result.current[0]).toBe('value')
    
    act(() => {
      result.current[2]()
    })
    
    expect(result.current[0]).toBe('default')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('default'))
  })

  it('should handle remove errors silently', () => {
    const originalRemoveItem = Storage.prototype.removeItem
    Storage.prototype.removeItem = vi.fn(() => {
      throw new Error('Remove error')
    })
    
    const { result } = renderHook(() =>
      useLocalStorageState('test-key', 'default')
    )
    
    act(() => {
      result.current[2]()
    })
    
    expect(result.current[0]).toBe('default')
    Storage.prototype.removeItem = originalRemoveItem
  })

  it('should persist value across multiple hook instances', () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorageState('shared-key', 'default')
    )
    
    act(() => {
      result1.current[1]('shared-value')
    })
    
    const { result: result2 } = renderHook(() =>
      useLocalStorageState('shared-key', 'default')
    )
    
    expect(result2.current[0]).toBe('shared-value')
  })

  it('should handle array values', () => {
    const { result } = renderHook(() =>
      useLocalStorageState('array-key', [1, 2, 3])
    )
    
    act(() => {
      result.current[1]([4, 5, 6])
    })
    
    expect(result.current[0]).toEqual([4, 5, 6])
    expect(JSON.parse(localStorage.getItem('array-key') as string)).toEqual([4, 5, 6])
  })

  it('should handle null values', () => {
    const { result } = renderHook(() =>
      useLocalStorageState('null-key', null)
    )
    
    act(() => {
      result.current[1](null)
    })
    
    expect(result.current[0]).toBeNull()
  })

  it('should handle boolean values', () => {
    const { result } = renderHook(() =>
      useLocalStorageState('bool-key', true)
    )
    
    act(() => {
      result.current[1](false)
    })
    
    expect(result.current[0]).toBe(false)
  })
})
