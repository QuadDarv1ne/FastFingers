import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Типы
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

// API функции (заглушки для будущей интеграции)
const API_BASE_URL = '/api'

async function fetchUserStats(userId: string): Promise<UserStats[]> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`)
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

async function fetchUserProgress(userId: string): Promise<UserProgress> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/progress`)
  if (!response.ok) throw new Error('Failed to fetch progress')
  return response.json()
}

async function saveSessionStats(stats: Partial<UserStats>): Promise<UserStats> {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats),
  })
  if (!response.ok) throw new Error('Failed to save stats')
  return response.json()
}

// Хуки
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => fetchUserStats(userId),
    staleTime: 1000 * 60 * 5, // 5 минут
    enabled: !!userId,
  })
}

export function useUserProgress(userId: string) {
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => fetchUserProgress(userId),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  })
}

export function useSaveSessionStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSessionStats,
    onSuccess: () => {
      // Инвалидация кэша после сохранения
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
      queryClient.invalidateQueries({ queryKey: ['userProgress'] })
    },
  })
}
