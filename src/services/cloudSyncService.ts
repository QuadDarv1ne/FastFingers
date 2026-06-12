import { User, UserStats } from '../types/auth'
import { useEffect, useRef } from 'react'
import { supabase } from './supabase'
import { createScopedLogger } from '../utils/logger'
import { STORAGE_KEYS } from '../constants/storageKeys'

const logger = createScopedLogger('cloudSync')
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 минут

// Safe singleton pattern: reuse instance across HMR reloads to prevent listener accumulation
const CLOUD_SYNC_INSTANCE_KEY = '__fastfingers_cloud_sync_instance__'

interface CloudSave {
  userId: string
  stats: UserStats
  timestamp: number
  version: string
}

// Database schema types for Supabase
export interface TypingSessionRow {
  id: string
  user_id: string
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  correct_chars: number
  total_chars: number
  duration: number
  xp: number
  created_at: string
}

export interface HardcoreRecordRow {
  id: string
  user_id: string
  streak: number
  wpm: number
  accuracy: number
  created_at: string
}

interface LeaderboardEntry {
  game_mode: string
  wpm: number
  cpm: number
  accuracy: number
  score: number
  season?: string
}

type FetchResult<T> = { data: T[] | null; error: Error | null }

class CloudSyncService {
  private syncQueue: CloudSave[] = []
  private isSyncing = false
  private isFlushing = false
  private isOnline = true
  private offlineCache: Array<{ type: string; data: unknown }> = []
  private onlineHandler: () => void
  private offlineHandler: () => void

