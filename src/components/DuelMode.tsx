/**
 * DuelMode — Режим дуэли 1 на 1
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TypingStats } from '../types'
import { useTypingSound } from '../hooks/useTypingSound'
import { useHotkey } from '../hooks/useHotkeys'
import { useTypingGame } from '@hooks/useTypingGame'
import { simulateInput } from '../utils/inputEvent'
import { useAuth } from '@hooks/useAuth'
import { useDuels, DuelsData } from '@hooks/useLeaderboard'
import { useSupabase } from '@hooks/useSupabase'
import { logger } from '../utils/logger'
import { useToast } from '@contexts/ToastContext'
import { useCountdown } from '@hooks/useCountdown'
import { TypingTextDisplay } from './ui/TypingTextDisplay'

import { useAppTranslation } from '../i18n/config'

interface DuelModeProps {
  onExit: () => void
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
}

type DuelState = 'lobby' | 'searching' | 'challenging' | 'waiting' | 'active' | 'completed'
type DuelDuration = 30 | 60 | 120

interface DuelChallenge {
  id: string
  challenger: { id: string; name: string; avatar?: string }
  opponent: { id: string; name: string; avatar?: string }
  /** Supabase row format — present when duel comes directly from the database */
  challenger_id?: string
  opponent_id?: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  duration: DuelDuration
  betAmount: number
  challenger_wpm?: number
  opponent_wpm?: number
  challenger_accuracy?: number
  opponent_accuracy?: number
}

const DURATION_OPTIONS: DuelDuration[] = [30, 60, 120]

