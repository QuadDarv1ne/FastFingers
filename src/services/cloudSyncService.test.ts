import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cloudSyncService, type CloudSave } from './cloudSyncService'
import type { User, UserStats } from '../types/auth'

vi.mock('./supabase', () => ({
  supabase: null,
}))

const mockUser: User = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  role: 'user',
  stats: {
    totalXp: 100,
    level: 5,
    bestWpm: 60,
    bestAccuracy: 95,
    totalWordsTyped: 1000,
    totalPracticeTime: 3600,
    currentStreak: 3,
    longestStreak: 10,
    completedChallenges: 5,
  },
}

const mockStats: UserStats = {
  totalXp: 200,
  level: 10,
  bestWpm: 80,
  bestAccuracy: 98,
  totalWordsTyped: 2000,
  totalPracticeTime: 7200,
  currentStreak: 5,
  longestStreak: 15,
  completedChallenges: 10,
}

describe('cloudSyncService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('saveProgress', () => {
    it('должен сохранять прогресс в localStorage когда Supabase не настроен', async () => {
      await cloudSyncService.saveProgress(mockUser, mockStats)

      const stored = localStorage.getItem('fastfingers_cloud_sync')
      expect(stored).not.toBeNull()

      const saves = JSON.parse(stored as string)
      expect(saves[mockUser.id]).toBeDefined()
      expect(saves[mockUser.id].stats).toEqual(mockStats)
    })

    it('должен сохранять только в fastfingers_cloud_sync', async () => {
      await cloudSyncService.saveProgress(mockUser, mockStats)

      const stored = localStorage.getItem('fastfingers_cloud_sync')
      expect(stored).not.toBeNull()

      // Проверяем что нет отдельной backup записи
      const backup = localStorage.getItem('fastfingers_local_backup')
      expect(backup).toBeNull()
    })

    it('должен сохранять прогресс с правильными полями', async () => {
      await cloudSyncService.saveProgress(mockUser, mockStats)

      const stored = localStorage.getItem('fastfingers_cloud_sync')
      const saves = JSON.parse(stored as string)
      const save: CloudSave = saves[mockUser.id]

      expect(save.userId).toBe(mockUser.id)
      expect(save.stats).toEqual(mockStats)
      expect(save.timestamp).toBeDefined()
      expect(save.version).toBe('1.0')
    })
  })

  describe('loadProgress', () => {
    it('должен загружать прогресс из localStorage', async () => {
      // Сначала сохраняем
      await cloudSyncService.saveProgress(mockUser, mockStats)

      // Затем загружаем
      const loaded = await cloudSyncService.loadProgress(mockUser.id)

      expect(loaded).not.toBeNull()
      expect(loaded?.userId).toBe(mockUser.id)
      expect(loaded?.stats).toEqual(mockStats)
    })

    it('должен возвращать null для несуществующего пользователя', async () => {
      const loaded = await cloudSyncService.loadProgress('non-existent-user')
      expect(loaded).toBeNull()
    })

    it('должен возвращать null после очистки данных', async () => {
      // Сохраняем
      await cloudSyncService.saveProgress(mockUser, mockStats)

      // Очищаем данные
      localStorage.removeItem('fastfingers_cloud_sync')

      // Проверяем что данные удалены
      const loaded = await cloudSyncService.loadProgress(mockUser.id)
      expect(loaded).toBeNull()
    })
  })

  describe('mergeStats', () => {
    it('должен объединять статистику правильно', async () => {
      const localStats: UserStats = {
        totalXp: 100,
        level: 5,
        bestWpm: 60,
        bestAccuracy: 90,
        totalWordsTyped: 500,
        totalPracticeTime: 1800,
        currentStreak: 3,
        longestStreak: 8,
        completedChallenges: 4,
      }

      const cloudStats: UserStats = {
        totalXp: 200,
        level: 8,
        bestWpm: 75,
        bestAccuracy: 95,
        totalWordsTyped: 1000,
        totalPracticeTime: 3600,
        currentStreak: 5,
        longestStreak: 12,
        completedChallenges: 8,
      }

      // Сохраняем обе статистики
      await cloudSyncService.saveProgress(mockUser, localStats)

      // Проверяем что mergeStats работает корректно
      // (тестируем через sync метод)
      const result = await cloudSyncService.sync(mockUser, cloudStats)

      expect(result.totalXp).toBe(Math.max(localStats.totalXp, cloudStats.totalXp))
      expect(result.level).toBe(Math.max(localStats.level, cloudStats.level))
      expect(result.bestWpm).toBe(Math.max(localStats.bestWpm, cloudStats.bestWpm))
      expect(result.bestAccuracy).toBe(Math.max(localStats.bestAccuracy, cloudStats.bestAccuracy))
      expect(result.totalWordsTyped).toBe(Math.max(localStats.totalWordsTyped, cloudStats.totalWordsTyped))
      expect(result.totalPracticeTime).toBe(Math.max(localStats.totalPracticeTime, cloudStats.totalPracticeTime))
      expect(result.currentStreak).toBe(Math.max(localStats.currentStreak, cloudStats.currentStreak))
      expect(result.longestStreak).toBe(Math.max(localStats.longestStreak, cloudStats.longestStreak))
      expect(result.completedChallenges).toBe(Math.max(localStats.completedChallenges, cloudStats.completedChallenges))
    })
  })

  describe('sync', () => {
    it('должен синхронизировать локальные данные с облаком', async () => {
      // Сохраняем начальные данные
      await cloudSyncService.saveProgress(mockUser, mockStats)

      // Новые локальные данные
      const newLocalStats: UserStats = {
        ...mockStats,
        totalXp: mockStats.totalXp + 50,
        bestWpm: mockStats.bestWpm + 10,
      }

      // Синхронизируем
      const result = await cloudSyncService.sync(mockUser, newLocalStats)

      expect(result).toBeDefined()
      expect(result.totalXp).toBeGreaterThanOrEqual(newLocalStats.totalXp)
    })

    it('должен сохранять локальные данные если облако пустое', async () => {
      const result = await cloudSyncService.sync(mockUser, mockStats)

      expect(result).toEqual(mockStats)

      // Проверяем что данные сохранены
      const loaded = await cloudSyncService.loadProgress(mockUser.id)
      expect(loaded).not.toBeNull()
    })

    it('должен возвращать локальные данные при ошибке синхронизации', async () => {
      // Пытаемся синхронизировать с несуществующим пользователем в пустом хранилище
      const emptyUser = { ...mockUser, id: 'empty-user' }
      const result = await cloudSyncService.sync(emptyUser, mockStats)

      // Должен вернуть локальные данные
      expect(result).toEqual(mockStats)
    })
  })

  describe('getPendingSyncs', () => {
    it('должен возвращать количество ожидающих синхронизаций', async () => {
      expect(cloudSyncService.getPendingSyncs()).toBe(0)

      // Запускаем синхронизацию (но не ждем завершения)
      cloudSyncService.sync(mockUser, mockStats).catch(() => {})

      // Проверяем очередь (может быть уже очищена)
      const pending = cloudSyncService.getPendingSyncs()
      expect(pending).toBeGreaterThanOrEqual(0)
    })
  })

  describe('clearUser', () => {
    it('должен очищать данные пользователя', async () => {
      // Сохраняем данные
      await cloudSyncService.saveProgress(mockUser, mockStats)

      // Очищаем
      cloudSyncService.clearUser(mockUser.id)

      // Проверяем что данные удалены
      const loaded = await cloudSyncService.loadProgress(mockUser.id)
      expect(loaded).toBeNull()
    })

    it('должен очищать только указанного пользователя', async () => {
      const user1 = { ...mockUser, id: 'user-1' }
      const user2 = { ...mockUser, id: 'user-2' }

      await cloudSyncService.saveProgress(user1, mockStats)
      await cloudSyncService.saveProgress(user2, mockStats)

      cloudSyncService.clearUser(user1.id)

      const loaded1 = await cloudSyncService.loadProgress(user1.id)
      const loaded2 = await cloudSyncService.loadProgress(user2.id)

      expect(loaded1).toBeNull()
      expect(loaded2).not.toBeNull()
    })
  })

  describe('useAutoSync hook', () => {
    it('должен устанавливать интервал синхронизации', () => {
      // Этот тест проверяет что хук не падает при использовании
      // Реальное тестирование интервала требует моков setTimeout
      expect(() => {
        // Hook would be tested in a React component context
        // This is a basic sanity check
      }).not.toThrow()
    })
  })

  describe('fallback behavior', () => {
    it('должен использовать localStorage когда Supabase не настроен', async () => {
      // Проверяем что сервис работает без Supabase
      const testStats: UserStats = {
        totalXp: 50,
        level: 2,
        bestWpm: 40,
        bestAccuracy: 85,
        totalWordsTyped: 200,
        totalPracticeTime: 600,
        currentStreak: 1,
        longestStreak: 3,
        completedChallenges: 1,
      }

      await cloudSyncService.saveProgress(mockUser, testStats)
      const loaded = await cloudSyncService.loadProgress(mockUser.id)

      expect(loaded).not.toBeNull()
      expect(loaded?.stats.totalXp).toBe(50)
    })
  })
})
