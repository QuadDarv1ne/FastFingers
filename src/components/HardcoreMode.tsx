import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TypingStats } from '../types'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from '../hooks/useTypingSound'
import { useAuth } from '@hooks/useAuth'
import { useSupabase } from '@hooks/useSupabase'
import { CertificateGenerator } from './CertificateGenerator'
import { useHardcoreMode } from '@hooks/useHardcoreMode'
import { simulateInput } from '../utils/inputEvent'
import { useHotkey } from '../hooks/useHotkeys'
import { getRankByStreak, getRankProgress, checkRankUp, getRankUpMessage } from '../utils/hardcoreRank'
import type { HardcoreRank } from '../utils/hardcoreRank'
import { createAchievementNotification } from '../utils/notifications'
import { useNotifications } from '../contexts/NotificationContext'
import { useToast } from '../contexts/ToastContext'
import { logger } from '../utils/logger'
import { triggerConfetti } from '../utils/confetti'
import { StatCard } from './ui/StatCard'
import { useAppTranslation } from '../i18n/config'

interface HardcoreModeProps {
  onExit: () => void
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
}

interface HardcoreRecord {
  id: string
  user_id: string
  streak: number
  wpm: number
  accuracy: number
  created_at: string
}

const RETRY_ATTEMPTS = 3

