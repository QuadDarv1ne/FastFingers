/**
 * Утилиты для debounce и throttle
 */

export interface DebounceOptions {
  /** Вызывать ли при leading edge */
  leading?: boolean
  /** Вызывать ли при trailing edge */
  trailing?: boolean
}

export interface ThrottleOptions {
  /** Вызывать ли при leading edge */
  leading?: boolean
  /** Вызывать ли при trailing edge */
  trailing?: boolean
}

/**
 * Функция с debounce (отсрочка вызова)
 * 
 * @example
 * const search = debounce((query) => {
 *   fetchResults(query)
 * }, 300)
 * 
 * @param func - Функция для вызова
 * @param wait - Задержка в мс
 * @param options - Опции
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = false, trailing = true } = options

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: unknown | null = null
  let result: ReturnType<T> | null = null

  const invokeFunc = (_time: number) => {
    const args = lastArgs!
    const thisArg = lastThis

    lastArgs = lastThis = null
    result = func.apply(thisArg, args) as ReturnType<T>

    return result
  }

  const later = (_time: number) => {
    timeoutId = null
    if (trailing && lastArgs) {
      result = invokeFunc(_time)
    }
    lastArgs = lastThis = null
    return result
  }

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    const isInvoking = leading && !timeoutId

    lastArgs = args
    lastThis = this

    if (isInvoking) {
      result = func.apply(this, args) as ReturnType<T>
      timeoutId = setTimeout(() => {
        timeoutId = null
      }, wait)
    } else if (trailing) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        later(Date.now())
      }, wait)
    }

    return result
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = null
    lastArgs = lastThis = null
  }

  debounced.flush = () => {
    if (timeoutId) {
      result = invokeFunc(Date.now())
      clearTimeout(timeoutId)
      timeoutId = null
    }
    return result
  }

  return debounced
}

/**
 * Функция с throttle (ограничение частоты вызовов)
 *
 * @example
 * const handleScroll = throttle(() => {
 *   updateScrollPosition()
 * }, 100)
 *
 * @param func - Функция для вызова
 * @param limit - Минимальный интервал между вызовами в мс
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const { trailing = true } = options

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: unknown | null = null
  let result: ReturnType<T> | null = null
  let lastCallTime = 0

  const invokeFunc = (time: number) => {
    const args = lastArgs!
    const thisArg = lastThis

    lastArgs = lastThis = null
    lastCallTime = time
    result = func.apply(thisArg, args) as ReturnType<T>

    return result
  }

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const time = Date.now()
    const remaining = limit - (time - lastCallTime)

    lastArgs = args
    lastThis = this

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      result = invokeFunc(time)
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        timeoutId = null
        result = invokeFunc(Date.now())
        lastArgs = lastThis = null
      }, remaining)
    }

    return result
  }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = null
    lastCallTime = 0
    lastArgs = lastThis = null
  }

  throttled.flush = () => {
    if (timeoutId) {
      result = invokeFunc(Date.now())
      clearTimeout(timeoutId)
      timeoutId = null
    }
    return result
  }

  return throttled
}

/**
 * Асинхронная функция с debounce
 * 
 * @example
 * const search = debounceAsync(async (query) => {
 *   return await fetchResults(query)
 * }, 300)
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) & {
  cancel: () => void
  flush: () => Promise<Awaited<ReturnType<T>> | null>
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastPromise: Promise<Awaited<ReturnType<T>> | null> | null = null

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    lastPromise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func.apply(this, args)
          resolve(result as Awaited<ReturnType<T>>)
        } catch (error) {
          reject(error)
        }
      }, wait)
    }) as Promise<Awaited<ReturnType<T>> | null>

    return lastPromise
  } as ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) & {
    cancel: () => void
    flush: () => Promise<Awaited<ReturnType<T>> | null>
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = null
    lastPromise = null
  }

  debounced.flush = async (): Promise<Awaited<ReturnType<T>> | null> => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      lastPromise = func() as Promise<Awaited<ReturnType<T>>>
    }
    return lastPromise
  }

  return debounced
}

/**
 * Хук для debounce в React компонентах
 *
 * @example
 * const debouncedSearch = useDebounce((query) => {
 *   setSearchQuery(query)
 * }, 300)
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T {
  return debounce(func, delay) as T
}
