/**
 * usePerformanceOptimizer — Хук для оптимизации производительности
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useCallback, useRef, useEffect } from 'react'
import { logger } from '../utils/logger'

interface UseDebounceOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

interface UseThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

/**
 * Debounce хук с расширенными опциями
 */
export function useDebounce<TFunc extends (...args: Parameters<TFunc>) => ReturnType<TFunc>>(
  func: TFunc,
  wait: number,
  options: UseDebounceOptions = {}
): TFunc & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true, maxWait } = options
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallTimeRef = useRef<number | null>(null)
  const lastInvokeTimeRef = useRef<number>(0)
  const funcRef = useRef<TFunc>(func)
  const argsRef = useRef<Parameters<TFunc> | null>(null)
  
  funcRef.current = func

  const shouldInvoke = useCallback((time: number) => {
    if (lastCallTimeRef.current === null) return true
    
    const timeSinceLastCall = time - lastCallTimeRef.current
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current
    
    return (
      timeSinceLastCall >= wait ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }, [wait, maxWait])

  const invokeFunc = useCallback((time: number) => {
    const savedArgs = argsRef.current
    const savedFunc = funcRef.current

    if (savedArgs && savedFunc) {
      lastInvokeTimeRef.current = time
      savedFunc(...(savedArgs as Parameters<TFunc>))
    }
  }, [])

  const trailingEdge = useCallback((time: number) => {
    timeoutRef.current = null
    
    if (trailing && argsRef.current) {
      invokeFunc(time)
    }
    
    argsRef.current = null
  }, [trailing, invokeFunc])

  const timerExpired = useCallback(() => {
    const time = Date.now()
    
    if (shouldInvoke(time)) {
      trailingEdge(time)
      return
    }
    
    const timeSinceLastCall = lastCallTimeRef.current !== null ? time - lastCallTimeRef.current : 0
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current
    const remainingWait = wait - timeSinceLastCall
    
    timeoutRef.current = setTimeout(timerExpired, Math.min(remainingWait, maxWait !== undefined ? maxWait - timeSinceLastInvoke : remainingWait))
  }, [shouldInvoke, wait, maxWait, trailingEdge])

  const debounced = useCallback((...args: Parameters<TFunc>) => {
    const time = Date.now()
    lastCallTimeRef.current = time
    argsRef.current = args
    
    const isInvoking = shouldInvoke(time)
    
    if (isInvoking) {
      if (timeoutRef.current === null && leading) {
        invokeFunc(time)
      } else {
        timeoutRef.current = setTimeout(timerExpired, wait)
      }
    } else if (trailing && timeoutRef.current === null) {
      timeoutRef.current = setTimeout(timerExpired, wait)
    }
  }, [shouldInvoke, leading, trailing, wait, invokeFunc, timerExpired])

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    argsRef.current = null
    lastCallTimeRef.current = null
  }, [])

  const flush = useCallback(() => {
    if (timeoutRef.current !== null) {
      const time = Date.now()
      trailingEdge(time)
    }
  }, [trailingEdge])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Добавляем методы cancel и flush
  const debouncedWithMethods = debounced as TFunc & {
    cancel: () => void
    flush: () => void
  }
  
  debouncedWithMethods.cancel = cancel
  debouncedWithMethods.flush = flush
  
  return debouncedWithMethods
}

/**
 * Throttle хук с расширенными опциями
 */
export function useThrottle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number,
  options: UseThrottleOptions = {}
): T {
  const { leading = true, trailing = true } = options
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallTimeRef = useRef<number | null>(null)
  const funcRef = useRef<T>(func)
  
  funcRef.current = func

  const throttled = useCallback((...args: Parameters<T>) => {
    const time = Date.now()
    const timeSinceLastCall = lastCallTimeRef.current !== null ? time - lastCallTimeRef.current : 0
    
    if (timeSinceLastCall >= wait) {
      lastCallTimeRef.current = time
      funcRef.current(...args)
    } else if (trailing && timeoutRef.current === null) {
      timeoutRef.current = setTimeout(() => {
        lastCallTimeRef.current = time
        funcRef.current(...args)
        timeoutRef.current = null
      }, wait - timeSinceLastCall)
    } else if (leading && timeoutRef.current === null) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
      }, wait)
    }
  }, [wait, leading, trailing])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttled as T
}