  constructor() {
    this.onlineHandler = () => {
      this.isOnline = true
      this.flushOfflineCache()
    }
    this.offlineHandler = () => {
      this.isOnline = false
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineHandler)
      window.addEventListener('offline', this.offlineHandler)
    }
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineHandler)
      window.removeEventListener('offline', this.offlineHandler)
      delete window[CLOUD_SYNC_INSTANCE_KEY]
    }
  }

  async saveProgress(user: User, stats: UserStats): Promise<void> {
    const save: CloudSave = {
      userId: user.id,
      stats,
      timestamp: Date.now(),
      version: '1.0',
    }

    this.syncQueue.push(save)

    if (this.isOnline && supabase) {
      try {
        const { error } = await supabase
          .from('user_stats')
          .upsert(
            {
              user_id: user.id,
              stats,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )

        if (error) throw error

        logger.info('Progress saved to Supabase')
      } catch (error) {
        logger.error('Failed to save to Supabase:', error)
        this.saveToLocalStorage(save)
        // Avoid re-queueing during flush — the item is already in itemsToFlush
        // and will be pushed back to offlineCache by flushOfflineCache on failure
        if (!this.isFlushing) {
          this.offlineCache.push({ type: 'stats', data: save })
        }
      }
    } else {
      this.saveToLocalStorage(save)
    }

    this.syncQueue = this.syncQueue.filter(s => s !== save)
  }

  async loadProgress(userId: string): Promise<CloudSave | null> {
    if (this.isOnline && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('stats')
          .eq('user_id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') return null
          throw error
        }

        return {
          userId,
          stats: data.stats as UserStats,
          timestamp: Date.now(),
          version: '1.0',
        }
      } catch (error) {
        logger.error('Failed to load from Supabase:', error)
      }
    }

    return this.loadFromLocalStorage(userId)
  }

  async sync(user: User, localStats: UserStats): Promise<UserStats> {
    if (this.isSyncing) return localStats
    this.isSyncing = true

    try {
      const cloudSave = await this.loadProgress(user.id)

      if (!cloudSave) {
        await this.saveProgress(user, localStats)
        return localStats
      }

      const mergedStats = this.mergeStats(localStats, cloudSave.stats)
      await this.saveProgress(user, mergedStats)

      return mergedStats
    } finally {
      this.isSyncing = false
    }
  }

  async saveTypingSession(
    userId: string,
    session: Omit<TypingSessionRow, 'id' | 'user_id' | 'created_at'>
  ): Promise<void> {
    if (this.isOnline && supabase) {
      try {
        const { error } = await supabase.from('typing_sessions').insert({
          user_id: userId,
          ...session,
        })

        if (error) throw error
        logger.info('Typing session saved')
      } catch (error) {
        logger.error('Failed to save typing session:', error)
        this.offlineCache.push({ type: 'session', data: { userId, ...session } })
      }
    }
  }

  async saveHardcoreRecord(
    userId: string,
    record: Omit<HardcoreRecordRow, 'id' | 'user_id' | 'created_at'>
  ): Promise<void> {
    if (this.isOnline && supabase) {
      try {
        const { error } = await supabase.from('hardcore_records').insert({
          user_id: userId,
          ...record,
        })

        if (error) throw error
        logger.info('Hardcore record saved')
      } catch (error) {
        logger.error('Failed to save hardcore record:', error)
        this.offlineCache.push({ type: 'hardcore', data: { userId, ...record } })
      }
    }
  }

  async saveLeaderboardEntry(
    userId: string,
    entry: LeaderboardEntry
  ): Promise<void> {
    if (this.isOnline && supabase) {
      try {
        const { error } = await supabase.from('leaderboards').insert({
          user_id: userId,
          ...entry,
        })

        if (error) throw error
        logger.info('Leaderboard entry saved')
      } catch (error) {
        logger.error('Failed to save leaderboard entry:', error)
        this.offlineCache.push({ type: 'leaderboard', data: { userId, ...entry } })
      }
    }
  }

  async getHardcoreRecords(userId: string): Promise<FetchResult<HardcoreRecordRow>> {
    if (this.isOnline && supabase) {
      try {
        const { data, error } = await supabase
          .from('hardcore_records')
          .select('*')
          .eq('user_id', userId)
          .order('streak', { ascending: false })
          .limit(10)

        if (error) throw error
        return { data: data || [], error: null }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.error('Failed to load hardcore records:', err)
        return { data: [], error: err }
      }
    }
    return { data: [], error: new Error('Offline: no Supabase connection') }
  }

  async getTypingSessions(
    userId: string,
    limit = 50
  ): Promise<FetchResult<TypingSessionRow>> {
    if (this.isOnline && supabase) {
      try {
        const { data, error } = await supabase
          .from('typing_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        return { data: data || [], error: null }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.error('Failed to load typing sessions:', err)
        return { data: [], error: err }
      }
    }
    return { data: [], error: new Error('Offline: no Supabase connection') }
  }

  private mergeStats(local: UserStats, cloud: UserStats): UserStats {
    return {
      totalXp: Math.max(local.totalXp, cloud.totalXp),
      level: Math.max(local.level, cloud.level),
      bestWpm: Math.max(local.bestWpm, cloud.bestWpm),
      bestAccuracy: Math.max(local.bestAccuracy, cloud.bestAccuracy),
      totalWordsTyped: Math.max(local.totalWordsTyped, cloud.totalWordsTyped),
      totalPracticeTime: Math.max(local.totalPracticeTime, cloud.totalPracticeTime),
      currentStreak: Math.max(local.currentStreak, cloud.currentStreak),
      longestStreak: Math.max(local.longestStreak, cloud.longestStreak),
      completedChallenges: Math.max(local.completedChallenges, cloud.completedChallenges),
    }
  }

  private saveToLocalStorage(save: CloudSave): void {
    try {
      const saves = this.getAllSaves()
      saves[save.userId] = save
      localStorage.setItem(STORAGE_KEYS.CLOUD_SYNC, JSON.stringify(saves))
    } catch {
      logger.error('Failed to save to localStorage')
    }
  }

  private loadFromLocalStorage(userId: string): CloudSave | null {
    try {
      const saves = this.getAllSaves()
      return saves[userId] || null
    } catch {
      return null
    }
  }

  private getAllSaves(): Record<string, CloudSave> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLOUD_SYNC)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  private async flushOfflineCache(): Promise<void> {
    if (this.offlineCache.length === 0 || this.isFlushing) return

    this.isFlushing = true
    logger.info(`Flushing ${this.offlineCache.length} cached operations`)

    // Snapshot the cache to avoid concurrent modification issues
    const itemsToFlush = [...this.offlineCache]
    this.offlineCache = []

    for (const item of itemsToFlush) {
      try {
        switch (item.type) {
          case 'stats': {
            const save = item.data as CloudSave
            await this.saveProgress(
              { id: save.userId } as User,
              save.stats
            )
            break
          }
          case 'session': {
            const data = item.data as { userId: string } & Partial<TypingSessionRow>
            if (data.wpm === undefined || data.cpm === undefined || data.accuracy === undefined || data.duration === undefined) {
              logger.error('Invalid session data in offline cache, skipping')
              break
            }
            await this.saveTypingSession(data.userId, {
              wpm: data.wpm,
              cpm: data.cpm,
              accuracy: data.accuracy,
              errors: data.errors || 0,
              correct_chars: data.correct_chars || 0,
              total_chars: data.total_chars || 0,
              duration: data.duration,
              xp: data.xp || 0,
            })
            break
          }
          case 'hardcore': {
            const data = item.data as { userId: string } & Partial<HardcoreRecordRow>
            if (data.streak === undefined || data.wpm === undefined || data.accuracy === undefined) {
              logger.error('Invalid hardcore data in offline cache, skipping')
              break
            }
            await this.saveHardcoreRecord(data.userId, {
              streak: data.streak,
              wpm: data.wpm,
              accuracy: data.accuracy,
            })
            break
          }
          case 'leaderboard': {
            const data = item.data as { userId: string } & Partial<LeaderboardEntry>
            if (data.game_mode === undefined || data.wpm === undefined || data.score === undefined) {
              logger.error('Invalid leaderboard data in offline cache, skipping')
              break
            }
            await this.saveLeaderboardEntry(data.userId, {
              game_mode: data.game_mode,
              wpm: data.wpm,
              cpm: data.cpm ?? 0,
              accuracy: data.accuracy ?? 0,
              score: data.score,
              season: data.season,
            })
            break
          }
        }
      } catch (error) {
        logger.error('Failed to flush cached operation, will retry:', error)
        this.offlineCache.push(item)
      }
    }

    this.isFlushing = false
  }

  getPendingSyncs(): number {
    return this.syncQueue.length + this.offlineCache.length
  }

  clearUser(userId: string): void {
    try {
      const saves = this.getAllSaves()
      delete saves[userId]
      localStorage.setItem(STORAGE_KEYS.CLOUD_SYNC, JSON.stringify(saves))
    } catch (error) {
      logger.error('Failed to clear user data:', error)
    }
  }

  getIsOnline(): boolean {
    return this.isOnline
  }
}