export const HardcoreMode = memo<HardcoreModeProps>(function HardcoreMode({
  onExit,
  onComplete,
  sound,
}: HardcoreModeProps) {
  const { t } = useAppTranslation()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { showToast } = useToast()
  const { client: supabase, isReady: supabaseReady } = useSupabase()
  const [showCertificate, setShowCertificate] = useState(false)
  const [lastStats, setLastStats] = useState<TypingStats | null>(null)
  const [records, setRecords] = useState<HardcoreRecord[]>([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(true)
  const [bestStreak, setBestStreak] = useState(0)
  const [previousStreak, setPreviousStreak] = useState(0)
  const [showRankUp, setShowRankUp] = useState(false)
  const [currentRank, setCurrentRank] = useState<HardcoreRank>('C')
  const rankUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const {
    text,
    currentIndex,
    inputResults,
    isActive,
    countdown,
    streak,
    startTime,
    inputRef,
    handleInput,
    handleStart,
    resetGame,
  } = useHardcoreMode({ onComplete, sound, setBestStreak })

  // Обновление текущего ранга при изменении streak
  useEffect(() => {
    const rank = getRankByStreak(streak)
    setCurrentRank(rank.rank)

    // Проверка на повышение ранга
    if (checkRankUp(previousStreak, streak) && streak > 0) {
      const newRank = getRankByStreak(streak)
      setShowRankUp(true)
      addNotification(createAchievementNotification({
        title: t('hardcore.rankUp'),
        description: getRankUpMessage(newRank),
        icon: newRank.rank,
      }))

      if (['S', 'S+', 'SS', 'SS+', '👑'].includes(newRank.rank)) {
        void triggerConfetti({ type: 'celebration', duration: 3000 })
      }

      if (rankUpTimerRef.current) clearTimeout(rankUpTimerRef.current)
      rankUpTimerRef.current = setTimeout(() => setShowRankUp(false), 4000)
    }

    if (streak !== previousStreak) {
      setPreviousStreak(streak)
    }

    return () => {
      if (rankUpTimerRef.current) clearTimeout(rankUpTimerRef.current)
    }
  }, [streak, previousStreak, addNotification, t])

  // Track mount status to prevent setState after unmount
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadRecords = async () => {
      if (!user || !supabase || !supabaseReady) {
        if (!cancelled) setIsLoadingRecords(false)
        return
      }

      try {
        let retries = RETRY_ATTEMPTS
        while (retries > 0 && !cancelled) {
          const { data, error } = await supabase
            .from('hardcore_records')
            .select('*')
            .eq('user_id', user.id)
            .order('streak', { ascending: false })
            .limit(10)

          if (!error) {
            if (!cancelled) {
              setRecords(data || [])
              if (data && data.length > 0) {
                const firstRecord = data[0]
                if (firstRecord) setBestStreak(firstRecord.streak)
              }
            }
            return
          }
          retries--
          if (retries > 0 && !cancelled) await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)))
        }
        if (!cancelled && retries === 0) {
          showToastRef.current?.(t('error.recordLoadFailed'), 'error', 5000)
        }
      } finally {
        if (!cancelled) setIsLoadingRecords(false)
      }
    }

    loadRecords()
    return () => { cancelled = true }
  }, [user, supabase, supabaseReady, t])

  const hasSavedRef = useRef(false)
  const inputResultsRef = useRef(inputResults)
  const startTimeRef = useRef(startTime)
  const streakRef = useRef(streak)
  const onCompleteRef = useRef(onComplete)
  const showToastRef = useRef(showToast)

  // Sync refs — single effect instead of 5 separate ones
  useEffect(() => {
    inputResultsRef.current = inputResults
    startTimeRef.current = startTime
    streakRef.current = streak
    onCompleteRef.current = onComplete
    showToastRef.current = showToast
  }, [inputResults, startTime, streak, onComplete, showToast])

  useEffect(() => {
    const results = inputResultsRef.current
    const start = startTimeRef.current
    const currentStreak = streakRef.current

    if (!isActive && results.length > 0 && start && user && supabaseReady && currentStreak > 0 && !hasSavedRef.current) {
      hasSavedRef.current = true
      const correct = results.filter(r => r?.isCorrect).length
      const timeElapsed = (Date.now() - start) / 1000
      const errors = results.length - correct
      const stats = calculateStats(correct, results.length, errors, timeElapsed)

      if (!mountedRef.current) return
      setLastStats(stats)
      showToastRef.current(t('hardcore.sessionResult', { streak: currentStreak, wpm: stats.wpm }), currentStreak > 10 ? 'success' : 'info', 4000)
      onCompleteRef.current(stats)

      const saveRecord = async () => {
        let retries = RETRY_ATTEMPTS
        let saved = false
        while (retries > 0 && mountedRef.current) {
          const result = await supabase?.from('hardcore_records').insert({
            user_id: user.id,
            streak: currentStreak,
            wpm: stats.wpm,
            accuracy: stats.accuracy,
          })
          if (!result?.error) {
            saved = true
            break
          }
          retries--
          if (retries > 0 && mountedRef.current) await new Promise(resolve => setTimeout(resolve, 500))
        }
        if (!mountedRef.current) return
        if (!saved) {
          showToastRef.current(t('hardcore.saveError'), 'error', 5000)
        }
      }

      saveRecord().catch((error) => {
        if (!mountedRef.current) return
        logger.error('Failed to save hardcore record:', error)
        showToastRef.current(t('hardcore.saveError'), 'error', 5000)
      })
      if (mountedRef.current) setShowCertificate(true)
    }
  }, [isActive, user, supabase, supabaseReady, t])

  // Reset saved flag when starting a new session
  useEffect(() => {
    if (isActive) {
      hasSavedRef.current = false
    }
  }, [isActive])

  const { wpm, accuracy } = useMemo(() => {
    if (inputResults.length === 0 || !startTime) return { wpm: 0, accuracy: 0 }
    const correct = inputResults.filter(r => r.isCorrect).length
    const timeInMinutes = (Date.now() - startTime) / 60000
    return {
      wpm: timeInMinutes > 0 ? Math.round(correct / 5 / timeInMinutes) : 0,
      accuracy: inputResults.length > 0 ? Math.round((correct / inputResults.length) * 100) : 0,
    }
  }, [inputResults, startTime])

  useHotkey('escape', () => { if (countdown === null && !isActive) onExit() }, { enabled: true })
  useHotkey('r', () => { if (countdown === null && !isActive) handleStart() }, { enabled: true })

  const handleSkip = useCallback(() => {
    resetGame()
    inputRef.current?.focus({ preventScroll: true })
  }, [resetGame, inputRef])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length > 1 && e.key !== 'Enter') return
    e.preventDefault()
    const input = e.currentTarget
    input.value = e.key === 'Enter' ? '\n' : e.key
    handleInput(simulateInput(input))
  }, [handleInput])

  const textProgress = text.length > 0 ? (currentIndex / text.length) * 100 : 0

  const renderedChars = useMemo(() => {
    return text.split('').map((char, index) => {
      let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
      if (index < currentIndex) status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
      else if (index === currentIndex && isActive) status = 'current'
      return (
        <span
          key={index}
          className={`px-0.5 rounded ${
            status === 'correct' ? 'bg-green-500/20 text-green-400' :
            status === 'incorrect' ? 'bg-red-500/20 text-red-400' :
            status === 'current' ? 'bg-primary-500/30 text-primary-300 animate-pulse' :
            'text-dark-500'
          }`}
        >
          {char === ' ' ? '␣' : char}
        </span>
      )
    })
  }, [text, currentIndex, inputResults, isActive])

  return (
    <div className="glass rounded-xl p-8 relative overflow-hidden border-red-500/20">
      {/* Rank Up Animation */}
      <AnimatePresence>
        {showRankUp && (() => {
          const rankInfo = getRankByStreak(streak)
          return (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 rounded-xl shadow-2xl border border-primary-300"
          >
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-1">
                🎉 {rankInfo.rank} <span className="text-lg font-medium">| {rankInfo.name}</span>
              </div>
              <div className="text-sm text-white/90">{getRankUpMessage(rankInfo)}</div>
            </div>
          </motion.div>
          )
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-900/90 z-50 flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-9xl font-bold text-red-500"
            >
              {countdown || 'GO'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
            <span>💀</span> {t('hardcore.title')}
          </h2>
          <p className="text-sm text-dark-400">{t('hardcore.subtitle')}</p>
        </div>
        {!isActive && countdown === null && (
          <button onClick={handleStart} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-all" aria-label={t('action.start')}>
            {t('action.start')} (R)
          </button>
        )}
      </div>

      {/* Rank info memoized to avoid redundant calls */}
      {useMemo(() => {
        const rankInfo = getRankByStreak(streak)
        const progressPct = getRankProgress(streak)

        return (
      <div className="mb-4 p-4 bg-gradient-to-r from-dark-800 to-dark-700 rounded-xl border border-dark-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-400">{t('hardcore.currentRank')}</span>
          <span className="text-xs text-dark-500">{rankInfo.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-4xl font-black"
            style={{ color: rankInfo.color, textShadow: `0 0 20px ${rankInfo.color}40` }}
          >
            {currentRank}
          </span>
          <div className="flex-1">
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{ backgroundColor: rankInfo.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-xs text-dark-500 mt-1">
              {t('hardcore.rankProgress', { pct: progressPct })}
            </div>
          </div>
        </div>
      </div>
        )
      }, [streak, currentRank, t])}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard size="sm" label={t('hardcore.streak')} value={streak.toString()} icon="🔥" />
        <StatCard size="sm" label={t('common.wpm')} value={wpm.toString()} icon="⚡" />
        <StatCard size="sm" label={t('common.accuracy')} value={`${accuracy}%`} icon="🎯" />
      </div>

      {bestStreak > 0 && (
        <div className="mb-4 p-3 bg-dark-800/50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-dark-400">{t('hardcore.bestStreak')}</span>
          <span className="text-lg font-bold text-primary-400">{bestStreak} 🔥</span>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.focus({ preventScroll: true }) }}
        role="button"
        tabIndex={0}
        aria-label={t('hardcore.inputArea')}
        className="bg-dark-800/50 rounded-xl p-6 cursor-text min-h-[120px] relative mb-4 border border-red-500/10"
      >
        <input ref={inputRef} type="text" className="opacity-0 absolute" onKeyDown={handleKeyDown} aria-label={t('hardcore.inputField')} />
        <div className="font-mono text-lg leading-relaxed break-words">
          {renderedChars}
        </div>
      </div>

      <div className="mb-6" role="progressbar" aria-valuenow={currentIndex} aria-valuemin={0} aria-valuemax={text.length} aria-label={t('trainer.aria.progress')}>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-dark-400">{t('trainer.progressLabel')}</span>
          <span className="text-primary-400 font-bold">{Math.round(textProgress)}%</span>
        </div>
        <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400" initial={{ width: 0 }} animate={{ width: `${textProgress}%` }} transition={{ duration: 0.2 }} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={handleSkip} className="px-4 py-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all text-sm font-medium flex items-center gap-2" aria-label={t('action.skip')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          {t('action.skip')}
        </button>
        <button onClick={onExit} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm font-medium transition-all" aria-label={t('action.exit')}>{t('action.exit')}</button>
      </div>

      {isLoadingRecords && <div className="mt-6 text-center text-dark-400 text-sm">{t('hardcore.loadingRecords')}</div>}

      {!isLoadingRecords && records.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-dark-300">🏆 {t('hardcore.yourRecords')}</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {records.slice(0, 5).map((record, i) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                <span className="text-sm text-dark-400">#{i + 1}</span>
                <span className="font-bold text-primary-400">{record.streak} 🔥</span>
                <span className="text-xs text-dark-500">{record.wpm} WPM</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCertificate && lastStats && user && (
        <CertificateGenerator
          user={user}
          wpm={lastStats.wpm}
          accuracy={lastStats.accuracy}
          cpm={lastStats.cpm}
          testType="hardcore"
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  )
})
