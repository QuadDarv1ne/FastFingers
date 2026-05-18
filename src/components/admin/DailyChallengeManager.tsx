import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface DailyChallenge {
  id: string
  date: string
  text: string
  targetWpm: number
  targetAccuracy: number
  completed: boolean
  xpReward: number
  userWpm?: number
  userAccuracy?: number
}

interface StreakData {
  current: number
  longest: number
  lastPracticeDate: string | null
  practiceDates: string[]
}

const CHALLENGES_KEY = 'fastfingers_challenges'
const STREAK_KEY = 'fastfingers_streak'
const COMPLETIONS_KEY = 'fastfingers_dailyChallengesCompleted'

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0] || ''
}

function generateChallenge(date: string, text?: string, wpm?: number, acc?: number): DailyChallenge {
  const seed = date.split('-').reduce((a, b) => a + parseInt(b), 0)
  const texts = [
    'Съешь ещё этих мягких французских булок да выпей чаю',
    'В чащах юга жил бы цитрус да но фальшивый экземпляр',
    'Широкая электрификация южных губерний даст мощный толчок подъёму сельского хозяйства',
    'Быстрая коричневая лиса перепрыгивает через ленивую собаку',
    'Каждый охотник желает знать где сидит фазан',
  ]
  const difficulties = [
    { wpm: 20, acc: 90 },
    { wpm: 30, acc: 92 },
    { wpm: 40, acc: 94 },
    { wpm: 50, acc: 95 },
    { wpm: 60, acc: 97 },
  ]

  return {
    id: `challenge-${date}`,
    date,
    text: text || texts[seed % texts.length] || texts[0] || '',
    targetWpm: wpm ?? difficulties[seed % difficulties.length]?.wpm ?? 40,
    targetAccuracy: acc ?? difficulties[seed % difficulties.length]?.acc ?? 94,
    completed: false,
    xpReward: 100 + (difficulties.findIndex(d => d.wpm === wpm) * 50 || 100),
  }
}

