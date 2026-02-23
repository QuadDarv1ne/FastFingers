import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, ApiError, NetworkError, TimeoutError } from '../services/apiClient'

interface UseApiState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isRefetching: boolean
}

interface UseApiOptions<T> {
  /** Автоматический запрос при монтировании */
  enabled?: boolean
  /** Интервал авто-обновления в мс */
  refetchInterval?: number
  /** Кэширование данных */
  cacheTime?: number
  /** Функция для преобразования данных */
  transform?: (data: unknown) => T
  /** Колбэк при успехе */
  onSuccess?: (data: T) => void
  /** Колбэк при ошибке */
  onError?: (error: Error) => void
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>
  reset: () => void
}

/**
 * Хук для выполнения API запросов с кэшированием и управлением состоянием
 * 
 * @example
 * const { data, isLoading, error, refetch } = useApi<User[]>('/users')
 * 
 * @example
 * const { data } = useApi<User>('/user/' + id, {
 *   enabled: !!id,
 *   cacheTime: 5 * 60 * 1000, // 5 минут
 * })
 */
export function useApi<T = unknown>(
  url: string | null,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    cacheTime = 5 * 60 * 1000, // 5 минут по умолчанию
    transform,
    onSuccess,
    onError,
  } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: enabled,
    isRefetching: false,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null)
  const intervalId = useRef<NodeJS.Timeout | null>(null)

  // Проверка кэша
  const isCached = useCallback((): boolean => {
    if (!cacheRef.current) return false
    return Date.now() - cacheRef.current.timestamp < cacheTime
  }, [cacheTime])

  const executeRequest = useCallback(async (isRefetch = false): Promise<void> => {
    if (!url) {
      setState(prev => ({ ...prev, isLoading: false, isRefetching: false }))
      return
    }

    // Проверка кэша
    if (isCached() && !isRefetch) {
      setState(prev => ({
        ...prev,
        data: cacheRef.current!.data,
        isLoading: false,
        isRefetching: false,
      }))
      return
    }

    // Отмена предыдущего запроса
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      setState(prev => ({
        ...prev,
        error: null,
        isLoading: !isRefetch,
        isRefetching: isRefetch,
      }))

      const response = await apiClient.get<T>(url, {
        signal: abortControllerRef.current.signal,
      })

      const transformedData = transform ? transform(response as unknown) : (response as T)

      // Сохранение в кэш
      cacheRef.current = { data: transformedData, timestamp: Date.now() }

      setState(prev => ({
        ...prev,
        data: transformedData,
        isLoading: false,
        isRefetching: false,
      }))

      onSuccess?.(transformedData)
    } catch (error) {
      // Игнорируем отменённые запросы
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      const typedError = error as Error
      setState(prev => ({
        ...prev,
        error: typedError,
        isLoading: false,
        isRefetching: false,
      }))

      onError?.(typedError)
    }
  }, [url, isCached, transform, onSuccess, onError])

  // Автоматический запрос при монтировании
  useEffect(() => {
    if (enabled && url) {
      executeRequest()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [enabled, url, executeRequest])

  // Авто-обновление
  useEffect(() => {
    if (!refetchInterval || !enabled || !url) return

    intervalId.current = setInterval(() => {
      executeRequest(true)
    }, refetchInterval)

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [refetchInterval, enabled, url, executeRequest])

  const refetch = useCallback(async (): Promise<void> => {
    await executeRequest(true)
  }, [executeRequest])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isRefetching: false,
    })
    cacheRef.current = null
  }, [])

  return {
    ...state,
    refetch,
    reset,
  }
}

/**
 * Хук для мутаций (POST, PUT, PATCH, DELETE)
 * 
 * @example
 * const { mutate, isLoading, error } = useMutation<User, CreateUserDto>(
 *   (data) => apiClient.post<User, CreateUserDto>('/users', data)
 * )
 */
export function useMutation<T, B = unknown>(
  mutationFn: (body: B) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutate = useCallback(async (body: B): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await mutationFn(body)
      setData(result)
      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const typedError = err as Error
      setError(typedError)
      options?.onError?.(typedError)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [mutationFn, options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { data, error, isLoading, mutate, reset }
}

// Экспорт типов ошибок для удобной проверки
export { ApiError, NetworkError, TimeoutError }
