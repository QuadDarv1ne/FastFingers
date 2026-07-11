import { useMemo, useState, useCallback } from 'react'
import { useAppTranslation } from '../../i18n/config'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useSelectedStudent } from '../../hooks/useSelectedStudent'
import { TextManager } from './TextManager'
import { UserAdmin } from './UserAdmin'
import { DailyChallengeManager } from './DailyChallengeManager'
import { practiceTexts } from '../../data/practiceTexts'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { APP_VERSION } from '../../constants/version'
import { getFromStorageAsArray } from '../../utils/storage'
import { logger } from '../../utils/logger'

type AdminTab = 'overview' | 'texts' | 'users' | 'challenges'

function safeParseLength(key: string): number {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    logger.warn(`Failed to parse stored data for key: ${key}`)
    return 0
  }
}

interface UserStatsSummary {
  id: string
  name: string
  email: string
  level: number
  totalXp: number
  bestWpm: number
  totalWordsTyped: number
  totalPracticeTime: number
  lastLogin?: string
}

function AdminOverview() {
  const { t } = useAppTranslation()
  const { user } = useAuth()

  const totalUsers = useMemo(() => safeParseLength(STORAGE_KEYS.USERS), [])
  const customTexts = useMemo(() => safeParseLength(STORAGE_KEYS.ADMIN_TEXTS), [])
  const totalSessions = useMemo(() => safeParseLength(STORAGE_KEYS.HISTORY), [])
  const staticTextsCount = useMemo(() => practiceTexts.length, [])

  // Compute top users by various metrics
  const userSummaries = useMemo((): UserStatsSummary[] => {
    try {
      const users: Array<{ id: string; name: string; email: string; stats: Record<string, number>; lastLogin?: string }> =
        getFromStorageAsArray(STORAGE_KEYS.USERS)
      return users
        .filter(u => u.stats && typeof u.stats === 'object')
        .map(u => ({
          id: u.id,
          name: u.name || u.email,
          email: u.email,
          level: u.stats.level ?? 0,
          totalXp: u.stats.totalXp ?? 0,
          bestWpm: u.stats.bestWpm ?? 0,
          totalWordsTyped: u.stats.totalWordsTyped ?? 0,
          totalPracticeTime: u.stats.totalPracticeTime ?? 0,
          lastLogin: u.lastLogin,
        }))
        .sort((a, b) => b.totalXp - a.totalXp)
    } catch {
      logger.warn('Failed to parse user summaries from localStorage')
      return []
    }
  }, [])

  const topByWpm = useMemo(
    () => [...userSummaries].sort((a, b) => b.bestWpm - a.bestWpm).slice(0, 3),
    [userSummaries],
  )

  const topByXp = useMemo(() => userSummaries.slice(0, 3), [userSummaries])

  const totalPracticeTimeAll = useMemo(
    () => userSummaries.reduce((sum, u) => sum + u.totalPracticeTime, 0),
    [userSummaries],
  )

  const totalWordsAll = useMemo(
    () => userSummaries.reduce((sum, u) => sum + u.totalWordsTyped, 0),
    [userSummaries],
  )

  const avgWpmAll = useMemo(() => {
    const withWpm = userSummaries.filter(u => u.bestWpm > 0)
    if (withWpm.length === 0) return 0
    return Math.round(withWpm.reduce((sum, u) => sum + u.bestWpm, 0) / withWpm.length)
  }, [userSummaries])

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}с`
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}ч ${m}м`
    return `${m}м`
  }

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{totalUsers}</div>
          <div className="text-sm text-dark-400 mt-1">{t('admin.users', 'Пользователей')}</div>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{customTexts}</div>
          <div className="text-sm text-dark-400 mt-1">{t('admin.customTexts', 'Пользовательских текстов')}</div>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{totalSessions}</div>
          <div className="text-sm text-dark-400 mt-1">{t('admin.sessions', 'Тренировок')}</div>
        </div>
      </div>

      {/* Aggregate stats */}
      {userSummaries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-success">{avgWpmAll}</div>
            <div className="text-xs text-dark-400 mt-1">{t('admin.avgBestWpmLabel')}</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{totalWordsAll.toLocaleString()}</div>
            <div className="text-xs text-dark-400 mt-1">{t('admin.totalWordsAll')}</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{formatDuration(totalPracticeTimeAll)}</div>
            <div className="text-xs text-dark-400 mt-1">{t('admin.totalPracticeTimeLabel')}</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{staticTextsCount}</div>
            <div className="text-xs text-dark-400 mt-1">{t('admin.staticTextsCount')}</div>
          </div>
        </div>
      )}

      {/* Top users */}
      {topByWpm.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">{t('admin.topByWpmTitle')}</h3>
            <div className="space-y-2">
              {topByWpm.map((u, i) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-dark-400 w-5">{i + 1}.</span>
                    <span className="text-white">{u.name || u.email}</span>
                  </div>
                  <span className="text-success font-bold">{u.bestWpm} WPM</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">{t('admin.topByXpTitle')}</h3>
            <div className="space-y-2">
              {topByXp.map((u, i) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-dark-400 w-5">{i + 1}.</span>
                    <span className="text-white">{u.name || u.email}</span>
                  </div>
                  <span className="text-primary-400 font-bold">{u.totalXp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System info */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">{t('admin.systemInfo', 'Информация о системе')}</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark-400">{t('admin.version', 'Версия приложения')}</dt>
            <dd className="text-white">{APP_VERSION}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">{t('admin.authMode', 'Режим аутентификации')}</dt>
            <dd className="text-white">localStorage</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">{t('admin.administrator', 'Администратор')}</dt>
            <dd className="text-white">{user?.name || user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">{t('admin.dataStorage')}</dt>
            <dd className="text-white">{(new Blob([JSON.stringify(localStorage)]).size / 1024).toFixed(1)} КБ</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export function AdminDashboard({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (view: string) => void }) {
  const { t } = useAppTranslation()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const { select } = useSelectedStudent()

  const handleViewStudent = useCallback((userId: string, userName: string) => {
    select(userId, userName)
    onNavigate?.('student-analytics')
  }, [select, onNavigate])

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: t('admin.tabOverview', 'Обзор'), icon: '📊' },
    { id: 'texts', label: t('admin.tabTexts', 'Тексты'), icon: '📝' },
    { id: 'users', label: t('admin.tabUsers', 'Пользователи'), icon: '👥' },
    { id: 'challenges', label: t('admin.tabChallenges', 'Челленджи'), icon: '🎯' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{t('admin.title', 'Панель администратора')}</h2>
          <button onClick={onClose} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors text-sm">
            {t('action.close', 'Закрыть')}
          </button>
        </div>

        <div className="flex gap-1 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent-500 text-white'
                  : 'bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'texts' && <TextManager />}
        {activeTab === 'users' && <UserAdmin onViewStudent={handleViewStudent} />}
        {activeTab === 'challenges' && <DailyChallengeManager />}
      </div>
    </motion.div>
  )
}
