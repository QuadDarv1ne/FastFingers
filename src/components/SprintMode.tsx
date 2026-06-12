import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingStats } from '../types'
import { User } from '../types/auth'
import { useTypingSound } from '../hooks/useTypingSound'
import { useHotkey } from '../hooks/useHotkeys'
import { useAuth } from '@hooks/useAuth'
import { useTypingGame } from '@hooks/useTypingGame'
import { simulateInput } from '../utils/inputEvent'
import { useToast } from '@contexts/ToastContext'
import { CertificateGenerator } from './CertificateGenerator'
import { useAppTranslation } from '../i18n/config'
import { useCountdown } from '@hooks/useCountdown'
import { TypingTextDisplay } from './ui/TypingTextDisplay'

interface SprintModeProps {
  duration: number
  onExit: () => void
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
}

const COUNTDOWN_SECONDS = 3

export const SprintMode = memo(function SprintMode({ duration, onExit, onComplete, sound }: SprintModeProps) {
  const { t } = useAppTranslation()
  const { showToast } = useToast()
  const { user } = useAuth()
  const [showCertificate, setShowCertificate] = useState(false)
  const [lastStats, setLastStats] = useState<TypingStats | null>(null)

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
    initialWordCount: 50,
    initialDifficulty: 5,
    mode: 'timed',
    duration,
    onComplete: (stats) => {
      setLastStats(stats)
      showToast(`${t('mode.sprint')}: ${stats.wpm} ${t('common.wpm')}, ${stats.accuracy}% ${t('common.accuracy')}`, 'success', 4000)
      onComplete(stats)
      setShowCertificate(true)
    },
    sound,
  })

  const { countdown, start: startCountdown } = useCountdown({
    onComplete: startGame,
  })

  // Старт спринта с обратным отсчётом
  const handleStart = useCallback(() => {
    startCountdown(COUNTDOWN_SECONDS)
  }, [startCountdown])

  // Горячие клавиши
  useHotkey('escape', () => {
    if (countdown === null) {
      onExit()
    }
  }, { enabled: true, ignoreInputFocus: true })

  useHotkey('r', () => {
    if (countdown === null && !isActive) {
      handleStart()
    }
  }, { enabled: true })

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
    handleInput(simulateInput(input))
  }, [handleInput])

  // Прогресс времени
  const timeProgress = ((duration - timeLeft) / duration) * 100

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
            role="dialog"
            aria-modal="true"
            aria-label={t('sprint.countdown', 'Countdown')}
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

      {/* Фон с прогрессом */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000"
        style={{ width: `${timeProgress}%` }}
      />
      
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient">{t('mode.sprint')}</h2>
          <p className="text-sm text-dark-400">{t('common.speed')} — {duration} {t('common.time').toLowerCase()}</p>
        </div>

        <div className="flex items-center gap-2">
          {!isActive && countdown === null && (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-semibold transition-all"
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

      {/* Таймер */}
      <div className="text-center mb-6">
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-4xl sm:text-5xl md:text-6xl font-bold font-mono ${
            timeLeft <= 10 ? 'text-error animate-pulse' : 
            timeLeft <= 20 ? 'text-yellow-400' : 'text-primary-400'
          }`}
        >
          {timeLeft}s
        </motion.div>
      </div>

      {/* Статистика в реальном времени */}
      <div className="grid grid-cols-3 gap-4 mb-6" role="region" aria-label={t('stats.title')}>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">{t('common.wpm')}</p>
          <p className="text-3xl font-bold text-primary-400" aria-live="polite">{wpm}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">{t('common.accuracy')}</p>
          <p className={`text-3xl font-bold ${accuracy >= 95 ? 'text-success' : accuracy >= 80 ? 'text-yellow-400' : 'text-error'}`} aria-live="polite">
            {accuracy}%
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">{t('common.chars')}</p>
          <p className="text-3xl font-bold text-dark-300" aria-live="polite">{currentIndex}</p>
        </div>
      </div>

      {/* Область ввода */}
      <div className="bg-dark-800/50 rounded-xl p-6 min-h-[120px] relative mb-4">
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
        {!isActive && timeLeft === duration && (
          <div className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-lg text-dark-300 mb-4">{t('action.start')}</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                aria-label={t('action.start')}
              >
                {t('action.start')}
              </button>
            </div>
          </div>
        )}

        {/* Оверлей завершения */}
        {!isActive && timeLeft === 0 && (
          <div
            className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={t('status.completed')}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">{t('status.completed')}</h3>
              <p className="text-dark-400 mb-4">{t('common.wpm')}: <span className="text-primary-400 font-bold">{wpm}</span></p>
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

      {/* Сертификат */}
      {showCertificate && lastStats && user && (
        <CertificateGenerator
          user={user as User}
          wpm={lastStats.wpm}
          accuracy={lastStats.accuracy}
          cpm={lastStats.cpm}
          testType="sprint"
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  )
})
