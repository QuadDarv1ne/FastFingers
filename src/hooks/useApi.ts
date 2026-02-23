import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE_URL = '/api'
const STALE_TIME_MS = 5 * 60 * 1000

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response.json()
}

async function postApi<T>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response.json()
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

const fetchUserStats = (userId: string): Promise<UserStats[]> =>
  fetchApi(`${API_BASE_URL}/users/${userId}/stats`)

const fetchUserProgress = (userId: string): Promise<UserProgress> =>
  fetchApi(`${API_BASE_URL}/users/${userId}/progress`)

const saveSessionStats = (stats: Partial<UserStats>): Promise<UserStats> =>
  postApi(`${API_BASE_URL}/stats`, stats)

export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => fetchUserStats(userId),
    staleTime: STALE_TIME_MS,
    enabled: !!userId,
  })
}

export function useUserProgress(userId: string) {
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => fetchUserProgress(userId),
    staleTime: STALE_TIME_MS,
    enabled: !!userId,
  })
}

export function useSaveSessionStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSessionStats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
      queryClient.invalidateQueries({ queryKey: ['userProgress'] })
    },
  })
}
