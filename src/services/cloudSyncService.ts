import { User, UserStats } from '../types/auth'
import { useEffect } from 'react'

const CLOUD_SYNC_KEY = 'fastfingers_cloud_sync'
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

  // Сохранение в "облако" (localStorage для демонстрации)
  async saveProgress(user: User, stats: UserStats): Promise<void> {
    const save: CloudSave = {
      userId: user.id,
      stats,
      timestamp: Date.now(),
      version: '1.0',
    }

    // Добавляем в очередь
    this.syncQueue.push(save)

    // Сохраняем локально
    try {
      const saves = this.getAllSaves()
      saves[user.id] = save
      localStorage.setItem(CLOUD_SYNC_KEY, JSON.stringify(saves))
    } catch (e) {
      console.error('Failed to save to cloud:', e)
      throw e
    }

    // Очищаем очередь
    this.syncQueue = this.syncQueue.filter(s => s !== save)
  }

  // Загрузка из "облака"
  async loadProgress(userId: string): Promise<CloudSave | null> {
    try {
      const saves = this.getAllSaves()
      return saves[userId] || null
    } catch (e) {
      console.error('Failed to load from cloud:', e)
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

      return mergedStats
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
      totalWordsTyped: local.totalWordsTyped + cloud.totalWordsTyped,
      totalPracticeTime: local.totalPracticeTime + cloud.totalPracticeTime,
      currentStreak: Math.max(local.currentStreak, cloud.currentStreak),
      longestStreak: Math.max(local.longestStreak, cloud.longestStreak),
      completedChallenges: local.completedChallenges + cloud.completedChallenges,
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
      try {
        await cloudSyncService.saveProgress(user, stats)
      } catch (e) {
        console.error('Auto-sync failed:', e)
      }
    }, SYNC_INTERVAL)

    return () => clearInterval(interval)
  }, [user, stats])
}
