/**
 * DuelMode — Режим дуэли 1 на 1
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingStats } from '../types'
import { useTypingSound } from '../hooks/useTypingSound'
import { useHotkey } from '../hooks/useHotkeys'
import { useTypingGame } from '@hooks/useTypingGame'
import { useAuth } from '@hooks/useAuth'
import { useDuels, DuelsData } from '@hooks/useLeaderboard'
import { supabase } from '../services/supabase'
import { logger } from '../utils/logger'

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
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  duration: DuelDuration
  betAmount: number
  challenger_wpm?: number
  opponent_wpm?: number
}

const DURATION_LABELS: Record<DuelDuration, string> = {
  30: '30 секунд',
  60: '1 минута',
  120: '2 минуты',
}

export function DuelMode({ onExit, onComplete, sound }: DuelModeProps) {
  const { user } = useAuth()
  const { useUserDuels, completeDuel } = useDuels()

  const [duelState, setDuelState] = useState<DuelState>('lobby')
  const [duration, setDuration] = useState<DuelDuration>(60)
  const [betAmount, setBetAmount] = useState(0)
  const [currentDuel, setCurrentDuel] = useState<DuelChallenge | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [opponentWpm, setOpponentWpm] = useState(0)
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

  // Загрузка дуэлей пользователя
  const { data: userDuels } = useUserDuels(user?.id)

  // Старт с обратным отсчётом (объявлен здесь для использования в useEffect)
  const handleStart = useCallback(() => {
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          startGame()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [startGame])

  // Подписка на обновления дуэли (real-time)
  useEffect(() => {
    if (!currentDuel?.id || !supabase) return

    const channel = supabase
      .channel(`duel:${currentDuel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `id=eq.${currentDuel.id}`,
        },
        (payload) => {
          const updatedDuel = payload.new as DuelChallenge
          setCurrentDuel(updatedDuel)

          // Extract opponent WPM based on user role
          const isChallenger = currentDuel?.challenger?.id === user?.id
          const oppWpm = isChallenger
            ? (updatedDuel.opponent_wpm as number) ?? 0
            : (updatedDuel.challenger_wpm as number) ?? 0
          setOpponentWpm(oppWpm)

          if (updatedDuel.status === 'active' && duelState === 'waiting') {
            setDuelState('active')
          }
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [currentDuel?.id, duelState, user?.id])

  // Поиск случайного соперника
  const findRandomOpponent = useCallback(async () => {
    if (!user?.id || !supabase) return

    setDuelState('searching')
    setMessage('Поиск соперника...')

    try {
      // Ищем активные дуэли без соперника
      const { data, error } = await supabase
        .from('duels')
        .select('id, challenger_id')
        .eq('status', 'pending')
        .neq('challenger_id', user.id)
        .eq('duration', duration)
        .limit(1)
        .single()

      if (error || !data) {
        // Создаём новый вызов для поиска
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

        setCurrentDuel(newDuel)
        setDuelState('waiting')
        setMessage('Ожидание соперника...')
      } else {
        // Нашли дуэль - принимаем вызов
        const { error: acceptError } = await supabase
          .from('duels')
          .update({
            opponent_id: user.id,
            status: 'active',
          })
          .eq('id', data.id)

        if (acceptError) throw acceptError

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
      logger.error('Error finding opponent:', err)
      setMessage('Ошибка поиска соперника')
      setDuelState('lobby')
    }
  }, [user?.id, duration, betAmount, handleStart])

  // Завершение дуэли
  const handleDuelComplete = useCallback(async (stats: TypingStats) => {
    if (!currentDuel || !user?.id) return

    try {
      const isChallenger = currentDuel.challenger.id === user.id
      const userScore = Math.round(stats.wpm * (stats.accuracy / 100))
      const opponentScore = Math.round(opponentWpm * 0.8) // opponent accuracy assumed 80% if not received

      // Determine winner by comparing scores
      const userWon = userScore > opponentScore

      await completeDuel.mutateAsync({
        duelId: currentDuel.id,
        winnerId: userWon ? user.id : (isChallenger ? currentDuel.opponent.id : currentDuel.challenger.id),
        challengerScore: isChallenger ? userScore : opponentScore,
        opponentScore: isChallenger ? opponentScore : userScore,
        challengerWpm: isChallenger ? stats.wpm : opponentWpm,
        opponentWpm: isChallenger ? opponentWpm : stats.wpm,
        challengerAccuracy: isChallenger ? stats.accuracy : 80,
        opponentAccuracy: isChallenger ? 80 : stats.accuracy,
      })

      onComplete(stats)
      setDuelState('completed')
    } catch (err) {
      logger.error('Error completing duel:', err)
    }
  }, [currentDuel, user?.id, opponentWpm, completeDuel, onComplete])

  // Throttled Supabase progress updates (max once per 500ms)
  const lastUpdateRef = useRef(0)
  const pendingUpdateRef = useRef<{ wpm: number; accuracy: number } | null>(null)

  const flushDuelProgress = useCallback(() => {
    const pending = pendingUpdateRef.current
    if (!pending || !currentDuel?.id || !supabase) return
    const isChallenger = currentDuel.challenger?.id === user?.id
    supabase
      .from('duels')
      .update(
        isChallenger
          ? { challenger_wpm: pending.wpm, challenger_accuracy: pending.accuracy }
          : { opponent_wpm: pending.wpm, opponent_accuracy: pending.accuracy }
      )
      .eq('id', currentDuel.id)
    pendingUpdateRef.current = null
  }, [currentDuel?.id, currentDuel?.challenger?.id, user?.id])

  // Обработка ввода с обновлением прогресса (throttled)
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputBase(e)
    pendingUpdateRef.current = { wpm, accuracy }
    const now = Date.now()
    if (now - lastUpdateRef.current >= 500) {
      lastUpdateRef.current = now
      flushDuelProgress()
    }
  }, [handleInputBase, wpm, accuracy, flushDuelProgress])

  // Flush pending updates when duel ends
  useEffect(() => {
    if (duelState === 'completed') {
      flushDuelProgress()
    }
  }, [duelState, flushDuelProgress])

  // Горячие клавиши
  useHotkey('escape', () => {
    if (countdown === null && duelState !== 'active') {
      onExit()
    }
  }, { enabled: true })

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
            ⚔️ Дуэль
          </h2>
          <p className="text-sm text-dark-400">
            {duelState === 'lobby' && 'Сразись с другим игроком'}
            {duelState === 'searching' && 'Поиск соперника...'}
            {duelState === 'waiting' && 'Ожидание соперника...'}
            {duelState === 'active' && 'Бой начался!'}
            {duelState === 'completed' && 'Дуэль завершена'}
          </p>
        </div>

        <button
          onClick={onExit}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          title="Выйти"
          aria-label="Выйти"
          disabled={duelState === 'active'}
        >
          <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Лобби */}
      {duelState === 'lobby' && (
        <div className="space-y-6">
          {/* Выбор длительности */}
          <div>
            <span id="duration-label" className="block text-sm text-dark-400 mb-2">Длительность</span>
            <div className="flex gap-2" role="group" aria-labelledby="duration-label">
              {([30, 60, 120] as DuelDuration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    duration === d
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                  }`}
                >
                  {DURATION_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Ставка */}
          <div>
            <label htmlFor="bet-amount" className="block text-sm text-dark-400 mb-2">Ставка (XP)</label>
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
            >
              🎯 Быстрый матч
            </button>
            <button
              className="w-full py-4 bg-dark-800 hover:bg-dark-700 rounded-xl font-medium transition-all"
              disabled
            >
              🔍 Найти друга (скоро)
            </button>
          </div>

          {/* История дуэлей */}
          {userDuels && userDuels.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-dark-300 mb-3">Последние дуэли</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userDuels.slice(0, 5).map((duel: DuelsData) => {
                  const isChallenger = duel.challenger_id === user?.id
                  const isWinner = duel.winner_id === user?.id
                  return (
                    <div key={duel.id} className="p-3 bg-dark-800 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {isChallenger ? 'Вы' : 'Вызов'} vs{' '}
                          {isChallenger
                            ? duel.opponent?.name || '???'
                            : duel.challenger?.name || '???'}
                        </p>
                        <p className="text-xs text-dark-500">
                          {duel.status === 'completed'
                            ? isWinner
                              ? '🏆 Победа'
                              : '❌ Поражение'
                            : duel.status === 'active'
                            ? '🔴 В процессе'
                            : '⏳ Ожидание'}
                        </p>
                      </div>
                      <span className="text-xs text-dark-500">
                        {duel.duration && DURATION_LABELS[duel.duration as DuelDuration]}
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
          <p className="text-sm text-dark-500 mt-2">Можно отменить Escape</p>
        </div>
      )}

      {/* Активная дуэль */}
      {duelState === 'active' && (
        <div className="space-y-6">
          {/* Прогресс соперников */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">Вы</p>
              <p className="text-2xl font-bold text-primary-400">{wpm} WPM</p>
              <div className="mt-2 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 transition-all" style={{ width: `${timeProgress}%` }} />
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">Соперник</p>
              <p className="text-2xl font-bold text-purple-400">{opponentWpm} WPM</p>
              <div className="mt-2 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 transition-all" style={{ width: `${opponentWpm / 2}%` }} />
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
              <p className="text-sm text-dark-400">WPM</p>
              <p className="text-2xl font-bold text-primary-400">{wpm}</p>
            </div>
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">Точность</p>
              <p className="text-2xl font-bold text-success">{accuracy}%</p>
            </div>
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <p className="text-sm text-dark-400">Символы</p>
              <p className="text-2xl font-bold text-dark-300">{currentIndex}</p>
            </div>
          </div>

          {/* Область ввода */}
          <div className="bg-dark-800/50 rounded-xl p-6 min-h-[100px] relative">
            <input
              ref={inputRef}
              type="text"
              className="sr-only"
              onInput={handleInput}
              disabled={!isActive}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <div className="font-mono text-sm leading-relaxed break-words">
              {text.split('').map((char, index) => {
                let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
                if (index < currentIndex) {
                  status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
                } else if (index === currentIndex && isActive) {
                  status = 'current'
                }
                return (
                  <span
                    key={index}
                    className={`inline-block min-w-[0.6em] rounded ${
                      status === 'correct'
                        ? 'text-green-400'
                        : status === 'incorrect'
                        ? 'text-red-400'
                        : status === 'current'
                        ? 'text-violet-400 border-b-2 border-violet-500'
                        : 'text-dark-500'
                    }`}
                  >
                    {char}
                  </span>
                )
              })}
            </div>
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
          <h3 className="text-2xl font-bold text-gradient mb-4">Дуэль завершена!</h3>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-dark-800 rounded-lg p-4">
              <p className="text-sm text-dark-400">Ваш WPM</p>
              <p className="text-2xl font-bold text-primary-400">{wpm}</p>
            </div>
            <div className="bg-dark-800 rounded-lg p-4">
              <p className="text-sm text-dark-400">WPM соперника</p>
              <p className="text-2xl font-bold text-purple-400">{opponentWpm}</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-medium transition-all"
          >
            Продолжить
          </button>
        </div>
      )}
    </div>
  )
}
