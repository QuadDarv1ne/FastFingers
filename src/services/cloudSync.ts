import { supabase } from './supabase'
import { User, UserStats } from '../types/auth'
import { TypingStats } from '../types'
import { logger } from '../utils/logger'

const LOCAL_STORAGE_KEY = 'fastfingers_cloud_sync'
const PENDING_SESSIONS_KEY = 'fastfingers_pending_sessions'
const BACKEND_STATUS_KEY = 'fastfingers_backend_status'

interface CloudSession {
  id?: string
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  duration: number
  xp: number
  date: string
}

interface PendingSession {
  userId: string
  stats: TypingStats
  xp: number
  timestamp: number
}

export interface BackendStatus {
  isAvailable: boolean
  lastChecked: number
  features: {
    sync: boolean
    leaderboard: boolean
    achievements: boolean
    challenges: boolean
  }
}

/**
 * Проверка доступности бэкенда (Supabase)
 */
export function isBackendAvailable(): boolean {
  return !!supabase
}

/**
 * Получение статуса бэкенда с кэшированием
 */
export function getBackendStatus(): BackendStatus {
  const cached = localStorage.getItem(BACKEND_STATUS_KEY)
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as BackendStatus
      // Кэш действителен 5 минут
      if (Date.now() - parsed.lastChecked < 5 * 60 * 1000) {
        return parsed
      }
    } catch {
      logger.warn('Operation failed in services/cloudSync.ts')
      // Игнорируем ошибки парсинга
    }
  }

  const isAvailable = isBackendAvailable()
  const status: BackendStatus = {
    isAvailable,
    lastChecked: Date.now(),
    features: {
      sync: isAvailable,
      leaderboard: isAvailable,
      achievements: isAvailable,
      challenges: isAvailable,
    },
  }

  try {
    localStorage.setItem(BACKEND_STATUS_KEY, JSON.stringify(status))
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    // Игнорируем ошибки сохранения
  }

  return status
}

/**
 * Обновление статуса бэкенда
 */
export function updateBackendStatus(features?: Partial<BackendStatus['features']>): BackendStatus {
  const isAvailable = isBackendAvailable()
  const status: BackendStatus = {
    isAvailable,
    lastChecked: Date.now(),
    features: {
      sync: isAvailable,
      leaderboard: isAvailable,
      achievements: isAvailable,
      challenges: isAvailable,
      ...features,
    },
  }

  try {
    localStorage.setItem(BACKEND_STATUS_KEY, JSON.stringify(status))
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    // Игнорируем ошибки сохранения
  }

  return status
}

/**
 * Проверка доступности конкретной функции
 */
export function isFeatureAvailable(feature: keyof BackendStatus['features']): boolean {
  const status = getBackendStatus()
  return status.isAvailable && status.features[feature]
}

export async function syncUserStats(user: User, stats: Partial<UserStats>): Promise<{ success: boolean; isOffline: boolean }> {
  if (!supabase) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ userId: user.id, stats }))
      return { success: true, isOffline: true }
    } catch {
      logger.warn('Operation failed in services/cloudSync.ts')
      return { success: false, isOffline: true }
    }
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ stats })
      .eq('id', user.id)

    if (error) throw error

    return { success: true, isOffline: false }
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    // Сохраняем локально при ошибке
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ userId: user.id, stats }))
    } catch {
      logger.warn('Operation failed in services/cloudSync.ts')
      // Игнорируем ошибки localStorage
    }

    // Обновляем статус бэкенда
    updateBackendStatus({ sync: false })

    return { success: false, isOffline: true }
  }
}

export async function saveTypingSession(
  userId: string,
  stats: TypingStats,
  xp: number
): Promise<{ success: boolean; isOffline: boolean }> {
  if (!supabase) {
    _saveSessionToLocal(stats, xp)
    return { success: true, isOffline: true }
  }

  try {
    const { error } = await supabase.from('typing_sessions').insert({
      user_id: userId,
      wpm: stats.wpm,
      cpm: stats.cpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      correct_chars: stats.correctChars,
      total_chars: stats.totalChars,
      duration: Math.floor(stats.timeElapsed),
      xp,
    })

    if (error) throw error

    return { success: true, isOffline: false }
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    _saveSessionToLocal(stats, xp)
    _queuePendingSession(userId, stats, xp)
    updateBackendStatus({ sync: false })
    return { success: true, isOffline: true }
  }
}

