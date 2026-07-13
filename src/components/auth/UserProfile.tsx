import { useState, useMemo, useEffect, useCallback, memo } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@hooks/useAuth'
import { useTypingHistory } from '@hooks/useTypingHistory'
import { useNotifications } from '@contexts/NotificationContext'
import { useToast } from '@contexts/ToastContext'
import { useAppTranslation } from '@i18n/config'
import i18n from 'i18next'
import { getHeatmapColor } from '@utils/stats'
import { logger } from '@utils/logger'
import { authService } from '@services/authService'
import type { Goal } from '@components/GoalsPanel'
import type { TFunction } from 'i18next'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { downloadBlob } from '@utils/export'

interface UserProfileProps {
  onClose: () => void
  onNavigate?: (view: 'statistics' | 'history' | 'achievements' | 'goals' | 'settings') => void
}

type TabId = 'overview' | 'heatmap' | 'goals' | 'settings'

const LEVEL_TIERS = [
  { min: 1, max: 5, label: 'profile.levelTier.beginner', color: 'from-gray-500 to-gray-400', icon: '🌱' },
  { min: 6, max: 10, label: 'profile.levelTier.student', color: 'from-green-500 to-emerald-400', icon: '📗' },
  { min: 11, max: 20, label: 'profile.levelTier.typist', color: 'from-blue-500 to-cyan-400', icon: '⌨️' },
  { min: 21, max: 35, label: 'profile.levelTier.professional', color: 'from-purple-500 to-violet-400', icon: '💼' },
  { min: 36, max: 50, label: 'profile.levelTier.expert', color: 'from-yellow-500 to-amber-400', icon: '⭐' },
  { min: 51, max: Infinity, label: 'profile.levelTier.master', color: 'from-orange-500 to-red-400', icon: '👑' },
]

function getLevelTier(level: number): typeof LEVEL_TIERS[0] {
  for (const tier of LEVEL_TIERS) {
    if (level >= tier.min && level <= tier.max) return tier
  }
  return { min: 1, max: 5, label: 'profile.levelTier.beginner', color: 'from-gray-500 to-gray-400', icon: '🌱' }
}