export function DailyChallengeManager() {
  const { i18n } = useTranslation()
  const [challenges, setChallenges] = useState<DailyChallenge[]>([])
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastPracticeDate: null, practiceDates: [] })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDate, setNewDate] = useState(getTodayDate())
  const [newText, setNewText] = useState('')
  const [newWpm, setNewWpm] = useState(40)
  const [newAcc, setNewAcc] = useState(94)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHALLENGES_KEY)
      if (stored) setChallenges(JSON.parse(stored))
      const storedStreak = localStorage.getItem(STREAK_KEY)
      if (storedStreak) setStreak(JSON.parse(storedStreak))
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    if (challenges.length > 0) {
      try { localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges)) } catch { /* */ }
    }
  }, [challenges])

  const stats = useMemo(() => {
    const total = challenges.length
    const completed = challenges.filter(c => c.completed).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const totalCompletions = parseInt(localStorage.getItem(COMPLETIONS_KEY) || '0')
    return { total, completed, completionRate, totalCompletions }
  }, [challenges])

  const todayChallenge = useMemo(
    () => challenges.find(c => c.date === getTodayDate()),
    [challenges],
  )

  const handleCreateChallenge = useCallback(() => {
    const newChallenge = generateChallenge(newDate, newText || undefined, newWpm, newAcc)
    setChallenges(prev => {
      const existing = prev.findIndex(c => c.date === newDate)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newChallenge
        return updated
      }
      return [...prev, newChallenge].sort((a, b) => a.date.localeCompare(b.date)).slice(-60)
    })
    setShowCreateModal(false)
    setNewText('')
    setNewWpm(40)
    setNewAcc(94)
  }, [newDate, newText, newWpm, newAcc])

  const handleDeleteChallenge = useCallback((date: string) => {
    setChallenges(prev => prev.filter(c => c.date !== date))
  }, [])

  const handleResetCompletions = useCallback(() => {
    if (!confirm('Сбросить счётчик выполненных ежедневных заданий?')) return
    localStorage.setItem(COMPLETIONS_KEY, '0')
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-dark-400 mt-1">Всего челленджей</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-success">{stats.completed}</div>
          <div className="text-xs text-dark-400 mt-1">Выполнено</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary-400">{stats.completionRate}%</div>
          <div className="text-xs text-dark-400 mt-1">Процент выполнения</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{streak.current}</div>
          <div className="text-xs text-dark-400 mt-1">Текущая серия</div>
        </div>
      </div>

      {/* Today's challenge */}
      {todayChallenge && (
        <div className={`glass rounded-xl p-5 ${todayChallenge.completed ? 'border border-green-500/30 bg-green-500/5' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>{todayChallenge.completed ? '✅' : '🎯'}</span>
              Челлендж на сегодня
            </h3>
            <span className="text-sm text-dark-400">{new Date(todayChallenge.date + 'T00:00:00').toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-dark-800/50 rounded-lg p-3">
              <div className="text-xs text-dark-400">Текст</div>
              <div className="text-white font-medium truncate" title={todayChallenge.text}>{todayChallenge.text.slice(0, 30)}...</div>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-3">
              <div className="text-xs text-dark-400">Цель WPM</div>
              <div className="text-success font-bold text-lg">{todayChallenge.targetWpm}</div>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-3">
              <div className="text-xs text-dark-400">Цель точность</div>
              <div className="text-blue-400 font-bold text-lg">{todayChallenge.targetAccuracy}%</div>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-3">
              <div className="text-xs text-dark-400">Награда XP</div>
              <div className="text-yellow-400 font-bold text-lg">{todayChallenge.xpReward}</div>
            </div>
          </div>
          {todayChallenge.completed && todayChallenge.userWpm && (
            <div className="mt-3 text-sm text-success">
              Выполнено: {todayChallenge.userWpm} WPM, {todayChallenge.userAccuracy}% точность
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm transition-colors"
        >
          + Создать челлендж
        </button>
        <button
          onClick={handleResetCompletions}
          className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors"
        >
          Сбросить счётчик выполнений
        </button>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-white mb-4">Создать ежедневный челлендж</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="dc-date" className="block text-sm text-dark-400 mb-1">Дата</label>
                <input
                  id="dc-date"
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label htmlFor="dc-text" className="block text-sm text-dark-400 mb-1">Текст (необязательно)</label>
                <textarea
                  id="dc-text"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm resize-none"
                  placeholder="Оставьте пустым для автоматической генерации"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dc-wpm" className="block text-sm text-dark-400 mb-1">Цель WPM</label>
                  <input
                    id="dc-wpm"
                    type="number"
                    value={newWpm}
                    onChange={e => setNewWpm(parseInt(e.target.value) || 40)}
                    min={10}
                    max={200}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="dc-acc" className="block text-sm text-dark-400 mb-1">Цель точность (%)</label>
                  <input
                    id="dc-acc"
                    type="number"
                    value={newAcc}
                    onChange={e => setNewAcc(parseInt(e.target.value) || 94)}
                    min={80}
                    max={100}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateChallenge}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm"
              >
                Создать
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge history */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">История челленджей</h3>
        {challenges.length === 0 ? (
          <div className="text-center text-dark-500 py-8">Челленджи ещё не созданы</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...challenges].reverse().map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm py-2 px-3 bg-dark-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={c.completed ? 'text-success' : 'text-dark-400'}>
                    {c.completed ? '✅' : '⏳'}
                  </span>
                  <div>
                    <div className="text-white font-medium">
                      {new Date(c.date + 'T00:00:00').toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs text-dark-500">{c.text.slice(0, 40)}...</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-dark-300 text-xs">Цель: {c.targetWpm} WPM / {c.targetAccuracy}%</div>
                    {c.completed && c.userWpm && (
                      <div className="text-success text-xs">Результат: {c.userWpm} WPM / {c.userAccuracy}%</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteChallenge(c.date)}
                    className="text-dark-500 hover:text-error transition-colors"
                    title="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