function _saveSessionToLocal(stats: TypingStats, xp: number) {
  try {
    const stored = localStorage.getItem('fastfingers_history')
    let totalSessions = 0
    let totalTime = 0
    let heatmap: Record<string, unknown> = {}
    let sessions: CloudSession[] = []

    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        // Backwards compatibility: migrate old array format
        sessions = parsed
        totalSessions = parsed.length
      } else if (parsed && typeof parsed === 'object') {
        sessions = parsed.sessions || []
        totalSessions = parsed.totalSessions || 0
        totalTime = parsed.totalTime || 0
        heatmap = parsed.heatmap || {}
      }
    }

    sessions.unshift({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      wpm: stats.wpm,
      cpm: stats.cpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      correctChars: stats.correctChars,
      totalChars: stats.totalChars,
      duration: Math.floor(stats.timeElapsed),
      xp,
    })

    const historyData = {
      sessions: sessions.slice(0, 100),
      heatmap,
      totalSessions: totalSessions + 1,
      totalTime,
    }
    localStorage.setItem('fastfingers_history', JSON.stringify(historyData))
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    // Ignore storage errors
  }
}

function _queuePendingSession(userId: string, stats: TypingStats, xp: number) {
  const pending = JSON.parse(localStorage.getItem(PENDING_SESSIONS_KEY) || '[]')
  pending.push({ userId, stats, xp, timestamp: Date.now() })
  localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(pending.slice(-50)))
}

export async function flushPendingSessions(): Promise<void> {
  if (!supabase) return

  const pending: PendingSession[] = JSON.parse(localStorage.getItem(PENDING_SESSIONS_KEY) || '[]')
  if (pending.length === 0) return

  const results = await Promise.allSettled(
    pending.map(session => {
      if (!supabase) return Promise.reject(new Error('Supabase not available'))
      return supabase.from('typing_sessions').insert({
        user_id: session.userId,
        wpm: session.stats.wpm,
        cpm: session.stats.cpm,
        accuracy: session.stats.accuracy,
        errors: session.stats.errors,
        correct_chars: session.stats.correctChars,
        total_chars: session.stats.totalChars,
        duration: Math.floor(session.stats.timeElapsed),
        xp: session.xp,
      })
    })
  )

  // Keep only failed sessions
  const remaining = pending.filter((_, i) => results[i]?.status === 'rejected')
  localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(remaining))
}

export async function loadUserSessions(
  userId: string,
  limit: number = 100
): Promise<{ sessions: CloudSession[]; isOffline: boolean }> {
  if (!supabase) {
    // Fallback на localStorage
    const stored = JSON.parse(localStorage.getItem('fastfingers_history') || '{}')
    const localSessions = Array.isArray(stored) ? stored : (stored.sessions || [])
    return { sessions: localSessions, isOffline: true }
  }

  try {
    const { data, error } = await supabase
      .from('typing_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    const sessions = (data || []).map(session => ({
      wpm: session.wpm,
      cpm: session.cpm,
      accuracy: session.accuracy,
      errors: session.errors,
      correctChars: session.correct_chars,
      totalChars: session.total_chars,
      duration: session.duration,
      xp: session.xp,
      date: session.created_at,
    }))

    return { sessions, isOffline: false }
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    // Fallback на localStorage
    const stored = JSON.parse(localStorage.getItem('fastfingers_history') || '{}')
    const localSessions = Array.isArray(stored) ? stored : (stored.sessions || [])
    updateBackendStatus({ sync: false })
    return { sessions: localSessions, isOffline: true }
  }
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  if (!supabase) return

  try {
    await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievementId,
    })
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    // Игнорируем ошибки достижений
  }
}

export async function completeDailyChallenge(
  userId: string,
  challengeId: string,
  wpm: number,
  accuracy: number
): Promise<void> {
  if (!supabase) return

  try {
    await supabase.from('user_challenges').upsert({
      user_id: userId,
      challenge_id: challengeId,
      completed: true,
      user_wpm: wpm,
      user_accuracy: accuracy,
      completed_at: new Date().toISOString(),
    })
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    // Игнорируем ошибки челленджей
  }
}

export async function getDailyChallenge(date: string): Promise<{
  id: string
  text: string
  targetWpm: number
  targetAccuracy: number
  xpReward: number
} | null> {
  if (!supabase) {
    // Генерируем детерминированный локальный челлендж
    const hash = date.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
    return {
      id: 'local-' + date,
      text: 'Локальный челлендж',
      targetWpm: 30 + (Math.abs(hash) % 40),
      targetAccuracy: 85 + (Math.abs(hash) % 10),
      xpReward: 100,
    }
  }

  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', date)
      .single()

    if (error) return null

    return data
  } catch {
    logger.warn('Operation failed in services/cloudSync.ts')
    updateBackendStatus({ challenges: false })
    // Fallback на генерацию локального челленджа
    const hash = date.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
    return {
      id: 'local-' + date,
      text: 'Локальный челлендж',
      targetWpm: 30 + (Math.abs(hash) % 40),
      targetAccuracy: 85 + (Math.abs(hash) % 10),
      xpReward: 100,
    }
  }
}