export const UserProfile = memo(function UserProfile({ onClose, onNavigate }: UserProfileProps) {
  const { user, logout } = useAuth()
  const { t } = useAppTranslation()
  const { history } = useTypingHistory()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [goals, setGoals] = useState<Goal[]>([])

  // Load goals from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS)
      if (stored) {
        setGoals(JSON.parse(stored))
      }
    } catch (err) {
      logger.warn('[UserProfile] Failed to parse goals', err)
    }
  }, [])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [handleClose])

  // Save name when editing is done
  const handleSaveName = useCallback(() => {
    if (name.trim() && name !== user?.name) {
      // Update user name in localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER)
        if (stored) {
          const userData = JSON.parse(stored)
          userData.name = name.trim()
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
        }
        // Also update in users list
        const users: Array<Record<string, unknown>> = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
        const idx = users.findIndex(u => u.id === user?.id)
        if (idx !== -1) {
          const userEntry = users[idx]
          if (userEntry) {
            userEntry.name = name.trim()
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
          }
        }
      } catch (err) {
        logger.error('[UserProfile] Failed to save user name', err)
      }
    }
    setIsEditing(false)
  }, [name, user])

  const handleUpdateName = useCallback((newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    if (trimmed.length > 100) return

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER)
      if (stored) {
        const userData = JSON.parse(stored)
        userData.name = trimmed
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
      }
      const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS)
      const users: Array<Record<string, unknown>> = usersRaw ? JSON.parse(usersRaw) : []
      const idx = users.findIndex(u => u.id === user?.id)
      if (idx !== -1) {
        const userEntry = users[idx]
        if (userEntry) {
          userEntry.name = trimmed
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
        }
      }
      setName(trimmed)
    } catch (err) {
      logger.error('[UserProfile] Failed to update user name', err)
    }
  }, [user])

  const handleDeleteAccount = useCallback(() => {
    if (!confirm(t('profile.deleteAccountWarning', 'Вы уверены? Это действие удалит ВСЕ данные и не может быть отменено!'))) return
    if (!confirm(t('profile.deleteAccountFinalWarning', 'Последнее предупреждение! Все достижения, статистика и настройки будут удалены.'))) return
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('fastfingers_')) keysToRemove.push(key)
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      logout()
      onClose()
    } catch (err) {
      logger.error('[UserProfile] Failed to delete account', err)
    }
  }, [logout, onClose, t])

  // Keyboard heatmap data
  const heatmapData = useMemo(() => {
    const heatmap: Record<string, { errors: number; total: number; accuracy: number }> = {}

    history.sessions.forEach(session => {
      const estimatedChars = Math.round(session.wpm * 5 * (session.duration / 60))
      const errors = Math.round(estimatedChars * (1 - session.accuracy / 100))

      const commonKeys = 'abcdefghijklmnopqrstuvwxyz'.split('')
      commonKeys.forEach((key) => {
        const keyErrors = Math.round(errors / commonKeys.length)
        const keyTotal = Math.round(estimatedChars / commonKeys.length)
        const existing = heatmap[key] || { errors: 0, total: 0, accuracy: 100 }
        const newTotal = existing.total + keyTotal
        const newErrors = Math.min(existing.errors + keyErrors, newTotal)
        heatmap[key] = {
          errors: newErrors,
          total: newTotal,
          accuracy: newTotal > 0 ? Math.round(((newTotal - newErrors) / newTotal) * 100) : 100,
        }
      })
    })

    return heatmap
  }, [history.sessions])

  // Skill profile metrics
  const skillProfile = useMemo(() => {
    if (history.sessions.length === 0) return null

    const recentSessions = history.sessions.slice(0, 10)
    const avgWpm = Math.round(recentSessions.reduce((sum, s) => sum + s.wpm, 0) / recentSessions.length)
    const avgAccuracy = Math.round(recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length)
    const avgErrors = Math.round(recentSessions.reduce((sum, s) => sum + s.errors, 0) / recentSessions.length)

    const wpmValues = recentSessions.map(s => s.wpm)
    const wpmMean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length
    const wpmVariance = wpmValues.reduce((sum, v) => sum + Math.pow(v - wpmMean, 2), 0) / wpmValues.length
    const rhythmScore = Math.max(0, Math.min(100, Math.round(100 - (wpmVariance / Math.max(wpmMean, 1)) * 10)))

    const errorRecoveryScore = Math.max(0, Math.min(100, Math.round(100 - avgErrors * 5)))

    const accuracyValues = recentSessions.map(s => s.accuracy)
    const accMean = accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length
    const accVariance = accuracyValues.reduce((sum, v) => sum + Math.pow(v - accMean, 2), 0) / accuracyValues.length
    const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - accVariance)))

    return {
      avgWpm,
      avgAccuracy,
      rhythmScore,
      errorRecoveryScore,
      consistencyScore,
    }
  }, [history.sessions])

  // Learning velocity
  const learningVelocity = useMemo(() => {
    const sessions = history.sessions
    if (sessions.length < 2) return 0

    const half = Math.floor(sessions.length / 2)
    const firstHalf = sessions.slice(half)
    const secondHalf = sessions.slice(0, half)

    const firstAvgWpm = firstHalf.reduce((sum, s) => sum + s.wpm, 0) / firstHalf.length
    const secondAvgWpm = secondHalf.reduce((sum, s) => sum + s.wpm, 0) / secondHalf.length

    return Math.round((secondAvgWpm - firstAvgWpm) * 10) / 10
  }, [history.sessions])

  // Goals summary
  const goalsSummary = useMemo(() => {
    const completed = goals.filter(g => g.completed).length
    const total = goals.length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, progress }
  }, [goals])

  // Recent sessions for activity feed
  const recentSessions = useMemo(() => {
    return history.sessions.slice(0, 5).map(session => ({
      ...session,
      dateObj: new Date(session.date),
    }))
  }, [history.sessions])

  // Unlocked achievements count
  const achievementsCount = useMemo(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)
      if (stored) {
        const achievements = JSON.parse(stored)
        return achievements.filter((a: { unlocked: boolean }) => a.unlocked).length
      }
    } catch (err) {
      logger.warn('[UserProfile] Failed to parse achievements', err)
    }
    return 0
  }, [])

  const totalAchievements = 18 // Total achievements defined in AchievementsPanel

  const tabs: { id: TabId; label: string; icon: ReactNode }[] = useMemo(() => [
    {
      id: 'overview',
      label: t('profile.tab.overview', 'Обзор'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'heatmap',
      label: t('profile.tab.heatmap', 'Раскладка'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      id: 'goals',
      label: t('profile.tab.goals', 'Цели'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: t('misc.settings', 'Настройки'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ], [t])

  if (!user) return null

  const stats = user.stats
  const tier = getLevelTier(stats.level)
  const levelProgress = calculateLevelProgress(stats.totalXp)
  const xpNeeded = xpForLevel(stats.level + 1) - stats.totalXp

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      >
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-3xl my-8 mx-4"
        >
          <div className="glass rounded-2xl overflow-hidden">
            {/* Banner */}
            <div className={`relative h-32 bg-gradient-to-r ${tier.color} overflow-hidden`}>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-8 text-6xl opacity-30">{tier.icon}</div>
                <div className="absolute bottom-2 right-12 text-4xl opacity-20">⌨️</div>
                <div className="absolute top-8 right-32 text-3xl opacity-15">✨</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
            </div>

            <div className="px-6 md:px-8 pb-6 md:pb-8 -mt-12 relative">
              {/* Header with Avatar */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-dark-900 rounded-2xl flex items-center justify-center shadow-xl border-4 border-dark-800">
                      <div className={`w-full h-full bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-bold text-white`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 bg-gradient-to-r ${tier.color} rounded-lg text-xs font-bold text-white shadow-lg`}>
                      {tier.icon} {t('profile.levelShort', 'Lv')}. {stats.level}
                    </div>
                  </div>
                  <div className="pb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName()
                            if (e.key === 'Escape') { setIsEditing(false); setName(user.name) }
                          }}
                          className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          onClick={handleSaveName}
                          className="p-1.5 text-success hover:bg-success/20 rounded-lg transition-colors"
                          aria-label={t('action.save')}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setIsEditing(false); setName(user.name) }}
                          className="p-1.5 text-error hover:bg-error/20 rounded-lg transition-colors"
                          aria-label={t('action.cancel')}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl md:text-2xl font-bold">{user.name}</h2>
                        <p className="text-dark-400 text-sm">{user.email}</p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-dark-800 rounded-xl transition-colors"
                  aria-label={t('action.close')}
                >
                  <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-dark-800/50 rounded-xl p-1 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                        : 'text-dark-400 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'overview' && (
                    <OverviewTab
                      stats={stats}
                      levelProgress={levelProgress}
                      xpNeeded={xpNeeded}
                      learningVelocity={learningVelocity}
                      skillProfile={skillProfile}
                      goalsSummary={goalsSummary}
                      achievementsCount={achievementsCount}
                      totalAchievements={totalAchievements}
                      recentSessions={recentSessions}
                      onNavigate={onNavigate}
                      t={t}
                    />
                  )}

                  {activeTab === 'heatmap' && (
                    <HeatmapTab heatmapData={heatmapData} t={t} />
                  )}

                  {activeTab === 'goals' && (
                    <GoalsTab goals={goals} t={t} />
                  )}

                  {activeTab === 'settings' && (
                    <SettingsTab
                      t={t}
                      user={{ name: user.name, email: user.email, createdAt: user.createdAt }}
                      onUpdateName={handleUpdateName}
                      onDeleteAccount={handleDeleteAccount}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Account Info & Actions */}
              <div className="mt-6 pt-6 border-t border-dark-700/50">
                <div className="flex flex-wrap gap-3 text-xs text-dark-400 mb-4">
                  <span>{t('auth.email')}: {user.email}</span>
                  <span>•</span>
                  <span>{t('profile.registered', 'Зарегистрирован')}: {new Date(user.createdAt).toLocaleDateString(i18n.language)}</span>
                  {user.lastLogin && (
                    <>
                      <span>•</span>
                      <span>{t('profile.lastLogin', 'Последний вход')}: {new Date(user.lastLogin).toLocaleDateString(i18n.language)}</span>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsEditing(true); setName(user.name) }}
                    className="flex-1 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('action.edit')}
                  </button>
                  <button
                    onClick={() => { logout(); handleClose() }}
                    className="flex-1 py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-error/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('auth.logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

/* ======================== TAB COMPONENTS ======================== */

function OverviewTab({
  stats,
  levelProgress,
  xpNeeded,
  learningVelocity,
  skillProfile,
  goalsSummary,
  achievementsCount,
  totalAchievements,
  recentSessions,
  onNavigate,
  t,
}: {
  stats: { level: number; totalXp: number; bestWpm: number; bestAccuracy: number; totalWordsTyped: number; totalPracticeTime: number; currentStreak: number; longestStreak: number }
  levelProgress: number
  xpNeeded: number
  learningVelocity: number
  skillProfile: { avgWpm: number; avgAccuracy: number; rhythmScore: number; errorRecoveryScore: number; consistencyScore: number } | null
  goalsSummary: { completed: number; total: number; progress: number }
  achievementsCount: number
  totalAchievements: number
  recentSessions: Array<{ wpm: number; accuracy: number; errors: number; duration: number; date: string; dateObj: Date }>
  onNavigate?: (view: 'statistics' | 'history' | 'achievements' | 'goals' | 'settings') => void
  t: TFunction
}) {
  const tier = getLevelTier(stats.level)

  return (
    <>
      {/* Level Progress */}
      <div className="bg-gradient-to-r from-dark-800/80 to-dark-800/50 rounded-xl p-4 mb-4 border border-dark-700/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${tier.color.includes('yellow') ? 'text-yellow-400' : 'text-primary-400'}`}>{tier.icon}</span>
            <span className="text-sm font-medium">{t('common.level')} {stats.level} — {t(tier.label)}</span>
          </div>
          <span className="text-sm text-dark-400">{stats.totalXp.toLocaleString()} XP</span>
        </div>
        <div className="w-full h-3 bg-dark-900/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${tier.color}`}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {learningVelocity !== 0 && (
              <span className={`text-xs font-medium ${learningVelocity > 0 ? 'text-success' : 'text-error'}`}>
                {learningVelocity > 0 ? '↑' : '↓'} {Math.abs(learningVelocity)} WPM {t('profile.learningVelocity', 'скорость обучения')}
              </span>
            )}
          </div>
          <span className="text-xs text-dark-500">{xpNeeded} XP {t('profile.toNextLevel', 'до следующего уровня')}</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <AnimatedStatCard
          icon="⚡"
          label={t('stats.bestWpm')}
          value={stats.bestWpm.toString()}
          color="text-success"
          delay={0}
        />
        <AnimatedStatCard
          icon="🎯"
          label={t('common.accuracy')}
          value={`${stats.bestAccuracy}%`}
          color="text-purple-400"
          delay={0.05}
        />
        <AnimatedStatCard
          icon="📚"
          label={t('profile.totalWords', 'Всего слов')}
          value={stats.totalWordsTyped.toLocaleString()}
          color="text-blue-400"
          delay={0.1}
        />
        <AnimatedStatCard
          icon="⏱️"
          label={t('profile.practiceTime', 'Время практики')}
          value={formatPracticeTime(stats.totalPracticeTime)}
          color="text-cyan-400"
          delay={0.15}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <AnimatedStatCard
          icon="💎"
          label={t('common.xp')}
          value={stats.totalXp.toLocaleString()}
          color="text-primary-400"
          delay={0.2}
        />
        <AnimatedStatCard
          icon="🔥"
          label={t('common.streak')}
          value={`${stats.currentStreak} ${t('common.days')}`}
          color="text-orange-400"
          delay={0.25}
        />
        <AnimatedStatCard
          icon="🏆"
          label={t('stats.achievements')}
          value={`${achievementsCount}/${totalAchievements}`}
          color="text-yellow-400"
          delay={0.3}
        />
      </div>

      {/* Skill Profile */}
      {skillProfile && (
        <div className="bg-dark-800/50 rounded-xl p-4 mb-4 border border-dark-700/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <span>📈</span>
            {t('profile.skillProfile', 'Профиль навыков')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <SkillBar
              label={t('profile.avgWpm', 'Средний WPM')}
              value={skillProfile.avgWpm}
              max={100}
              color="from-primary-600 to-primary-400"
            />
            <SkillBar
              label={t('profile.rhythm', 'Ритм')}
              value={skillProfile.rhythmScore}
              max={100}
              color="from-purple-600 to-purple-400"
            />
            <SkillBar
              label={t('profile.errorRecovery', 'Реакция на ошибки')}
              value={skillProfile.errorRecoveryScore}
              max={100}
              color="from-green-600 to-green-400"
            />
            <SkillBar
              label={t('profile.consistency', 'Стабильность')}
              value={skillProfile.consistencyScore}
              max={100}
              color="from-yellow-600 to-yellow-400"
            />
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      {onNavigate && (
        <div className="bg-dark-800/50 rounded-xl p-4 mb-4 border border-dark-700/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <span>🚀</span>
            {t('profile.quickNav', 'Быстрая навигация')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <NavButton
              icon="📊"
              label={t('nav.statistics')}
              onClick={() => onNavigate('statistics')}
            />
            <NavButton
              icon="📜"
              label={t('nav.history')}
              onClick={() => onNavigate('history')}
            />
            <NavButton
              icon="🏆"
              label={t('stats.achievements')}
              onClick={() => onNavigate('achievements')}
            />
            <NavButton
              icon="🎯"
              label={t('profile.goals', 'Цели')}
              onClick={() => onNavigate('goals')}
            />
          </div>
        </div>
      )}

      {/* Goals Summary */}
      {goalsSummary.total > 0 && (
        <div className="bg-dark-800/50 rounded-xl p-4 mb-4 border border-dark-700/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span>🎯</span>
              {t('profile.goals', 'Цели')}
            </h3>
            <span className="text-xs text-dark-400">
              {goalsSummary.completed}/{goalsSummary.total}
            </span>
          </div>
          <div className="w-full h-2 bg-dark-900/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalsSummary.progress}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-green-600 to-emerald-400"
            />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <span>🕐</span>
            {t('profile.recentActivity', 'Последние тренировки')}
          </h3>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div
                key={session.date}
                className="flex items-center justify-between py-2 px-3 bg-dark-900/30 rounded-lg text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${session.accuracy >= 95 ? 'bg-green-400' : session.accuracy >= 85 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  <span className="text-dark-300">{session.dateObj.toLocaleDateString(i18n.language)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-success font-medium">{session.wpm} WPM</span>
                  <span className="text-purple-400">{session.accuracy}%</span>
                  <span className="text-dark-500">{Math.round(session.duration / 60)}{t('profile.timeMinutes', 'min')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function HeatmapTab({
  heatmapData,
  t,
}: {
  heatmapData: Record<string, { errors: number; total: number; accuracy: number }>
  t: TFunction
}) {
  return (
    <>
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
        <span>⌨️</span>
        {t('profile.heatmapTitle', 'Тепловая карта клавиш')}
      </h3>
      {Object.keys(heatmapData).length > 0 ? (
        <div className="mb-4">
          <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
            {/* Number row */}
            <div className="grid grid-cols-10 gap-1 mb-1">
              {'1234567890'.split('').map(key => (
                <KeyCell key={key} label={key} data={heatmapData[key]} />
              ))}
            </div>
            {/* QWERTY rows */}
            <div className="grid grid-cols-10 gap-1 mb-1 ml-1">
              {'qwertyuiop'.split('').map(key => (
                <KeyCell key={key} label={key} data={heatmapData[key]} />
              ))}
            </div>
            <div className="grid grid-cols-9 gap-1 mb-1 ml-5">
              {'asdfghjkl'.split('').map(key => (
                <KeyCell key={key} label={key} data={heatmapData[key]} />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 ml-10">
              {'zxcvbnm'.split('').map(key => (
                <KeyCell key={key} label={key} data={heatmapData[key]} />
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-between mt-3 text-xs text-dark-400">
            <span>{t('profile.heatmapLegend', 'Точность')}</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
              <span className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
              <span className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }} />
              <span className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
            </div>
            <div className="flex gap-4">
              <span>60%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-dark-400">
          <div className="text-5xl mb-3">⌨️</div>
          <p className="text-lg mb-2">{t('profile.noHeatmapData', 'Нет данных для тепловой карты')}</p>
          <p className="text-sm">{t('profile.completeSessions', 'Завершите несколько тренировок')}</p>
        </div>
      )}
    </>
  )
}

function GoalsTab({
  goals,
  t,
}: {
  goals: Goal[]
  t: TFunction
}) {
  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  return (
    <>
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
        <span>🎯</span>
        {t('profile.goalsTitle', 'Цели и достижения')}
      </h3>

      {/* Goals stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-dark-700/30">
          <div className="text-2xl font-bold text-primary-400">{activeGoals.length}</div>
          <div className="text-xs text-dark-400 mt-1">{t('profile.goalActive', 'Active')}</div>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-dark-700/30">
          <div className="text-2xl font-bold text-green-400">{completedGoals.length}</div>
          <div className="text-xs text-dark-400 mt-1">{t('profile.goalCompleted', 'Completed')}</div>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-dark-700/30">
          <div className="text-2xl font-bold text-yellow-400">
            {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
          </div>
          <div className="text-xs text-dark-400 mt-1">{t('profile.goalProgress', 'Progress')}</div>
        </div>
      </div>

      {goals.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {activeGoals.map(goal => {
            const progress = Math.min((goal.current / goal.target) * 100, 100)
            return (
              <GoalItem key={goal.id} goal={goal} progress={progress} t={t} />
            )
          })}
          {completedGoals.length > 0 && (
            <>
              <div className="pt-2 border-t border-dark-700/30">
                <p className="text-xs text-dark-500 mb-2">{t('profile.goalCompletedTitle', 'Completed goals')}</p>
              </div>
              {completedGoals.map(goal => {
                const progress = 100
                return (
                  <GoalItem key={goal.id} goal={goal} progress={progress} completed t={t} />
                )
              })}
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-dark-400">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-lg mb-2">{t('profile.noGoals', 'Нет целей')}</p>
          <p className="text-sm">{t('profile.setGoals', 'Установите цели для отслеживания прогресса')}</p>
        </div>
      )}
    </>
  )
}

function GoalItem({ goal, progress, completed, t }: { goal: Goal; progress: number; completed?: boolean; t?: TFunction }) {
  const translate: TFunction = t || ((key: string, _options?: unknown) => key) as TFunction
  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        completed
          ? 'bg-green-500/5 border-green-500/20 opacity-75'
          : 'bg-dark-800/50 border-dark-700/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
          completed ? 'bg-green-500/20' : 'bg-dark-700/50'
        }`}>
          {goal.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm truncate">{goal.title}</h4>
            {completed && (
              <span className="text-xs text-green-400 font-medium ml-2 flex-shrink-0">
                ✓ {translate('profile.done', 'Выполнено')}
              </span>
            )}
          </div>
          <p className="text-xs text-dark-400 mb-2 truncate">{goal.description}</p>
          <div className="w-full h-1.5 bg-dark-900/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${
                completed
                  ? 'bg-gradient-to-r from-green-600 to-emerald-400'
                  : 'bg-gradient-to-r from-primary-600 to-primary-400'
              }`}
            />
          </div>
          <p className="text-xs text-dark-500 mt-1 text-right">
            {goal.current} / {goal.target} ({Math.round(progress)}%)
          </p>
        </div>
      </div>
    </div>
  )
}

type SettingsSubPage = 'main' | 'profile' | 'notifications' | 'security' | 'data'

function SettingsTab({
  t,
  user,
  onUpdateName,
  onDeleteAccount,
}: {
  t: TFunction
  user: { name: string; email: string; createdAt: string }
  onUpdateName: (name: string) => void
  onDeleteAccount: () => void
}) {
  const [subPage, setSubPage] = useState<SettingsSubPage>('main')

  if (subPage !== 'main') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSubPage('main')}
          className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('profile.back', 'Back')}
        </button>
        {subPage === 'profile' && <ProfileSettingsSubPage user={user} onUpdateName={onUpdateName} />}
        {subPage === 'notifications' && <NotificationSettingsSubPage />}
        {subPage === 'security' && <SecuritySettingsSubPage />}
        {subPage === 'data' && <DataSettingsSubPage onDeleteAccount={onDeleteAccount} />}
      </div>
    )
  }

  const settingsItems = [
    {
      id: 'profile' as SettingsSubPage,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: t('profile.settingsProfile', 'Profile'),
      description: t('profile.settingsProfileDesc', 'Name, email, avatar'),
    },
    {
      id: 'notifications' as SettingsSubPage,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: t('profile.settingsNotifications', 'Notifications'),
      description: t('profile.settingsNotifDesc', 'Alert settings'),
    },
    {
      id: 'security' as SettingsSubPage,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: t('profile.settingsSecurity', 'Security'),
      description: t('profile.settingsSecurityDesc', 'Password, two-factor authentication'),
    },
    {
      id: 'data' as SettingsSubPage,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      label: t('profile.settingsData', 'Data'),
      description: t('profile.settingsDataDesc', 'Export, import, delete data'),
    },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
        <span>⚙️</span>
        {t('misc.settings', 'Настройки')}
      </h3>

      {settingsItems.map(item => (
        <button
          key={item.id}
          onClick={() => setSubPage(item.id)}
          className="w-full flex items-center gap-4 p-4 bg-dark-800/50 hover:bg-dark-800 rounded-xl border border-dark-700/30 hover:border-dark-700/50 transition-all text-left"
        >
          <div className="w-10 h-10 bg-dark-700/50 rounded-xl flex items-center justify-center text-dark-300 flex-shrink-0">
            {item.icon}
          </div>
          <div>
            <div className="font-medium text-sm">{item.label}</div>
            <div className="text-xs text-dark-400">{item.description}</div>
          </div>
          <svg className="w-5 h-5 text-dark-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}

      {/* Danger zone */}
      <div className="mt-6 pt-6 border-t border-error/20">
        <h4 className="text-sm font-medium text-error mb-3">{t('profile.dangerZone', 'Danger zone')}</h4>
        <button
          onClick={onDeleteAccount}
          className="w-full flex items-center gap-4 p-4 bg-error/5 hover:bg-error/10 rounded-xl border border-error/20 transition-all text-left text-error"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <div>
            <div className="font-medium text-sm">{t('profile.deleteAccountTitle', 'Delete account')}</div>
            <div className="text-xs text-error/70">{t('profile.irreversible', 'This action cannot be undone')}</div>
          </div>
        </button>
      </div>
    </div>
  )
}

function ProfileSettingsSubPage({
  user,
  onUpdateName,
}: {
  user: { name: string; email: string; createdAt: string }
  onUpdateName: (name: string) => void
}) {
  const { t } = useAppTranslation()
  const [name, setName] = useState(user.name)
  const [editing, setEditing] = useState(false)

  const handleSave = () => {
    if (name.trim()) {
      onUpdateName(name.trim())
      setEditing(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <span>👤</span> {t('profile.title', 'Профиль')}
      </h3>

      <div className="space-y-3">
        <div>
          <label htmlFor="profile-name" className="text-xs text-dark-400 mb-1 block">{t('profile.name', 'Имя')}</label>
          {editing ? (
            <div className="flex gap-2">
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setName(user.name); setEditing(false) } }}
                className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button onClick={handleSave} className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm">{t('action.save')}</button>
              <button onClick={() => { setName(user.name); setEditing(false) }} className="px-3 py-2 bg-dark-700 text-white rounded-lg text-sm">{t('action.cancel')}</button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-dark-800/50 rounded-lg px-3 py-2">
              <span className="text-sm text-white">{user.name}</span>
              <button onClick={() => setEditing(true)} className="text-xs text-primary-400 hover:text-primary-300">{t('action.edit')}</button>
            </div>
          )}
        </div>

        <div>
          <span className="text-xs text-dark-400 mb-1 block">{t('auth.email', 'Email')}</span>
          <div className="bg-dark-800/50 rounded-lg px-3 py-2 text-sm text-dark-300">{user.email}</div>
        </div>

        <div>
          <span className="text-xs text-dark-400 mb-1 block">{t('profile.registrationDate', 'Дата регистрации')}</span>
          <div className="bg-dark-800/50 rounded-lg px-3 py-2 text-sm text-dark-300">
            {new Date(user.createdAt).toLocaleDateString(i18n.language)}
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationSettingsSubPage() {
  const { t } = useAppTranslation()
  const { notifications, clearAll, unreadCount } = useNotifications()

  const [browserEnabled, setBrowserEnabled] = useState(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted'
  })
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIF_SOUND) || 'true') } catch { logger.warn('Failed to parse NOTIF_SOUND'); return true }
  })
  const [levelUpEnabled, setLevelUpEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIF_LEVELUP) || 'true') } catch { logger.warn('Failed to parse NOTIF_LEVELUP'); return true }
  })
  const [achievementEnabled, setAchievementEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIF_ACHIEVEMENT) || 'true') } catch { logger.warn('Failed to parse NOTIF_ACHIEVEMENT'); return true }
  })

  const enableBrowserNotifs = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission()
        setBrowserEnabled(perm === 'granted')
      } catch (err) {
        logger.error('Failed to request notification permission:', err)
      }
    }
  }

  const toggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <span>🔔</span> {t('profile.notifications', 'Notifications')}
      </h3>

      {/* Browser notifications */}
      <div className="bg-dark-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">{t('profile.browserNotifs', 'Browser notifications')}</div>
            <div className="text-xs text-dark-400">{t('profile.browserNotifsDesc', 'Show system notifications')}</div>
          </div>
          <button
            onClick={browserEnabled ? undefined : enableBrowserNotifs}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              browserEnabled ? 'bg-success/20 text-success' : 'bg-dark-700 text-dark-300 hover:text-white'
            }`}
          >
            {browserEnabled ? t('profile.notifEnabled', 'Enabled') : t('profile.notifEnable', 'Enable')}
          </button>
        </div>
      </div>

      {/* Notification types */}
      <div className="space-y-2">
        <ToggleRow
          label={t('profile.soundNotifs', 'Sound notifications')}
          description={t('profile.soundNotifsDesc', 'Sound on new notifications')}
          checked={soundEnabled}
          onChange={v => toggle('fastfingers_notif_sound', v, setSoundEnabled)}
        />
        <ToggleRow
          label={t('profile.levelUpNotif', 'Level up')}
          description={t('profile.levelUpNotifDesc', 'Notify on level up')}
          checked={levelUpEnabled}
          onChange={v => toggle('fastfingers_notif_levelup', v, setLevelUpEnabled)}
        />
        <ToggleRow
          label={t('profile.achievementNotif', 'Achievements')}
          description={t('profile.achievementNotifDesc', 'Notify on achievement unlock')}
          checked={achievementEnabled}
          onChange={v => toggle('fastfingers_notif_achievement', v, setAchievementEnabled)}
        />
      </div>

      {/* Recent notifications */}
      {notifications.length > 0 && (
        <div className="bg-dark-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">{t('profile.recentNotifs', 'Recent')} ({unreadCount} {t('profile.unread', 'unread')})</h4>
            <button onClick={() => clearAll()} className="text-xs text-dark-400 hover:text-white">{t('profile.clearAll', 'Clear all')}</button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notifications.slice(0, 10).map(n => (
              <div key={n.id} className={`p-2 rounded-lg text-xs ${n.read ? 'bg-dark-900/30' : 'bg-primary-500/10'}`}>
                <div className="flex items-center gap-2">
                  <span>{n.icon}</span>
                  <span className="font-medium text-white">{n.title}</span>
                </div>
                <p className="text-dark-400 mt-1">{n.message}</p>
                <p className="text-dark-600 mt-1">{new Date(n.timestamp).toLocaleString(i18n.language)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between bg-dark-800/50 rounded-xl p-3">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-dark-400">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-primary-600' : 'bg-dark-700'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function SecuritySettingsSubPage() {
  const { t } = useAppTranslation()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: t('profile.validation.fillAllFields', 'Fill in all fields') })
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: t('profile.validation.passwordMinLength', 'Password must be at least 8 characters') })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('profile.validation.passwordsMismatch', 'Passwords do not match') })
      return
    }

    try {
      const userRaw = localStorage.getItem(STORAGE_KEYS.USER)
      if (!userRaw) {
        setMessage({ type: 'error', text: t('profile.validation.userNotFound', 'User not found') })
        return
      }
      const currentUser = JSON.parse(userRaw)
      if (!currentUser || !currentUser.id || !currentUser.email) {
        setMessage({ type: 'error', text: t('profile.validation.userNotFound', 'User not found') })
        return
      }

      await authService.changePassword(currentUser.id, currentPassword, newPassword)

      setMessage({ type: 'success', text: t('profile.validation.passwordChanged', 'Password changed successfully') })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowChangePassword(false)
    } catch (err) {
      logger.error('[UserProfile] Password change failed', err)
      setMessage({ type: 'error', text: t('profile.validation.invalidCurrentPassword', 'Invalid current password or error') })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <span>🔒</span> {t('profile.security', 'Security')}
      </h3>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
          {message.text}
        </div>
      )}

      {/* Change password */}
      <div className="bg-dark-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-sm font-medium text-white">{t('profile.changePassword', 'Change password')}</div>
            <div className="text-xs text-dark-400">{t('profile.changePasswordDesc', 'Change your login password')}</div>
          </div>
          <button
            onClick={() => { setShowChangePassword(!showChangePassword); setMessage(null) }}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            {showChangePassword ? t('profile.cancel', 'Cancel') : t('profile.change', 'Change')}
          </button>
        </div>

        {showChangePassword && (
          <div className="space-y-3 mt-3">
            <div>
              <label htmlFor="pw-current" className="text-xs text-dark-400 mb-1 block">{t('profile.currentPassword', 'Current password')}</label>
              <input
                id="pw-current"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="pw-new" className="text-xs text-dark-400 mb-1 block">{t('profile.newPassword', 'New password')}</label>
              <input
                id="pw-new"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="pw-confirm" className="text-xs text-dark-400 mb-1 block">{t('profile.confirmPassword', 'Confirm password')}</label>
              <input
                id="pw-confirm"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('profile.savePassword', 'Save password')}
            </button>
          </div>
        )}
      </div>

      {/* 2FA placeholder */}
      <div className="bg-dark-800/50 rounded-xl p-4 opacity-60">
        <div className="text-sm font-medium text-white">{t('profile.twoFactor', 'Two-factor authentication')}</div>
        <div className="text-xs text-dark-400 mt-1">{t('profile.twoFactorDesc', 'Two-factor authentication will be available in a future update')}</div>
      </div>

      {/* Session info */}
      <div className="bg-dark-800/50 rounded-xl p-4">
        <div className="text-sm font-medium text-white mb-2">{t('profile.activeSession', 'Active session')}</div>
        <div className="text-xs text-dark-400 space-y-1">
          <div>{t('profile.platform', 'Platform')}: {navigator.platform}</div>
          <div>{t('profile.browser', 'Browser')}: {navigator.userAgent.split(' ').pop() || navigator.userAgent}</div>
          <div>{t('profile.language', 'Language')}: {navigator.language}</div>
        </div>
      </div>
    </div>
  )
}

function DataSettingsSubPage({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  const [importing, setImporting] = useState(false)
  const { showToast } = useToast()
  const { t } = useAppTranslation()

  const handleExport = () => {
    try {
      const data: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('fastfingers_')) {
          const value = localStorage.getItem(key)
          if (value) data[key] = value
        }
      }
      const exportData = { version: '1.0', exportedAt: new Date().toISOString(), data }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      downloadBlob(blob, `fastfingers-backup-${new Date().toISOString().split('T')[0]}.json`)
    } catch (err) {
      logger.error('[UserProfile] Failed to export data', err)
      showToast(t('profile.exportError', 'Ошибка при экспорте данных'), 'error')
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)
        if (!importData.data || typeof importData.data !== 'object') throw new Error('Invalid format')
        if (!confirm(t('profile.importOverwriteConfirm', 'Это действие перезапишет все текущие данные. Продолжить?'))) { setImporting(false); return }
        Object.entries(importData.data).forEach(([key, value]) => {
          if (typeof value === 'string' && key.startsWith('fastfingers_')) localStorage.setItem(key, value)
        })
        window.location.reload()
      } catch {
        showToast(t('profile.importError', 'Ошибка при импорте данных'), 'error')
        setImporting(false)
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (!confirm(t('profile.clearDataConfirm', 'Вы уверены? Это действие удалит ВСЕ данные и не может быть отменено!'))) return
    if (!confirm(t('profile.clearDataFinalWarning', 'Последнее предупреждение! Все достижения, статистика и настройки будут удалены.'))) return
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('fastfingers_')) keysToRemove.push(key)
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      window.location.reload()
    } catch (err) {
      logger.error('[UserProfile] Failed to clear data', err)
      showToast(t('profile.clearDataError', 'Ошибка при очистке данных'), 'error')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <span>💾</span> {t('profile.dataSettings', 'Данные')}
      </h3>

      {/* Export */}
      <div className="bg-dark-800/50 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📤</span>
          <div>
            <div className="text-sm font-medium text-white">{t('profile.exportData', 'Экспорт данных')}</div>
            <div className="text-xs text-dark-400">{t('profile.exportDescription', 'Сохранить все данные в JSON файл')}</div>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="w-full py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
        >
          {t('profile.exportButton', 'Экспортировать')}
        </button>
      </div>

      {/* Import */}
      <div className="bg-dark-800/50 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📥</span>
          <div>
            <div className="text-sm font-medium text-white">{t('profile.importData', 'Импорт данных')}</div>
            <div className="text-xs text-dark-400">{t('profile.importDescription', 'Восстановить из JSON файла')}</div>
          </div>
        </div>
        <label className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center cursor-pointer">
          {importing ? t('profile.importing', 'Импортирование...') : t('profile.importButton', 'Импортировать')}
          <input type="file" accept=".json" onChange={handleImport} disabled={importing} className="hidden" />
        </label>
      </div>

      {/* Clear data */}
      <div className="bg-error/5 rounded-xl p-4 border border-error/20">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="text-sm font-medium text-error">{t('profile.clearAllData', 'Удалить все данные')}</div>
            <div className="text-xs text-error/70">{t('profile.clearDataDescription', 'Сбросить прогресс и настройки')}</div>
          </div>
        </div>
        <button
          onClick={handleClearData}
          className="w-full py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg text-sm font-medium transition-colors"
        >
          {t('profile.clearAllData', 'Удалить все данные')}
        </button>
      </div>

      {/* Delete account */}
      <div className="bg-error/5 rounded-xl p-4 border border-error/20">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🗑</span>
          <div>
            <div className="text-sm font-medium text-error">{t('profile.deleteAccountTitle', 'Удалить аккаунт')}</div>
            <div className="text-xs text-error/70">{t('profile.deleteAccountDescription', 'Полное удаление аккаунта и данных')}</div>
          </div>
        </div>
        <button
          onClick={onDeleteAccount}
          className="w-full py-2 bg-error hover:bg-error/80 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {t('profile.deleteAccountTitle', 'Удалить аккаунт')}
        </button>
      </div>
    </div>
  )
}

/* ======================== SUB-COMPONENTS ======================== */

function AnimatedStatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string
  label: string
  value: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/30 hover:border-dark-700/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-dark-400">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </motion.div>
  )
}

function SkillBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-dark-400">{label}</span>
        <span className="text-xs font-medium">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-dark-900/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  )
}

function NavButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-2.5 px-3 bg-dark-800/80 hover:bg-dark-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-dark-700/30 hover:border-dark-700/50"
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}

function KeyCell({ label, data }: { label: string; data?: { accuracy: number } }) {
  const accuracy = data?.accuracy ?? 0
  const bgColor = accuracy > 0 ? getHeatmapColor(accuracy) : 'transparent'

  return (
    <div
      className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-default relative group"
      style={{ backgroundColor: accuracy > 0 ? `${bgColor}20` : 'transparent', border: `1px solid ${accuracy > 0 ? bgColor + '40' : 'transparent'}` }}
    >
      <span style={{ color: accuracy > 0 ? bgColor : '#6b7280' }}>{label}</span>
      {accuracy > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-dark-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
          {label.toUpperCase()}: {accuracy}%
        </div>
      )}
    </div>
  )
}

/* ======================== UTILITY FUNCTIONS ======================== */

function calculateLevelProgress(xp: number): number {
  const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1
  const prevLevelXp = Math.pow(currentLevel - 1, 2) * 100
  const nextLevelXp = Math.pow(currentLevel, 2) * 100
  return Math.min(100, Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100))
}

function xpForLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

function formatPracticeTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}${i18n.t('profile.hoursShort', 'h')} ${minutes}${i18n.t('profile.minutesShort', 'min')}`
  return `${minutes}${i18n.t('profile.minutesShort', 'min')}`
}
