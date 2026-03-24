import { User, UserStats } from '../types/auth'
import { useEffect } from 'react'
import { supabase } from './supabase'
import { createScopedLogger } from '../utils/logger'

const logger = createScopedLogger('cloud-sync')
const CLOUD_SYNC_KEY = 'fastfingers_cloud_sync'
const LOCAL_BACKUP_KEY = 'fastfingers_local_backup'
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 минут

export interface CloudSave {
  userId: string
  stats: UserStats
  timestamp: number
  version: string
}

class CloudSyncService {
  private syncQueue: CloudSave[] = []
  private isSyncing = false
  private useSupabase: boolean

  constructor() {
    this.useSupabase = supabase !== null
  }

  // Сохранение прогресса
  async saveProgress(user: User, stats: UserStats): Promise<void> {
    const save: CloudSave = {
      userId: user.id,
      stats,
      timestamp: Date.now(),
      version: '1.0',
    }

    // Добавляем в очередь
    this.syncQueue.push(save)

    try {
      if (this.useSupabase && user.id !== 'local-user') {
        // Сохранение в Supabase
        await this.saveToSupabase(save)
      } else {
        // Fallback на localStorage
        await this.saveToLocal(save)
      }

      // Сохраняем локальную резервную копию
      this.saveLocalBackup(save)

      // Очищаем очередь
      this.syncQueue = this.syncQueue.filter(s => s !== save)

      logger.debug(`Progress saved for user ${user.id}`)
    } catch (error) {
      logger.error('Failed to save progress:', error)
      throw new Error('Failed to save progress')
    }
  }

  // Загрузка прогресса
  async loadProgress(userId: string): Promise<CloudSave | null> {
    try {
      // Сначала пробуем загрузить из Supabase
      if (this.useSupabase && userId !== 'local-user') {
        const cloudSave = await this.loadFromSupabase(userId)
        if (cloudSave) return cloudSave
      }

      // Fallback на localStorage
      return this.loadFromLocal(userId)
    } catch (error) {
      logger.error('Failed to load progress:', error)
      return null
    }
  }

  // Сохранение в Supabase
  private async saveToSupabase(save: CloudSave): Promise<void> {
    const { error } = await supabase!
      .from('user_stats')
      .upsert({
        user_id: save.userId,
        stats: save.stats,
        updated_at: new Date(save.timestamp).toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (error) throw error
  }

  // Загрузка из Supabase
  private async loadFromSupabase(userId: string): Promise<CloudSave | null> {
    const { data, error } = await supabase!
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null

    return {
      userId: data.user_id,
      stats: data.stats as UserStats,
      timestamp: new Date(data.updated_at).getTime(),
      version: '2.0',
    }
  }

  // Сохранение в localStorage
  private async saveToLocal(save: CloudSave): Promise<void> {
    const saves = this.getAllSaves()
    saves[save.userId] = save
    localStorage.setItem(CLOUD_SYNC_KEY, JSON.stringify(saves))
  }

  // Загрузка из localStorage
  private loadFromLocal(userId: string): CloudSave | null {
    const saves = this.getAllSaves()
    return saves[userId] || null
  }

  // Локальная резервная копия
  private saveLocalBackup(save: CloudSave): void {
    try {
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(save))
    } catch {
      // Ignore backup errors
    }
  }

  // Восстановление из резервной копии
  restoreFromBackup(): CloudSave | null {
    try {
      const backup = localStorage.getItem(LOCAL_BACKUP_KEY)
      return backup ? JSON.parse(backup) : null
    } catch {
      return null
    }
  }

  // Синхронизация
  async sync(user: User, localStats: UserStats): Promise<UserStats> {
    if (this.isSyncing) return localStats
    this.isSyncing = true

    try {
      const cloudSave = await this.loadProgress(user.id)

      if (!cloudSave) {
        // Нет данных в облаке, загружаем локальные
        await this.saveProgress(user, localStats)
        return localStats
      }

      // Сравниваем версии и объединяем данные
      const mergedStats = this.mergeStats(localStats, cloudSave.stats)

      // Сохраняем объединённые данные
      await this.saveProgress(user, mergedStats)

      logger.info('Sync completed successfully')
      return mergedStats
    } catch (error) {
      logger.error('Sync failed:', error)
      // Возвращаем локальные данные при ошибке
      return localStats
    } finally {
      this.isSyncing = false
    }
  }

  // Объединение статистики
  private mergeStats(local: UserStats, cloud: UserStats): UserStats {
    return {
      totalXp: Math.max(local.totalXp, cloud.totalXp),
      level: Math.max(local.level, cloud.level),
      bestWpm: Math.max(local.bestWpm, cloud.bestWpm),
      bestAccuracy: Math.max(local.bestAccuracy, cloud.bestAccuracy),
      totalWordsTyped: Math.max(local.totalWordsTyped, cloud.totalWordsTyped),
      totalPracticeTime: local.totalPracticeTime + cloud.totalPracticeTime,
      currentStreak: Math.max(local.currentStreak, cloud.currentStreak),
      longestStreak: Math.max(local.longestStreak, cloud.longestStreak),
      completedChallenges: Math.max(local.completedChallenges, cloud.completedChallenges),
    }
  }

  private getAllSaves(): Record<string, CloudSave> {
    try {
      const stored = localStorage.getItem(CLOUD_SYNC_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  // Проверка наличия несохранённых данных
  getPendingSyncs(): number {
    return this.syncQueue.length
  }

  // Очистка данных пользователя
  clearUser(userId: string): void {
    const saves = this.getAllSaves()
    delete saves[userId]
    localStorage.setItem(CLOUD_SYNC_KEY, JSON.stringify(saves))
  }
}

export const cloudSyncService = new CloudSyncService()

// Хук для автосинхронизации
export function useAutoSync(user: User | null, stats: UserStats) {
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      await cloudSyncService.saveProgress(user, stats).catch(() => {
        // Ignore sync errors
      })
    }, SYNC_INTERVAL)

    return () => clearInterval(interval)
  }, [user, stats])
}