/**
 * Хук для мемоизации значения с зависимостями по глубине
 * Выполняет глубокое сравнение зависимостей вместо поверхностного
 */
export function useDeepMemo<T>(value: () => T, deps: unknown[]): T {
  const ref = useRef<{ value: T; deps: unknown[] } | null>(null)

  const isEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) return true
    if (typeof a !== typeof b) return false
    if (a === null || b === null) return false
    if (typeof a !== 'object' || typeof b !== 'object') return false

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => isEqual(item, b[index]))
    }

    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)

    if (keysA.length !== keysB.length) return false

    return keysA.every(key => isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
  }

  const shouldUpdate =
    ref.current === null ||
    deps.length !== ref.current.deps.length ||
    !deps.every((dep, index) => {
      const currentDep = ref.current?.deps[index]
      return currentDep !== undefined && isEqual(dep, currentDep)
    })

  if (shouldUpdate) {
    ref.current = { value: value(), deps }
  }

  // Use explicit null check instead of nullish coalescing to avoid
  // double-calling value() when the memoized result is falsy (0, '', false, null)
  return ref.current !== null ? ref.current.value : (value() as T)
}

/**
 * Хук для оптимизированного вызова callback
 */
export function useOptimizedRender(
  callback: () => void,
  _dependencies: unknown[],
  options: { debounceMs?: number; throttleMs?: number } = {}
) {
  const { debounceMs, throttleMs } = options

  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const optimizedCallback = useRef<(() => void) | null>(null)

  if (optimizedCallback.current === null) {
    if (debounceMs !== undefined) {
      let timeout: ReturnType<typeof setTimeout> | null = null
      optimizedCallback.current = () => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => callbackRef.current(), debounceMs)
      }
    } else if (throttleMs !== undefined) {
      let lastCall = 0
      let timeout: ReturnType<typeof setTimeout> | null = null
      optimizedCallback.current = () => {
        const now = Date.now()
        const timeSinceLastCall = now - lastCall
        if (timeSinceLastCall >= throttleMs) {
          lastCall = now
          callbackRef.current()
        } else if (!timeout) {
          timeout = setTimeout(() => {
            lastCall = Date.now()
            callbackRef.current()
            timeout = null
          }, throttleMs - timeSinceLastCall)
        }
      }
    } else {
      optimizedCallback.current = () => callbackRef.current()
    }
  }

  return optimizedCallback.current
}

/**
 * Хук для измерения производительности функции
 */
export function usePerformanceMeasure<T extends (...args: unknown[]) => unknown>(
  func: T,
  label: string
): T {
  const funcRef = useRef<T>(func)
  funcRef.current = func
  
  const measuredFunc = useCallback((...args: unknown[]) => {
    const startTime = performance.now()
    const result = funcRef.current(...args)
    const endTime = performance.now()
    
    // Используем warn вместо log
    logger.warn(`[Performance] ${label}: ${(endTime - startTime).toFixed(2)}ms`)
    
    return result
  }, [label]) as T
  
  return measuredFunc
}

/**
 * Хук для предотвращения лишних ререндеров
 */
export function useShouldComponentUpdate<T extends Record<string, unknown>>(
  prevProps: T,
  nextProps: T,
  keysToCompare?: (keyof T)[]
): boolean {
  const keys = keysToCompare || (Object.keys(prevProps) as (keyof T)[])
  
  return keys.some(key => prevProps[key] !== nextProps[key])
}
