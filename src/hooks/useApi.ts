import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'

const API_BASE_URL = '/api'
const STALE_TIME_MS = 5 * 60 * 1000
const DEFAULT_RETRY_COUNT = 3
const DEFAULT_RETRY_DELAY = 1000

interface ApiError {
  status: number
  message: string
  code?: string
}

class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface FetchOptions extends RequestInit {
  retries?: number
  retryDelay?: number
}

async function fetchApi<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { retries = DEFAULT_RETRY_COUNT, retryDelay = DEFAULT_RETRY_DELAY, ...fetchOptions } = options
  
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          response.status,
          errorData.message || `API error: ${response.status}`,
          errorData.code
        )
      }

      return response.json()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError || new Error('API request failed')
}

async function postApi<T>(url: string, data: unknown, options: FetchOptions = {}): Promise<T> {
  return fetchApi<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    ...options,
  })
}

export interface UserStats {
  id: string
  wpm: number
  accuracy: number
  errors: number
  createdAt: string
}

export interface UserProgress {
  level: number
  xp: number
  xpToNextLevel: number
  totalWordsTyped: number
  bestWpm: number
  bestAccuracy: number
  streak: number
}

interface QueryConfig<T> extends Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'> {
  userId?: string
  enabled?: boolean
}

const fetchUserStats = (userId: string): Promise<UserStats[]> =>
  fetchApi(`${API_BASE_URL}/users/${userId}/stats`)

const fetchUserProgress = (userId: string): Promise<UserProgress> =>
  fetchApi(`${API_BASE_URL}/users/${userId}/progress`)

const saveSessionStats = (stats: Partial<UserStats>): Promise<UserStats> =>
  postApi(`${API_BASE_URL}/stats`, stats)

export function useUserStats(userId: string, config: QueryConfig<UserStats[]> = {}) {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => fetchUserStats(userId),
    staleTime: STALE_TIME_MS,
    enabled: !!userId && (config.enabled ?? true),
    retry: (failureCount, error) => {
      if (error.status === 404) return false
      return failureCount < DEFAULT_RETRY_COUNT
    },
    ...config,
  })
}

export function useUserProgress(userId: string, config: QueryConfig<UserProgress> = {}) {
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => fetchUserProgress(userId),
    staleTime: STALE_TIME_MS,
    enabled: !!userId && (config.enabled ?? true),
    retry: (failureCount, error) => {
      if (error.status === 404) return false
      return failureCount < DEFAULT_RETRY_COUNT
    },
    ...config,
  })
}

export function useSaveSessionStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSessionStats,
    retry: DEFAULT_RETRY_COUNT,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
      queryClient.invalidateQueries({ queryKey: ['userProgress'] })
    },
  })
}

export { ApiError }