// Safe singleton: reuse instance across HMR to avoid duplicate event listeners
declare global {
  interface Window {
    [CLOUD_SYNC_INSTANCE_KEY]?: CloudSyncService
  }
}

export const cloudSyncService = (() => {
  if (typeof window !== 'undefined' && window[CLOUD_SYNC_INSTANCE_KEY]) {
    return window[CLOUD_SYNC_INSTANCE_KEY]
  }
  const instance = new CloudSyncService()
  if (typeof window !== 'undefined') {
    window[CLOUD_SYNC_INSTANCE_KEY] = instance
  }
  return instance
})()

export function useAutoSync(user: User | null, stats: UserStats) {
  const userRef = useRef(user)
  userRef.current = user
  const statsRef = useRef(stats)
  statsRef.current = stats
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!user) return

    // Cancel any in-flight sync operation for the previous user
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    const interval = setInterval(() => {
      if (signal.aborted) return
      const currentUser = userRef.current
      if (!currentUser) return
      cloudSyncService
        .saveProgress(currentUser, statsRef.current)
        .catch((err) => {
          if (!signal.aborted) {
            logger.error('Auto-sync failed:', err)
          }
        })
    }, SYNC_INTERVAL)

    return () => {
      clearInterval(interval)
      abortControllerRef.current?.abort()
    }
  }, [user])
}

