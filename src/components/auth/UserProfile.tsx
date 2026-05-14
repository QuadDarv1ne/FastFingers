import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@hooks/useAuth'
import { useTypingHistory } from '@hooks/useTypingHistory'
import { useAppTranslation } from '@i18n/config'
import i18n from 'i18next'
import { getHeatmapColor } from '@utils/stats'
import type { Goal } from '@components/GoalsPanel'

interface UserProfileProps {
  onClose: () => void
  onNavigate?: (view: 'statistics' | 'history' | 'achievements' | 'goals' | 'settings') => void
}

type TabId = 'overview' | 'heatmap' | 'goals'

export function UserProfile({ onClose, onNavigate }: UserProfileProps) {
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
      const stored = localStorage.getItem('fastfingers_goals')
      if (stored) {
        setGoals(JSON.parse(stored))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Keyboard heatmap data
  const heatmapData = useMemo(() => {
    const heatmap: Record<string, { errors: number; total: number; accuracy: number }> = {}

    history.sessions.forEach(session => {
      // Generate approximate heatmap data from session stats
      // In a real app, this would come from actual keystroke tracking
      const estimatedChars = Math.round(session.wpm * 5 * (session.duration / 60))
      const errors = Math.round(estimatedChars * (1 - session.accuracy / 100))

      // Distribute across common keys proportionally
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

    // Calculate rhythm score approximation (lower variance = higher score)
    const wpmValues = recentSessions.map(s => s.wpm)
    const wpmMean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length
    const wpmVariance = wpmValues.reduce((sum, v) => sum + Math.pow(v - wpmMean, 2), 0) / wpmValues.length
    const rhythmScore = Math.max(0, Math.min(100, Math.round(100 - (wpmVariance / Math.max(wpmMean, 1)) * 10)))

    // Error recovery score (fewer errors = better recovery)
    const errorRecoveryScore = Math.max(0, Math.min(100, Math.round(100 - avgErrors * 5)))

    // Consistency score (accuracy stability)
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

  // Learning velocity (WPM change over time)
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

  if (!user) return null

  const stats = user.stats

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: t('profile.tab.overview', 'Обзор'), icon: '📊' },
    { id: 'heatmap', label: t('profile.tab.heatmap', 'Раскладка'), icon: '⌨️' },
    { id: 'goals', label: t('profile.tab.goals', 'Цели'), icon: '🎯' },
  ]

  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl my-8"
      >
        <div className="glass rounded-2xl p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg shadow-primary-500/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-success hover:bg-success/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setName(user.name)
                      }}
                      className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
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
              onClick={onClose}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-dark-700/50 pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard
                  icon="⭐"
                  label={t('common.level')}
                  value={stats.level.toString()}
                  color="text-yellow-400"
                />
                <StatCard
                  icon="💎"
                  label={t('common.xp')}
                  value={stats.totalXp.toLocaleString()}
                  color="text-primary-400"
                />
                <StatCard
                  icon="⚡"
                  label={t('stats.bestWpm')}
                  value={stats.bestWpm.toString()}
                  color="text-success"
                />
                <StatCard
                  icon="🎯"
                  label={t('common.accuracy')}
                  value={`${stats.bestAccuracy}%`}
                  color="text-purple-400"
                />
              </div>

              {/* XP Progress */}
              <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-dark-300">
                    {t('common.level')} {stats.level} → {stats.level + 1}
                  </span>
                  <span className="text-sm text-dark-400">
                    {stats.totalXp.toLocaleString()} XP
                  </span>
                </div>
                <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 transition-all duration-500"
                    style={{ width: `${calculateLevelProgress(stats.totalXp)}%` }}
                  />
                </div>
                <p className="text-xs text-dark-500 mt-2 text-right">
                  {xpForLevel(stats.level + 1) - stats.totalXp} XP {t('profile.toNextLevel', 'до следующего уровня')}
                </p>
                {learningVelocity !== 0 && (
                  <p className={`text-xs mt-1 ${learningVelocity > 0 ? 'text-success' : 'text-error'}`}>
                    {learningVelocity > 0 ? '+' : ''}{learningVelocity} WPM {t('profile.learningVelocity', 'скорость обучения')}
                  </p>
                )}
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-dark-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📚</span>
                    <span className="text-xs text-dark-400">{t('profile.totalWords', 'Всего слов')}</span>
                  </div>
                  <p className="text-xl font-bold">{stats.totalWordsTyped.toLocaleString()}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">⏱️</span>
                    <span className="text-xs text-dark-400">{t('profile.practiceTime', 'Время практики')}</span>
                  </div>
                  <p className="text-xl font-bold">{formatPracticeTime(stats.totalPracticeTime)}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔥</span>
                    <span className="text-xs text-dark-400">{t('common.streak')}</span>
                  </div>
                  <p className="text-xl font-bold text-orange-400">{stats.currentStreak} {t('common.days')}</p>
                </div>
              </div>

              {/* Skill Profile */}
              {skillProfile && (
                <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>📈</span>
                    {t('profile.skillProfile', 'Профиль навыков')}
                  </h3>
                  <div className="space-y-3">
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
                <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
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
                <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span>🎯</span>
                      {t('profile.goals', 'Цели')}
                    </h3>
                    <span className="text-sm text-dark-400">
                      {goalsSummary.completed}/{goalsSummary.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
                      style={{ width: `${goalsSummary.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1 text-right">
                    {goalsSummary.progress}% {t('profile.completed', 'выполнено')}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'heatmap' && (
            <>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>⌨️</span>
                {t('profile.heatmapTitle', 'Тепловая карта клавиш')}
              </h3>
              {Object.keys(heatmapData).length > 0 ? (
                <div className="mb-6">
                  <div className="bg-dark-800/50 rounded-xl p-4">
                    <div className="grid grid-cols-13 gap-1 mb-2">
                      {/* Number row */}
                      {'1234567890'.split('').map(key => (
                        <KeyCell key={key} label={key} data={heatmapData[key]} />
                      ))}
                    </div>
                    {/* QWERTY rows */}
                    <div className="grid grid-cols-10 gap-1 mb-1 ml-2">
                      {'qwertyuiop'.split('').map(key => (
                        <KeyCell key={key} label={key} data={heatmapData[key]} />
                      ))}
                    </div>
                    <div className="grid grid-cols-9 gap-1 mb-1 ml-4">
                      {'asdfghjkl'.split('').map(key => (
                        <KeyCell key={key} label={key} data={heatmapData[key]} />
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 ml-8">
                      {'zxcvbnm'.split('').map(key => (
                        <KeyCell key={key} label={key} data={heatmapData[key]} />
                      ))}
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center justify-between mt-4 text-xs text-dark-400">
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
                  <p className="text-lg mb-2">{t('profile.noHeatmapData', 'Нет данных для тепловой карты')}</p>
                  <p className="text-sm">{t('profile.completeSessions', 'Завершите несколько тренировок')}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'goals' && (
            <>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🎯</span>
                {t('profile.goalsTitle', 'Цели и достижения')}
              </h3>
              {goals.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {goals.map(goal => {
                    const progress = Math.min((goal.current / goal.target) * 100, 100)
                    return (
                      <div
                        key={goal.id}
                        className={`p-3 rounded-xl border ${
                          goal.completed
                            ? 'bg-green-500/5 border-green-500/30'
                            : 'bg-dark-800/50 border-dark-700/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-dark-700/50">
                            {goal.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm">{goal.title}</h4>
                              {goal.completed && (
                                <span className="text-xs text-green-400 font-medium">
                                  ✓ {t('profile.done', 'Выполнено')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-dark-400 mb-2">{goal.description}</p>
                            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  goal.completed
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-400'
                                    : 'bg-gradient-to-r from-primary-600 to-primary-400'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-dark-500 mt-1 text-right">
                              {goal.current} / {goal.target} ({Math.round(progress)}%)
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-dark-400">
                  <p className="text-lg mb-2">{t('profile.noGoals', 'Нет целей')}</p>
                  <p className="text-sm">{t('profile.setGoals', 'Установите цели для отслеживания прогресса')}</p>
                </div>
              )}
            </>
          )}

          {/* Account Info & Actions */}
          <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-3">{t('profile.accountInfo', 'Информация об аккаунте')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">{t('auth.email')}:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">{t('profile.registered', 'Зарегистрирован')}:</span>
                <span>{new Date(user.createdAt).toLocaleDateString(i18n.language)}</span>
              </div>
              {user.lastLogin && (
                <div className="flex justify-between">
                  <span className="text-dark-400">{t('profile.lastLogin', 'Последний вход')}:</span>
                  <span>{new Date(user.lastLogin).toLocaleDateString(i18n.language)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {isEditing ? t('action.cancel') : t('action.edit')}
            </button>
            <button
              onClick={() => {
                logout()
                onClose()
              }}
              className="flex-1 py-3 bg-error/20 hover:bg-error/30 text-error rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

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
  if (hours > 0) return `${hours}ч ${minutes}мин`
  return `${minutes}мин`
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-dark-800/50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-dark-400">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function SkillBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-dark-400">{label}</span>
        <span className="text-xs font-medium">{value}/{max}</span>
      </div>
      <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function NavButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-2 px-3 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
      className="aspect-square rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-default relative group"
      style={{ backgroundColor: accuracy > 0 ? `${bgColor}30` : 'transparent', border: `1px solid ${accuracy > 0 ? bgColor + '60' : 'transparent'}` }}
    >
      <span style={{ color: accuracy > 0 ? bgColor : '#6b7280' }}>{label}</span>
      {accuracy > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-dark-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {label.toUpperCase()}: {accuracy}%
        </div>
      )}
    </div>
  )
}
