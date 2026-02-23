import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionStorage } from '../hooks/useSessionStorage'

describe('useSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('должен возвращать начальное значение', () => {
    const { result } = renderHook(() => useSessionStorage('test', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('должен сохранять значение', () => {
    const { result } = renderHook(() => useSessionStorage('test', 'default'))

    act(() => {
      result.current[1]('new value')
    })

    expect(result.current[0]).toBe('new value')
    expect(sessionStorage.getItem('test')).toBe(JSON.stringify('new value'))
  })

  it('должен читать существующее значение из sessionStorage', () => {
    sessionStorage.setItem('test', JSON.stringify('existing'))

    const { result } = renderHook(() => useSessionStorage('test', 'default'))
    expect(result.current[0]).toBe('existing')
  })

  it('должен удалять значение', () => {
    const { result } = renderHook(() => useSessionStorage('test', 'default'))

    act(() => {
      result.current[1]('value')
    })

    act(() => {
      result.current[2]()
    })

    expect(result.current[0]).toBe('default')
    expect(sessionStorage.getItem('test')).toBeNull()
  })

  it('должен обновлять значение функцией', () => {
    const { result } = renderHook(() => useSessionStorage('count', 0))

    act(() => {
      result.current[1](prev => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it('должен работать с объектами', () => {
    const obj = { name: 'test', value: 42 }
    const { result } = renderHook(() => useSessionStorage('obj', obj))

    act(() => {
      result.current[1]({ name: 'updated', value: 100 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', value: 100 })
  })
})
