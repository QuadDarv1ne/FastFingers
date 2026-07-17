import i18n from 'i18next'
import { supabase } from './supabase'
import type { User, UserStats } from '../types/auth'
import type { TypingStats } from '../types'
import { logger } from '../utils/logger'
import { getFromStorageAsArray } from '../utils/storage'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { generateId } from '../utils/id'

const LOCAL_STORAGE_KEY = STORAGE_KEYS.CLOUD_SYNC
const PENDING_SESSIONS_KEY = STORAGE_KEYS.PENDING_SESSIONS
const BACKEND_STATUS_KEY = STORAGE_KEYS.BACKEND_STATUS

const BACKEND_STATUS_CACHE_TTL_MS = 5 * 60 * 1000
const MAX_STORED_SESSIONS = 100
const MAX_PENDING_SESSIONS = 50
const LOCAL_CHALLENGE_WPM_MIN = 30
const LOCAL_CHALLENGE_WPM_RANGE = 40
const LOCAL_CHALLENGE_ACCURACY_MIN = 85
const LOCAL_CHALLENGE_ACCURACY_RANGE = 10

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
  let cached: string | null = null
  try {
    cached = localStorage.getItem(BACKEND_STATUS_KEY)
  } catch { /* storage unavailable */ }
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as BackendStatus
      // Кэш действителен 5 минут
      if (Date.now() - parsed.lastChecked < BACKEND_STATUS_CACHE_TTL_MS) {
        return parsed
      }
    } catch (error) {
      logger.warn('Failed to parse cached backend status', error)
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
  } catch (error) {
    logger.warn('Failed to save backend status', error)
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
  } catch (error) {
    logger.warn('Failed to save updated backend status', error)
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
    } catch (error) {
      logger.warn('Failed to save user stats to localStorage', error)
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
  } catch (error) {
    logger.warn('Failed to sync user stats to Supabase', error)
    // Сохраняем локально при ошибке
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ userId: user.id, stats }))
    } catch (localStorageError) {
      logger.warn('Failed to save user stats to localStorage during fallback', localStorageError)
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
  } catch (error) {
    logger.warn('Failed to save typing session to Supabase', error)
    _saveSessionToLocal(stats, xp)
    _queuePendingSession(userId, stats, xp)
    updateBackendStatus({ sync: false })
    return { success: true, isOffline: true }
  }
}

function _saveSessionToLocal(stats: TypingStats, xp: number) {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
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
      id: generateId(),
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
      sessions: sessions.slice(0, MAX_STORED_SESSIONS),
      heatmap,
      totalSessions: totalSessions + 1,
      totalTime: totalTime + Math.floor(stats.timeElapsed / 60),
    }
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyData))
  } catch (error) {
    logger.warn('Failed to save session to localStorage', error)
    // Ignore storage errors
  }
}

function _queuePendingSession(userId: string, stats: TypingStats, xp: number) {
  const pending = getFromStorageAsArray<PendingSession>(PENDING_SESSIONS_KEY)
  pending.push({ userId, stats, xp, timestamp: Date.now() })
  try {
    localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(pending.slice(-MAX_PENDING_SESSIONS)))
  } catch {
    logger.warn('Failed to queue pending session in localStorage')
  }
}

export async function flushPendingSessions(): Promise<void> {
  if (!supabase) return
  const db = supabase

  const pending: PendingSession[] = getFromStorageAsArray<PendingSession>(PENDING_SESSIONS_KEY)
  if (pending.length === 0) return

  const results = await Promise.allSettled(
    pending.map(async (session) => {
      const { error } = await db.from('typing_sessions').insert({
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
      if (error) throw error
    })
  )

  // Keep only failed sessions (rejected or fulfilled with error)
  const remaining = pending.filter((_, i) => results[i]?.status === 'rejected')
  try {
    localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(remaining))
  } catch {
    logger.warn('Failed to update pending sessions in localStorage')
  }
}

function _loadLocalSessions(): CloudSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === 'object') return (parsed.sessions as CloudSession[]) || []
  } catch {
    logger.warn('Failed to load local sessions from localStorage')
  }
  return []
}

export async function loadUserSessions(
  userId: string,
  limit: number = 100
): Promise<{ sessions: CloudSession[]; isOffline: boolean }> {
  if (!supabase) {
    return { sessions: _loadLocalSessions(), isOffline: true }
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
  } catch (error) {
    logger.warn('Failed to load user sessions from Supabase', error)
    updateBackendStatus({ sync: false })
    return { sessions: _loadLocalSessions(), isOffline: true }
  }
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  if (!supabase) return

  try {
    await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievementId,
    })
  } catch (error) {
    logger.warn('Failed to unlock achievement', error)
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
  } catch (error) {
    logger.warn('Failed to complete daily challenge', error)
    // Игнорируем ошибки челленджей
  }
}

function generateLocalChallenge(date: string) {
  const hash = date.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
  return {
    id: 'local-' + date,
    text: i18n.t('challenge.fallbackTitle'),
    targetWpm: LOCAL_CHALLENGE_WPM_MIN + (Math.abs(hash) % LOCAL_CHALLENGE_WPM_RANGE),
    targetAccuracy: LOCAL_CHALLENGE_ACCURACY_MIN + (Math.abs(hash) % LOCAL_CHALLENGE_ACCURACY_RANGE),
    xpReward: 100,
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
    return generateLocalChallenge(date)
  }

  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', date)
      .single()

    if (error) return null

    return data
  } catch (error) {
    logger.warn('Failed to get daily challenge', error)
    updateBackendStatus({ challenges: false })
    return generateLocalChallenge(date)
  }
}
