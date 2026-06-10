/**
 * MarathonMode — Режим марафона для тренировки выносливости
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingStats } from '../types'
import { useTypingSound } from '../hooks/useTypingSound'
import { useHotkey } from '../hooks/useHotkeys'
import { useTypingGame } from '@hooks/useTypingGame'
import { useToast } from '@contexts/ToastContext'
import { useAppTranslation } from '../i18n/config'
import { useCountdown } from '@hooks/useCountdown'
import { TypingTextDisplay } from './ui/TypingTextDisplay'

interface MarathonModeProps {
  onExit: () => void
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
}

const MARATHON_DURATION = 300 // 5 минут
const COUNTDOWN_SECONDS = 3
const MILESTONE_INTERVALS = [60, 120, 180, 240, 300] // Секунды для отметок

const MILESTONE_MESSAGES = {
  60: '🎯 Первая минута! Продолжай!',
  120: '🔥 2 минуты! Ты в форме!',
  180: '⚡ Половина пути! Держи темп!',
  240: '💪 Ещё минута! Финиш близок!',
  300: '🏆 ФИНИШ! Ты невероятен!',
}

export function MarathonMode({ onExit, onComplete, sound }: MarathonModeProps) {
  const { t } = useAppTranslation()
  const { showToast } = useToast()
  const [currentMilestone, setCurrentMilestone] = useState(0)
  const [showMilestone, setShowMilestone] = useState<string | null>(null)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const milestoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    text,
    currentIndex,
    inputResults,
    isActive,
    wpm,
    accuracy,
    timeLeft,
    inputRef,
    handleInput,
    handleSkip,
    handleStart: startGame,
  } = useTypingGame({
    initialWordCount: 100,
    initialDifficulty: 5,
    mode: 'timed',
    duration: MARATHON_DURATION,
    onComplete: (stats) => {
      showToast(`Марафон: ${stats.wpm} WPM, ${stats.accuracy}% точность`, 'success', 5000)
      onComplete(stats)
    },
    sound,
  })

  const { countdown, start: startCountdown } = useCountdown({
    onComplete: startGame,
  })

  // Старт марафона с обратным отсчётом
  const handleStart = useCallback(() => {
    startCountdown(COUNTDOWN_SECONDS)
  }, [startCountdown])

  // Горячие клавиши
  useHotkey('escape', () => {
    if (countdown === null) {
      onExit()
    }
  }, { enabled: true })

  useHotkey('r', () => {
    if (countdown === null && !isActive) {
      handleStart()
    }
  }, { enabled: true })

  // Отслеживание майлстоунов — detect milestones on time changes
  const shownMilestonesRef = useRef<Set<number>>(new Set())
  useEffect(() => {
    if (!isActive) return

    const elapsed = MARATHON_DURATION - timeLeft
    const currentInterval = MILESTONE_INTERVALS.find(interval => interval <= elapsed && !shownMilestonesRef.current.has(interval))

    if (currentInterval !== undefined) {
      shownMilestonesRef.current.add(currentInterval)
      const message = MILESTONE_MESSAGES[currentInterval as keyof typeof MILESTONE_MESSAGES]
      setShowMilestone(message)
      if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current)
      milestoneTimerRef.current = setTimeout(() => setShowMilestone(null), 3000)
      setCurrentMilestone(MILESTONE_INTERVALS.indexOf(currentInterval) + 1)
    }

    return () => {
      if (milestoneTimerRef.current) {
        clearTimeout(milestoneTimerRef.current)
        milestoneTimerRef.current = null
      }
    }
  }, [timeLeft, isActive])

  useEffect(() => {
    return () => {
      if (milestoneTimerRef.current) {
        clearTimeout(milestoneTimerRef.current)
        milestoneTimerRef.current = null
      }
    }
  }, [])

  // Подсчёт комбо
  useEffect(() => {
    if (inputResults.length > 0) {
      const lastResult = inputResults[inputResults.length - 1]
      if (lastResult && lastResult.isCorrect) {
        setCombo(prev => prev + 1)
      } else {
        setCombo(0)
      }
    }
  }, [inputResults])

  // Track max combo separately — no side effects in updaters
  useEffect(() => {
    setMaxCombo(prev => Math.max(prev, combo))
  }, [combo])

  // Пропуск
  const handleSkipWrapper = useCallback(() => {
    handleSkip()
    inputRef.current?.focus({ preventScroll: true })
  }, [handleSkip, inputRef])

  // Handle key down instead of input to avoid controlled input loop
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length > 1 && e.key !== 'Enter') return
    e.preventDefault()
    const input = e.currentTarget
    input.value = e.key === 'Enter' ? '\n' : e.key
    handleInput({ currentTarget: input } as React.FormEvent<HTMLInputElement>)
  }, [handleInput])

  // Прогресс времени
  const timeProgress = ((MARATHON_DURATION - timeLeft) / MARATHON_DURATION) * 100
  
  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Прогресс по майлстоунам
  const milestoneProgress = (currentMilestone / MILESTONE_INTERVALS.length) * 100

  return (
    <div className="glass rounded-xl p-8 relative overflow-hidden gradient-border">
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

      {/* Уведомление о майлстоуне */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 glass p-4 rounded-xl gradient-card animate-glow-pulse"
          >
            <p className="text-xl font-bold text-gradient text-shimmer">{showMilestone}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Фон с прогрессом */}
      <div className="absolute bottom-0 left-0 h-1 bg-dark-800 w-full">
        <div
          className="h-full bg-gradient-to-r from-primary-600 via-purple-500 to-primary-400 transition-all duration-1000 progress-wave relative"
          style={{ width: `${timeProgress}%` }}
        />
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
            🏃 Марафон
            <span className="text-sm font-normal text-dark-400">— тренировка выносливости</span>
          </h2>
          <p className="text-sm text-dark-400">5 минут непрерывной печати</p>
        </div>

        <div className="flex items-center gap-2">
          {!isActive && countdown === null && (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-semibold transition-all animate-glow-pulse"
              aria-label={t('action.start')}
            >
              {t('action.start')} (R)
            </button>
          )}
          <button
            onClick={onExit}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            title={`${t('action.exit')} (Escape)`}
            aria-label={t('action.exit')}
          >
            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Таймер и прогресс */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl p-4 text-center relative overflow-hidden">
          <p className="text-sm text-dark-400 mb-2">Осталось времени</p>
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-5xl font-bold font-mono ${
              timeLeft <= 30 ? 'text-error animate-pulse' :
              timeLeft <= 60 ? 'text-yellow-400' : 'text-primary-400'
            }`}
          >
            {formatTime(timeLeft)}
          </motion.div>
        </div>
        
        <div className="bg-dark-800 rounded-xl p-4 text-center">
          <p className="text-sm text-dark-400 mb-2">Прогресс марафона</p>
          <div className="relative h-3 bg-dark-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-primary-500 transition-all duration-500"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
          <p className="text-xs text-dark-400">
            {currentMilestone} / {MILESTONE_INTERVALS.length} этапов
          </p>
        </div>
      </div>

      {/* Комбо-счётчик */}
      {combo > 1 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full animate-combo-scale">
            <span className="text-2xl">🔥</span>
            <span className="text-lg font-bold text-gradient">
              Комбо: {combo}
            </span>
            {combo >= 10 && <span className="text-xs text-yellow-400">Максимум: {maxCombo}</span>}
          </div>
        </motion.div>
      )}

      {/* Статистика в реальном времени */}
      <div className="grid grid-cols-4 gap-3 mb-6" role="region" aria-label={t('stats.title')}>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">{t('common.wpm')}</p>
          <p className="text-2xl font-bold text-primary-400" aria-live="polite">{wpm}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">{t('common.accuracy')}</p>
          <p className={`text-2xl font-bold ${accuracy >= 95 ? 'text-success' : accuracy >= 80 ? 'text-yellow-400' : 'text-error'}`} aria-live="polite">
            {accuracy}%
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">{t('common.chars')}</p>
          <p className="text-2xl font-bold text-dark-300" aria-live="polite">{currentIndex}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">Этап</p>
          <p className="text-2xl font-bold text-purple-400" aria-live="polite">{currentMilestone + 1}</p>
        </div>
      </div>

      {/* Область ввода */}
      <div className="bg-dark-800/50 rounded-xl p-6 min-h-[120px] relative mb-4 gradient-card">
        <input
          ref={inputRef}
          type="text"
          className="sr-only"
          aria-hidden="true"
          onKeyDown={handleKeyDown}
          disabled={!isActive || countdown !== null}
          aria-label={t('exercise.custom')}
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
          enhanced
        />

        {/* Оверлей старта */}
        {!isActive && timeLeft === MARATHON_DURATION && (
          <div className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-rotate-glow"
              >
                <span className="text-4xl">🏃</span>
              </motion.div>
              <h3 className="text-2xl font-bold mb-2 text-gradient">Готов к марафону?</h3>
              <p className="text-dark-400 mb-4">5 минут непрерывной печати</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors animate-glow-pulse"
                aria-label={t('action.start')}
              >
                {t('action.start')}
              </button>
            </div>
          </div>
        )}

        {/* Оверлей завершения */}
        {!isActive && timeLeft === 0 && (
          <div className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-gradient-to-br from-success/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-5xl">🏆</span>
              </motion.div>
              <h3 className="text-3xl font-bold mb-2 text-gradient">Марафон завершён!</h3>
              <p className="text-dark-400 mb-2">
                {t('common.wpm')}: <span className="text-primary-400 font-bold">{wpm}</span>
              </p>
              <p className="text-dark-400 mb-4">
                {t('common.accuracy')}: <span className="text-success font-bold">{accuracy}%</span>
              </p>
              {maxCombo > 5 && (
                <p className="text-yellow-400 mb-4">
                  🔥 Лучшее комбо: <span className="font-bold">{maxCombo}</span>
                </p>
              )}
              <button
                onClick={onExit}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                aria-label={t('action.continue')}
              >
                {t('action.continue')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Кнопка пропуска */}
      {isActive && (
        <div className="flex justify-center">
          <button
            onClick={handleSkipWrapper}
            className="px-4 py-2 text-dark-400 hover:text-white transition-colors text-sm"
            aria-label={t('action.skip')}
          >
            {t('action.skip')}
          </button>
        </div>
      )}

      {/* Подсказки */}
      <div className="mt-4 text-center text-xs text-dark-500">
        <p>💡 Совет: держи ровный темп, не спеши. Точность важнее скорости!</p>
      </div>
    </div>
  )
}