export const DuelMode = memo(function DuelMode({ onExit, onComplete, sound }: DuelModeProps) {
  const { t } = useAppTranslation()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { client: supabase, isReady: supabaseReady } = useSupabase()
  const { useUserDuels, completeDuel } = useDuels()

  const [duelState, setDuelState] = useState<DuelState>('lobby')
  const [duration, setDuration] = useState<DuelDuration>(60)
  const [betAmount, setBetAmount] = useState(0)
  const [currentDuel, setCurrentDuel] = useState<DuelChallenge | null>(null)
  const [opponentWpm, setOpponentWpm] = useState(0)
  const [opponentAccuracy, setOpponentAccuracy] = useState(100)
  const [message, setMessage] = useState('')

  const {
    text,
    currentIndex,
    inputResults,
    isActive,
    wpm,
    accuracy,
    timeLeft,
    inputRef,
    handleInput: handleInputBase,
    handleStart: startGame,
  } = useTypingGame({
    initialWordCount: 50,
    initialDifficulty: 5,
    mode: 'timed',
    duration: duration,
    onComplete: (stats) => {
      handleDuelComplete(stats)
    },
    sound,
  })

  const { countdown, start: startCountdown } = useCountdown({
    onComplete: startGame,
  })

  // Загрузка дуэлей пользователя
  const { data: userDuels } = useUserDuels(user?.id)

  // Старт с обратным отсчётом
  const handleStart = useCallback(() => {
    startCountdown(3)
  }, [startCountdown])

  // Throttled Supabase progress updates (max once per 500ms)
  const lastUpdateRef = useRef(0)
  const pendingUpdateRef = useRef<{ wpm: number; accuracy: number; isChallenger: boolean } | null>(null)
  const duelStateRef = useRef(duelState)
  const wpmRef = useRef(wpm)
  const accuracyRef = useRef(accuracy)
  const currentDuelRef = useRef(currentDuel)
  const userRef = useRef(user)
  const mountedRef = useRef(true)
  duelStateRef.current = duelState
  wpmRef.current = wpm
  accuracyRef.current = accuracy
  currentDuelRef.current = currentDuel
  userRef.current = user

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Подписка на обновления дуэли (real-time)
  useEffect(() => {
    const duel = currentDuelRef.current
    const curUser = userRef.current
    if (!duel?.id || !supabase || !supabaseReady) return

    const channel = supabase
      .channel(`duel:${duel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `id=eq.${duel.id}`,
        },
        (payload) => {
          const updatedDuel = payload.new as DuelChallenge
          setCurrentDuel(updatedDuel)

          // Extract opponent WPM and accuracy based on user role
          const currentDuel = currentDuelRef.current
          const isChallenger = currentDuel?.challenger?.id === curUser?.id
          const oppWpm = isChallenger
            ? Number(updatedDuel.opponent_wpm) || 0
            : Number(updatedDuel.challenger_wpm) || 0
          const oppAccuracy = isChallenger
            ? Number(updatedDuel.opponent_accuracy) || 100
            : Number(updatedDuel.challenger_accuracy) || 100
          setOpponentWpm(oppWpm)
          setOpponentAccuracy(oppAccuracy)

          if (updatedDuel.status === 'active' && duelStateRef.current === 'waiting') {
            setDuelState('active')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, supabaseReady, currentDuel?.id])

  // Поиск случайного соперника
  const findRandomOpponent = useCallback(async () => {
    if (!user?.id || !supabase || !supabaseReady) return

    setDuelState('searching')
    setMessage(t('duel.searching'))

    try {
      const { data, error } = await supabase
        .from('duels')
        .select('id, challenger_id')
        .eq('status', 'pending')
        .neq('challenger_id', user.id)
        .eq('duration', duration)
        .limit(1)
        .single()

      if (error || !data) {
        const { data: newDuel, error: createError } = await supabase
          .from('duels')
          .insert({
            challenger_id: user.id,
            opponent_id: null,
            status: 'pending',
            duration,
            bet_amount: betAmount,
          })
          .select()
          .single()

        if (createError) throw createError
        if (!mountedRef.current) return

        setCurrentDuel(newDuel)
        setDuelState('waiting')
        setMessage(t('duel.waiting'))
      } else {
        const { error: acceptError } = await supabase
          .from('duels')
          .update({
            opponent_id: user.id,
            status: 'active',
          })
          .eq('id', data.id)

        if (acceptError) throw acceptError
        if (!mountedRef.current) return

        setCurrentDuel({
          id: data.id,
          challenger: { id: data.challenger_id, name: 'Opponent' },
          opponent: { id: user.id, name: 'You' },
          status: 'active',
          duration: duration,
          betAmount: betAmount,
        })
        setDuelState('active')
        handleStart()
      }
    } catch (err) {
      if (!mountedRef.current) return
      logger.error('Error finding opponent:', err)
      setMessage(t('duel.errorSearch'))
      setDuelState('lobby')
    }
  }, [user?.id, supabase, supabaseReady, duration, betAmount, handleStart, t])

  // Завершение дуэли
  const handleDuelComplete = useCallback(async (stats: TypingStats) => {
    const duel = currentDuelRef.current
    const curUser = userRef.current
    if (!duel || !curUser?.id) return

    try {
      // Support both full objects (local) and ID-only (from Supabase)
      const challengerId = duel.challenger_id ?? duel.challenger?.id
      const opponentId = duel.opponent_id ?? duel.opponent?.id
      if (!challengerId || !opponentId) return
      const isChallenger = challengerId === curUser.id
      const userScore = Math.round(stats.wpm * (stats.accuracy / 100))
      const opponentScore = Math.round(opponentWpm * (opponentAccuracy / 100))

      // Determine winner by comparing scores
      const userWon = userScore > opponentScore

      await completeDuel.mutateAsync({
        duelId: duel.id,
        winnerId: userWon ? curUser.id : (isChallenger ? opponentId : challengerId),
        challengerScore: isChallenger ? userScore : opponentScore,
        opponentScore: isChallenger ? opponentScore : userScore,
        challengerWpm: isChallenger ? stats.wpm : opponentWpm,
        opponentWpm: isChallenger ? opponentWpm : stats.wpm,
        challengerAccuracy: isChallenger ? stats.accuracy : opponentAccuracy,
        opponentAccuracy: isChallenger ? opponentAccuracy : stats.accuracy,
      })

      onComplete(stats)
      setDuelState('completed')
    } catch (err) {
      logger.error('Error completing duel:', err)
      showToast(t('error.duelFailed'), 'error', 5000)
    }
  }, [opponentWpm, opponentAccuracy, completeDuel, onComplete, showToast, t])

  const flushDuelProgress = useCallback(async () => {
    const duel = currentDuelRef.current
    if (!duel?.id || !supabase || !supabaseReady) return
    // Snapshot pending update before clearing to avoid race condition
    const pending = pendingUpdateRef.current
    if (!pending) return
    pendingUpdateRef.current = null
    try {
      await supabase
        .from('duels')
        .update(
          pending.isChallenger
            ? { challenger_wpm: pending.wpm, challenger_accuracy: pending.accuracy }
            : { opponent_wpm: pending.wpm, opponent_accuracy: pending.accuracy }
        )
        .eq('id', duel.id)
    } catch (err) {
      // Re-queue pending update if it failed so it can be retried
      pendingUpdateRef.current = pending
      logger.error('Failed to flush duel progress:', err)
    }
  }, [supabase, supabaseReady])

  // Stable ref to flushDuelProgress for use in throttled handler
  const flushRef = useRef(flushDuelProgress)
  flushRef.current = flushDuelProgress

  // Обработка ввода с обновлением прогресса (throttled)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length > 1 && e.key !== 'Enter') return
    e.preventDefault()
    const input = e.currentTarget
    input.value = e.key === 'Enter' ? '\n' : e.key
    handleInputBase(simulateInput(input))
    const duel = currentDuelRef.current
    const challengerId = duel?.challenger_id ?? duel?.challenger?.id
    const isChallenger = challengerId === userRef.current?.id
    pendingUpdateRef.current = { wpm: wpmRef.current, accuracy: accuracyRef.current, isChallenger }
    const now = Date.now()
    if (now - lastUpdateRef.current >= 500) {
      lastUpdateRef.current = now
      flushRef.current().catch((err) => logger.error('Failed to flush duel progress:', err))
    }
  }, [handleInputBase])

  // Flush pending updates when duel ends
  useEffect(() => {
    if (duelState === 'completed') {
      flushDuelProgress().catch((err) => logger.error('Failed to flush duel progress on completion:', err))
    }
  }, [duelState, flushDuelProgress])

  // Горячие клавиши
  useHotkey('escape', () => {
    if (countdown === null && duelState !== 'active') {
      onExit()
    }
  }, { enabled: true, ignoreInputFocus: true })

  // Прогресс времени
  const timeProgress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0

  return (
    <div className="glass rounded-xl p-8 relative overflow-hidden">
      {/* Overlay с обратным отсчётом */}
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
              className="text-9xl font-bold text-primary-400"
            >
              {countdown || 'GO'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
            ⚔️ {t('duel.title')}
          </h2>
          <p className="text-sm text-dark-400">
            {duelState === 'lobby' && t('duel.subtitleLobby')}
            {duelState === 'searching' && t('duel.searching')}
            {duelState === 'waiting' && t('duel.waiting')}
            {duelState === 'active' && t('duel.active')}
            {duelState === 'completed' && t('duel.completed')}
          </p>
        </div>

        <button
          onClick={onExit}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          title={t('action.exit')}
          aria-label={t('action.exit')}
          disabled={duelState === 'active'}
        >
          <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Лобби */}
      {duelState === 'lobby' && (
        <div className="space-y-6">
          {/* Сообщение об ошибке */}
          {message && (
            <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-center">
              <p className="text-error font-medium">{message}</p>
            </div>
          )}

          {/* Выбор длительности */}
          <div>
            <span id="duration-label" className="block text-sm text-dark-400 mb-2">{t('duel.duration')}</span>
            <div className="flex gap-2" role="group" aria-labelledby="duration-label">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    duration === d
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                  }`}
                >
                  {t(`duel.duration.${d}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Ставка */}
          <div>
            <label htmlFor="bet-amount" className="block text-sm text-dark-400 mb-2">{t('duel.bet')}</label>
            <input
              id="bet-amount"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
              max="1000"
              step="10"
            />
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <button
              onClick={findRandomOpponent}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all"
              aria-label={t('duel.quickMatch')}
            >
              🎯 {t('duel.quickMatch')}
            </button>
            <button
              className="w-full py-4 bg-dark-800 hover:bg-dark-700 rounded-xl font-medium transition-all"
              disabled
              aria-label={t('duel.findFriend')}
            >
              🔍 {t('duel.findFriend')}
            </button>
          </div>

          {/* История дуэлей */}
          {userDuels && userDuels.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-dark-300 mb-3">{t('duel.recentDuels')}</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userDuels.slice(0, 5).map((duel: DuelsData) => {
                  const isChallenger = duel.challenger_id === user?.id
                  const isWinner = duel.winner_id === user?.id
                  return (
                    <div key={duel.id} className="p-3 bg-dark-800 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {isChallenger ? t('duel.you') : t('duel.challenge')} vs{' '}
                          {isChallenger
                            ? duel.opponent?.name || '???'
                            : duel.challenger?.name || '???'}
                        </p>
                        <p className="text-xs text-dark-500">
                          {duel.status === 'completed'
                            ? isWinner
                              ? `🏆 ${t('duel.win')}`
                              : `❌ ${t('duel.loss')}`
                            : duel.status === 'active'
                            ? `🔴 ${t('duel.inProgress')}`
                            : `⏳ ${t('duel.waitingStatus')}`}
                        </p>
                      </div>
                      <span className="text-xs text-dark-500">
                        {duel.duration && t(`duel.duration.${duel.duration}`)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ожидание соперника */}
      {duelState === 'waiting' && (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg text-dark-300">{message}</p>
          <p className="text-sm text-dark-500 mt-2">{t('duel.escapeHint')}</p>
        </div>
      )}

      {/* Активная дуэль */}
      {duelState === 'active' && (
        <div className="space-y-6">
          {/* Прогресс соперников */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">{t('duel.you')}</p>
              <p className="text-2xl font-bold text-primary-400">{wpm} {t('common.wpm')}</p>
              <div className="mt-2 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 transition-all" style={{ width: `${timeProgress}%` }} />
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">{t('duel.opponent')}</p>
              <p className="text-2xl font-bold text-purple-400">{opponentWpm} {t('common.wpm')}</p>
              <p className="text-xs text-dark-500">{opponentAccuracy}% {t('common.accuracy')}</p>
              <div className="mt-2 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 transition-all" style={{ width: `${Math.min(opponentWpm / 2, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Таймер */}
          <div className="text-center">
            <p className={`text-5xl font-bold font-mono ${timeLeft <= 10 ? 'text-error animate-pulse' : 'text-primary-400'}`}>
              {timeLeft}s
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">{t('common.wpm')}</p>
              <p className="text-2xl font-bold text-primary-400">{wpm}</p>
            </div>
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">{t('common.accuracy')}</p>
              <p className="text-2xl font-bold text-success">{accuracy}%</p>
            </div>
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">{t('duel.symbols')}</p>
              <p className="text-2xl font-bold text-dark-300">{currentIndex}</p>
            </div>
          </div>

          {/* Область ввода */}
          <div className="bg-dark-800/50 rounded-xl p-6 min-h-[100px] relative">
            <input
              ref={inputRef}
              type="text"
              className="sr-only"
              onKeyDown={handleKeyDown}
              disabled={!isActive}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <TypingTextDisplay
              text={text}
              currentIndex={currentIndex}
              inputResults={inputResults}
              isActive={isActive}
            />
          </div>
        </div>
      )}

      {/* Завершённая дуэль */}
      {duelState === 'completed' && (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-5xl">🏆</span>
          </motion.div>
          <h3 className="text-2xl font-bold text-gradient mb-4">{t('duel.completedTitle')}</h3>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-dark-800 rounded-lg p-4">
              <p className="text-sm text-dark-400">{t('duel.yourWpm')}</p>
              <p className="text-2xl font-bold text-primary-400">{wpm}</p>
            </div>
            <div className="bg-dark-800 rounded-lg p-4">
              <p className="text-sm text-dark-400">{t('duel.opponentWpm')}</p>
              <p className="text-2xl font-bold text-purple-400">{opponentWpm}</p>
              <p className="text-xs text-dark-500">{opponentAccuracy}% {t('common.accuracy')}</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-medium transition-all"
            aria-label={t('duel.continue')}
          >
            {t('duel.continue')}
          </button>
        </div>
      )}
    </div>
  )
})
