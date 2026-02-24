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
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual({
      count: 5,
      name: 'updated',
    })
  })
})
