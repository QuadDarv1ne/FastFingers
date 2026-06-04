/**
 * TypingTrainer — Основной компонент тренажёра печати
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyboardLayout, TypingStats, KeyInputResult, Exercise } from '../types'
import { getRandomExercise, generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from '../hooks/useTypingSound'
import { useHotkey } from '../hooks/useHotkeys'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { TypingChar } from './TypingChar'
import { useAppTranslation } from '../i18n/config'
import { createScopedLogger } from '../utils/logger'
import {
  useAdaptiveDifficulty,
} from '../hooks/useAdaptiveDifficulty'

const logger = createScopedLogger('TypingTrainer')

interface TypingTrainerProps {
  layout: KeyboardLayout
  onSessionComplete: (stats: TypingStats) => void
  onKeyInput?: (key: string, isCorrect: boolean) => void
  sound?: ReturnType<typeof useTypingSound>
  customExercises?: Exercise[]
  isChallenge?: boolean
  challengeText?: string
}

const CATEGORY_OPTIONS = [
  { value: 'all', labelKey: 'trainer.randomWords', icon: '🎲' },
  { value: 'basic', labelKey: 'trainer.basicRow', icon: '⌨️' },
  { value: 'upper', labelKey: 'trainer.upperRow', icon: '⬆️' },
  { value: 'lower', labelKey: 'trainer.lowerRow', icon: '⬇️' },
  { value: 'words', labelKey: 'exercise.words', icon: '📝' },
  { value: 'sentences', labelKey: 'exercise.sentences', icon: '📄' },
  { value: 'code', labelKey: 'exercise.code', icon: '💻' },
] as const

const DIFFICULTY_OPTIONS = [
  { value: 1, labelKey: 'trainer.difficulty.veryEasy', stars: 1 },
  { value: 3, labelKey: 'trainer.difficulty.easy', stars: 2 },
  { value: 5, labelKey: 'trainer.difficulty.medium', stars: 3 },
  { value: 7, labelKey: 'trainer.difficulty.hard', stars: 4 },
  { value: 9, labelKey: 'trainer.difficulty.veryHard', stars: 5 },
] as const

// Отдельный компонент для каждого символа — мемоизирован, перерисовывается только при изменении своего статуса
const CharDisplay = memo<{
  char: string
  status: 'correct' | 'incorrect' | 'current' | 'pending'
}>(({ char, status }) => {
  return <TypingChar char={char} status={status} />
}, (prev, next) => prev.status === next.status && prev.char === next.char)

CharDisplay.displayName = 'CharDisplay'

export const TypingTrainer = memo<TypingTrainerProps>(function TypingTrainer({
  onSessionComplete,
  onKeyInput,
  sound,
  customExercises = [],
  isChallenge = false,
  challengeText
}: TypingTrainerProps) {
  const { t } = useAppTranslation()
  const adaptive = useAdaptiveDifficulty(true)
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<KeyInputResult[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(5)

  const inputRef = useRef<HTMLInputElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const textLengthRef = useRef(0)
  const completionRef = useRef<HTMLDivElement>(null)
  const correctCountRef = useRef(0)
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultsRef = useRef<KeyInputResult[]>([])
  const isCompletingRef = useRef(false)
  const isHandlingInputRef = useRef(false)

  useFocusTrap(completionRef, isComplete)

  // Завершение упражнения — оптимизировано
  const handleComplete = useCallback((results: KeyInputResult[]) => {
    if (!startTime || isCompletingRef.current) return
    isCompletingRef.current = true

    let correctChars = 0
    let errors = 0
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (!result) continue // Skip null/undefined results
      if (result.isCorrect) {
        correctChars++
      } else {
        errors++
      }
    }
    const timeElapsed = (Date.now() - startTime) / 1000

    const stats = calculateStats(correctChars, results.length, errors, timeElapsed)

    setIsComplete(true)
    adaptive.onSessionComplete(stats)
    onSessionComplete(stats)
  }, [startTime, onSessionComplete, adaptive])

  // Инициализация упражнения — оптимизировано
  const initExercise = useCallback(() => {
    try {
      let exerciseText: string

      if (isChallenge && challengeText) {
        exerciseText = challengeText
      } else if (selectedCategory === 'custom' && customExercises.length > 0) {
        const randomIndex = Math.floor(Math.random() * customExercises.length)
        const exercise = customExercises[randomIndex]
        exerciseText = exercise ? exercise.text : ''
      } else if (selectedCategory !== 'all') {
        const exercise = getRandomExercise(selectedCategory, selectedDifficulty)
        exerciseText = exercise ? exercise.text : ''
      } else {
        // Используем адаптивную сложность для выбора текста
        if (adaptive.isEnabled) {
          const adaptiveText = adaptive.getNextText()
          exerciseText = adaptiveText ? adaptiveText.text : ''
        } else {
          exerciseText = generatePracticeText(20, selectedDifficulty)
        }
      }

      if (!exerciseText || exerciseText.trim().length === 0) {
        logger.warn('Empty exercise text, using fallback')
        exerciseText = t('trainer.fallbackText')
      }

      setText(exerciseText)
      setCurrentIndex(0)
      setInputResults([])
      resultsRef.current = []
      setStartTime(null)
      setIsComplete(false)
      correctCountRef.current = 0
      textLengthRef.current = exerciseText.length
    } catch (error) {
      logger.error('Error initializing exercise:', error)
      setText(t('trainer.errorText'))
      setCurrentIndex(0)
      setInputResults([])
      resultsRef.current = []
      setStartTime(null)
      setIsComplete(false)
      textLengthRef.current = 0
    }
  }, [selectedCategory, selectedDifficulty, customExercises, isChallenge, challengeText, adaptive, t])

  useEffect(() => {
    initExercise()
  }, [initExercise])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    }
  }, [])

  // Обработка ввода — используем keydown для захвата реальных нажатий
  // Это предотвращает бесконечный цикл и race condition с React batching
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isHandlingInputRef.current || isComplete) return

    // Игнорируем модификаторы и служебные клавиши
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Tab' || e.key === 'Escape') return
    // Игнорируем key repeat (когда клавишу держат)
    if (e.repeat) return

    isHandlingInputRef.current = true

    try {
      if (!startTime) {
        setStartTime(Date.now())
      }

      const expectedChar = text[currentIndex]
      if (!expectedChar) return

      // Для пробела e.key === ' ', для Enter — '\n' (считаем пробелом)
      const inputChar = e.key === 'Enter' ? ' ' : e.key

      const isCorrect = inputChar === expectedChar

      if (isCorrect) correctCountRef.current++

      if (sound) {
        isCorrect ? sound.playCorrect(expectedChar.toLowerCase()) : sound.playError()
      }

      onKeyInput?.(expectedChar.toLowerCase(), isCorrect)

      const result: KeyInputResult = {
        isCorrect,
        char: inputChar,
        expectedChar,
        timestamp: Date.now(),
      }

      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setInputResults(prev => {
        const newResults = [...prev, result]
        resultsRef.current = newResults
        return newResults
      })

      // Предотвращаем стандартное действие (ввод символа в input)
      e.preventDefault()

      if (nextIndex >= textLengthRef.current) {
        handleComplete(resultsRef.current)
      }
    } finally {
      // Небольшая задержка для предотвращения key repeat
      setTimeout(() => { isHandlingInputRef.current = false }, 10)
    }
  }, [text, currentIndex, startTime, isComplete, sound, onKeyInput, handleComplete])

  // Пропуск упражнения
  const handleSkip = useCallback(() => {
    initExercise()
  }, [initExercise])

  // Горячие клавиши
  useHotkey('escape', () => {
    if (!isChallenge) {
      handleSkip()
    }
  }, { enabled: !isChallenge, ignoreInputFocus: true })

  useHotkey('enter', () => {
    inputRef.current?.focus({ preventScroll: true })
  }, { enabled: true })

  // Размер шрифта (мемоизация)
  const fontSizeStyle = useMemo(() => ({ fontSize: 'var(--font-size-practice)' }), [])

  // Текущая клавиша для подсветки
  const currentKey = text[currentIndex]?.toLowerCase() || ''

  // Опции категории с мемоизацией
  const categoryOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = CATEGORY_OPTIONS.map(opt => ({
      value: opt.value,
      label: `${opt.icon} ${t(opt.labelKey)}`,
    }))
    if (customExercises.length > 0) {
      options.push({ value: 'custom', label: `✏️ ${t('trainer.myExercises')} (${customExercises.length})` })
    }
    return options
  }, [customExercises.length, t])

  // Опции сложности с мемоизацией
  const difficultyOptions = useMemo(() =>
    DIFFICULTY_OPTIONS.map(opt => ({
      value: opt.value,
      label: `${'⭐'.repeat(opt.stars)} ${t(opt.labelKey)}`,
    })),
    [t],
  )

  // Рендеринг символов — без useMemo, CharDisplay сам мемоизирует изменения
  // Это предотвращает пересоздание массива при каждом нажатии
  const renderedChars = text.split('').map((char, i) => {
    if (!char) return null
    let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
    if (i < currentIndex) {
      const result = inputResults[i]
      status = result?.isCorrect ? 'correct' : 'incorrect'
    } else if (i === currentIndex && !isComplete) {
      status = 'current'
    }
    return (
      <CharDisplay
        key={i}
        char={char}
        status={status}
      />
    )
  })

  // Статистика для live region (O(1) via ref counter)
  const liveRegionText = useMemo(() => {
    const label = t('trainer.liveRegion')
    return `${currentIndex} / ${text.length} ${label} ${correctCountRef.current} / ${inputResults.length}`
  }, [currentIndex, text.length, inputResults.length, t])

  return (
    <div className="space-y-4 sm:space-y-6" role="region" aria-label={t('trainer.aria.practiceArea')}>
      {/* Выбор режима — mobile-first stacked layout */}
      <div className="card" role="group" aria-label={t('trainer.aria.settings')}>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-end">
          <div className="flex-1 min-w-[200px] w-full sm:w-auto">
            <label htmlFor="category-select" className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <span>📁</span>
              {t('exercise.custom').split(' ')[0]}
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 sm:py-2.5 text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-dark-600 min-h-touch touch-manipulation"
              disabled={isChallenge}
              aria-disabled={isChallenge}
              aria-label={t('trainer.aria.category')}
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[180px] w-full sm:w-auto mt-3 sm:mt-0">
            <label htmlFor="difficulty-select" className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <span>🎯</span>
              {t('common.level')}
            </label>
            <select
              id="difficulty-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 sm:py-2.5 text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-dark-600 min-h-touch touch-manipulation"
              aria-label={t('trainer.aria.difficulty')}
            >
              {difficultyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Адаптивная сложность */}
          <div className="flex-1 min-w-[180px] w-full sm:w-auto mt-3 sm:mt-0">
            <label htmlFor="adaptive-toggle" className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <span>📈</span>
              {t('trainer.adaptation')}
            </label>
            <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 sm:py-2.5">
              <span className="text-xl" title={adaptive.levelDescription}>{adaptive.levelBadge}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-dark-400 truncate">{t('common.level')} {adaptive.level}</div>
                <div className="text-xs font-medium truncate">{adaptive.levelDescription}</div>
              </div>
              <button
                id="adaptive-toggle"
                onClick={adaptive.toggleEnabled}
                className={`w-10 h-5 rounded-full transition-colors ${adaptive.isEnabled ? 'bg-primary-600' : 'bg-dark-700'}`}
                aria-label={adaptive.isEnabled ? t('trainer.aria.adaptiveToggle') : t('trainer.aria.adaptiveToggle')}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${adaptive.isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={initExercise}
            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center justify-center gap-2 min-h-touch touch-manipulation active:scale-95 mt-3 sm:mt-0"
            title={t('action.restart')}
            aria-label={t('action.restart')}
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{t('action.restart')}</span>
            <span className="sm:hidden">{t('trainer.newBtn')}</span>
          </button>
        </div>
      </div>

      {/* Область текста — mobile optimized */}
      <div
        ref={textContainerRef}
        className="card cursor-text min-h-[250px] sm:min-h-[280px] relative group hover:border-primary-500/30 transition-all"
      >
        {/* Подсказка о фокусе — скрыта на мобильных для экономии места */}
        {!isComplete && (
          <div className="absolute top-4 right-4 text-xs text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            {t('trainer.clickOrEnter')}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value=""
          className="sr-only"
          onKeyDown={handleKeyDown}
          readOnly
          onFocus={() => {
            if (isComplete) return
            if (blurTimerRef.current) {
              clearTimeout(blurTimerRef.current)
              blurTimerRef.current = null
            }
          }}
          onBlur={() => {
            if (isComplete) return
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
            blurTimerRef.current = setTimeout(() => {
              inputRef.current?.focus({ preventScroll: true })
              blurTimerRef.current = null
            }, 100)
          }}
          disabled={isComplete}
          aria-label={t('trainer.aria.inputField')}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Live region для screen reader */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveRegionText}
        </div>

        <div className="font-mono leading-relaxed sm:leading-loose break-words select-none max-w-full overflow-wrap-anywhere text-lg sm:text-xl" style={fontSizeStyle} aria-live="polite">
          {renderedChars}
        </div>
        
        {/* Индикатор прогресса */}
        <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-0" role="progressbar" aria-valuenow={currentIndex} aria-valuemin={0} aria-valuemax={text.length} aria-valuetext={`${text.length > 0 ? Math.round((currentIndex / text.length) * 100) : 0}%`} aria-label={t('trainer.aria.progress')}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <span className="text-dark-400 font-medium">{t('trainer.progressLabel')}</span>
            <span className="text-primary-400 font-bold">{text.length > 0 ? Math.round((currentIndex / text.length) * 100) : 0}%</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 w-full h-3 sm:h-3 bg-dark-800 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 shadow-glow"
                style={{ width: text.length > 0 ? `${(currentIndex / text.length) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-sm text-dark-400 font-medium whitespace-nowrap min-w-[80px] text-center sm:text-right">
              {currentIndex} / {text.length}
            </span>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mt-6 pt-6 border-t border-dark-700/50" role="group" aria-label={t('trainer.aria.controls')}>
          <button
            onClick={handleSkip}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 min-h-touch"
            title={t('trainer.aria.skip')}
            aria-label={t('trainer.aria.skip')}
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span className="sm:hidden">{t('action.skip')}</span>
            <span className="hidden sm:inline">{t('action.skip')}</span>
          </button>

          {!isComplete && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={initExercise}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center justify-center gap-2 min-h-touch"
              aria-label={t('trainer.aria.nextExercise')}
            >
              {t('action.continue')}
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Экран завершения */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              ref={completionRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark-900/95 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="completion-title"
            >
              <div className="text-center px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1, duration: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-success"
                >
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <motion.h3
                  id="completion-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-3 text-gradient-success"
                >
                  ✅ {t('status.completed')}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-dark-300 mb-8 text-lg"
                >
                  {t('trainer.exerciseComplete')}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={initExercise}
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center gap-2 mx-auto"
                  aria-label={t('trainer.nextExercise')}
                >
                  {t('trainer.nextExercise')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Подсказка по текущей клавише */}
      {currentKey && !isComplete && (
        <div className="card text-center" aria-live="polite" aria-atomic="true">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-dark-400 font-medium">{t('trainer.nextKey')}:</span>
            <div className="px-4 py-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
              <span className="text-primary-400 font-mono text-2xl font-bold">{currentKey}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  const exercisesEqual =
    (prevProps.customExercises?.length ?? 0) === (nextProps.customExercises?.length ?? 0) &&
    (prevProps.customExercises ?? []).every((ex, i) => {
      const next = nextProps.customExercises?.[i]
      return next && ex.id === next.id && ex.text === next.text
    })

  return (
    prevProps.isChallenge === nextProps.isChallenge &&
    prevProps.challengeText === nextProps.challengeText &&
    prevProps.onSessionComplete === nextProps.onSessionComplete &&
    prevProps.onKeyInput === nextProps.onKeyInput &&
    prevProps.sound?.isEnabled === nextProps.sound?.isEnabled &&
    exercisesEqual
  )
})
