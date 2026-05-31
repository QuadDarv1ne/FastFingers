/**
 * SpeedTest — Тест скорости на время
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TypingStats } from '../types'
import { useTypingSound } from '../hooks/useTypingSound'
import { useToast } from '../contexts/ToastContext'
import { useTypingGame } from '@hooks/useTypingGame'
import { TypingTextDisplay } from './ui/TypingTextDisplay'

type TestDuration = 15 | 30 | 60

interface SpeedTestProps {
  duration: TestDuration
  onExit: () => void
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
}

export function SpeedTest({ duration, onExit, onComplete, sound }: SpeedTestProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()

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
    duration,
    onComplete: (stats) => {
      showToast(`Тест завершён: ${stats.wpm} WPM, ${stats.accuracy}% точность`, 'success', 5000)
      onComplete(stats)
    },
    sound,
  })

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length > 1 && e.key !== 'Enter') return
    handleInput(e as unknown as React.FormEvent<HTMLInputElement>)
    e.preventDefault()
  }, [handleInput])

  // Старт при первом нажатии
  const handleStart = useCallback(() => {
    startGame()
  }, [startGame])

  // Пропуск текста
  const handleSkipWrapper = useCallback(() => {
    handleSkip()
    inputRef.current?.focus({ preventScroll: true })
  }, [handleSkip, inputRef])

  // Прогресс времени
  const timeProgress = ((duration - timeLeft) / duration) * 100

  // Определение цвета таймера
  const timerColor = timeLeft <= 5 ? 'text-error' : timeLeft <= 10 ? 'text-yellow-400' : 'text-primary-400'

  return (
    <div className="glass rounded-xl p-6 relative overflow-hidden">
      {/* Фон с прогрессом */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000"
        style={{ width: `${timeProgress}%` }}
      />

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Тест скорости</h2>
          <p className="text-sm text-dark-400">{duration} секунд на максимум</p>
        </div>

        <button
          onClick={onExit}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          title="Выйти"
          aria-label="Выйти из теста скорости"
        >
          <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Таймер */}
      <div className="text-center mb-6">
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-6xl font-bold font-mono ${timerColor} ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
        >
          {timeLeft}s
        </motion.div>
      </div>

      {/* Статистика в реальном времени */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">WPM</p>
          <p className="text-3xl font-bold text-primary-400">{wpm}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">Точность</p>
          <p className={`text-3xl font-bold ${accuracy >= 95 ? 'text-success' : accuracy >= 85 ? 'text-yellow-400' : 'text-error'}`}>
            {accuracy}%
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">Символы</p>
          <p className="text-3xl font-bold text-dark-300">{currentIndex}</p>
        </div>
      </div>

      {/* Область ввода */}
      <div
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.focus({ preventScroll: true })
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t('speedtest.input_area')}
        className="bg-dark-800/50 rounded-xl p-6 cursor-text min-h-[120px] relative mb-4"
      >
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute"
          onKeyDown={handleKeyDown}
          readOnly
          disabled={!isActive}
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <p className="text-lg text-dark-300 mb-4">Начните печатать для старта</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
              >
                Начать тест
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
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19-7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Тест завершён</h3>
              <div className="grid grid-cols-2 gap-4 mb-6 max-w-xs mx-auto">
                <div className="bg-dark-800 rounded-lg p-3">
                  <p className="text-sm text-dark-400">WPM</p>
                  <p className="text-2xl font-bold text-primary-400">{wpm}</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-3">
                  <p className="text-sm text-dark-400">Точность</p>
                  <p className="text-2xl font-bold text-success">{accuracy}%</p>
                </div>
              </div>
              <button
                onClick={onExit}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
              >
                Продолжить
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
          >
            Пропустить текст
          </button>
        </div>
      )}
    </div>
  )
}
