import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TypingStats, KeyInputResult, Exercise } from '../types'
import { getRandomExercise, generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import type { useTypingSound } from '../hooks/useTypingSound'
import { useHotkey } from '../hooks/useHotkeys'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { TypingChar } from './TypingChar'
import { useAppTranslation } from '../i18n/config'
import { createScopedLogger } from '../utils/logger'
import {
  useAdaptiveDifficulty,
} from '../hooks/useAdaptiveDifficulty'

const FONT_SIZE_STYLE = { fontSize: 'var(--font-size-practice)' } as const
const logger = createScopedLogger('TypingTrainer')
const EMPTY_EXERCISES: Exercise[] = []

interface TypingTrainerProps {
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
  customExercises = EMPTY_EXERCISES,
  isChallenge = false,
  challengeText
}: TypingTrainerProps) {
  const { t } = useAppTranslation()
  const adaptive = useAdaptiveDifficulty(true)
  const adaptiveRef = useRef(adaptive)
  adaptiveRef.current = adaptive
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<KeyInputResult[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(5)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const textLengthRef = useRef(0)
  const completionRef = useRef<HTMLDivElement>(null)
  const correctCountRef = useRef(0)
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultsRef = useRef<KeyInputResult[]>([])
  const isCompletingRef = useRef(false)

  useFocusTrap(completionRef, isComplete)

  const wpm = useMemo(() => {
    if (!startTime || currentIndex === 0) return 0
    const elapsed = (Date.now() - startTime) / 1000 / 60
    if (elapsed <= 0) return 0
    return Math.round((currentIndex / 5) / elapsed)
  }, [currentIndex, startTime])

  const accuracy = useMemo(() => {
    if (inputResults.length === 0) return 100
    const correct = inputResults.filter(r => r?.isCorrect).length
    return Math.round((correct / inputResults.length) * 100)
  }, [inputResults])

  const handleComplete = useCallback((results: KeyInputResult[]) => {
    if (!startTime || isCompletingRef.current) return
    isCompletingRef.current = true

    let correctChars = 0
    let errors = 0
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (!result) continue
      if (result.isCorrect) {
        correctChars++
      } else {
        errors++
      }
    }
    const timeElapsed = (Date.now() - startTime) / 1000

    const stats = calculateStats(correctChars, results.length, errors, timeElapsed)

    setIsComplete(true)
    adaptiveRef.current.onSessionComplete(stats)
    onSessionComplete(stats)
  }, [startTime, onSessionComplete])

  const initExercise = useCallback(() => {
    try {
      const currentAdaptive = adaptiveRef.current
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
        if (currentAdaptive.isEnabled) {
          const adaptiveText = currentAdaptive.getNextText()
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
  }, [selectedCategory, selectedDifficulty, customExercises, isChallenge, challengeText, t])

  useEffect(() => {
    initExercise()
  }, [initExercise])

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComplete) return

    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Tab' || e.key === 'Escape') return
    if (e.repeat) return

    if (!startTime) {
      setStartTime(Date.now())
    }

    const expectedChar = text[currentIndex]
    if (!expectedChar) return

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
    const newResults = [...resultsRef.current, result]
    resultsRef.current = newResults
    setInputResults(newResults)

    e.preventDefault()

    if (nextIndex >= textLengthRef.current) {
      handleComplete(resultsRef.current)
    }
  }, [text, currentIndex, startTime, isComplete, sound, onKeyInput, handleComplete])

  const handleSkip = useCallback(() => {
    initExercise()
  }, [initExercise])

  useHotkey('escape', () => {
    if (!isChallenge) {
      handleSkip()
    }
  }, { enabled: !isChallenge, ignoreInputFocus: true })

  useHotkey('enter', () => {
    inputRef.current?.focus({ preventScroll: true })
  }, { enabled: true })

  const fontSizeStyle = FONT_SIZE_STYLE

  const currentKey = text[currentIndex]?.toLowerCase() || ''

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

  const difficultyOptions = useMemo(() =>
    DIFFICULTY_OPTIONS.map(opt => ({
      value: opt.value,
      label: `${'⭐'.repeat(opt.stars)} ${t(opt.labelKey)}`,
    })),
    [t],
  )

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

  const liveRegionText = useMemo(() => {
    const label = t('trainer.liveRegion')
    return `${currentIndex} / ${text.length} ${label} ${correctCountRef.current} / ${inputResults.length}`
  }, [currentIndex, text.length, inputResults.length, t])

  const progressPercent = text.length > 0 ? Math.round((currentIndex / text.length) * 100) : 0

  return (
    <div className="space-y-4 sm:space-y-5" role="region" aria-label={t('trainer.aria.practiceArea')}>
      {/* Live WPM + Accuracy bar — animated */}
      {startTime && !isComplete && currentIndex > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-6 sm:gap-10 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-500 font-medium uppercase tracking-wider">WPM</span>
            <span className="text-xl font-bold font-mono text-primary-400 tabular-nums">
              {wpm}
            </span>
          </div>
          <div className="w-px h-6 bg-dark-700/50" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-500 font-medium uppercase tracking-wider">{t('common.accuracy')}</span>
            <span className={`text-xl font-bold font-mono tabular-nums ${
              accuracy >= 95 ? 'text-green-400' : accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {accuracy}%
            </span>
          </div>
        </motion.div>
      )}

      {/* Controls — compact card */}
      <div className="glass rounded-2xl p-4 sm:p-5" role="group" aria-label={t('trainer.aria.settings')}>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-3 items-stretch sm:items-end">
          <div className="flex-1 min-w-[160px]">
            <label htmlFor="category-select" className="block text-xs font-medium text-dark-400 mb-1.5">
              {t('exercise.custom').split(' ')[0]}
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-dark-800/60 border border-dark-700/50 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all hover:border-dark-600 min-h-touch"
              disabled={isChallenge}
              aria-disabled={isChallenge}
              aria-label={t('trainer.aria.category')}
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label htmlFor="difficulty-select" className="block text-xs font-medium text-dark-400 mb-1.5">
              {t('common.level')}
            </label>
            <select
              id="difficulty-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
              className="w-full bg-dark-800/60 border border-dark-700/50 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all hover:border-dark-600 min-h-touch"
              aria-label={t('trainer.aria.difficulty')}
            >
              {difficultyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-dark-400 mb-1.5">
              {t('trainer.adaptation')}
            </label>
            <div className="flex items-center gap-2.5 bg-dark-800/60 border border-dark-700/50 rounded-xl px-3.5 py-2.5">
              <span className="text-lg" title={t(adaptive.levelDescription)}>{adaptive.levelBadge}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-dark-400 truncate">{t('common.level')} {adaptive.level}</div>
                <div className="text-xs font-medium text-dark-300 truncate">{t(adaptive.levelDescription)}</div>
              </div>
              <button
                role="switch"
                aria-checked={adaptive.isEnabled}
                onClick={adaptive.toggleEnabled}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${adaptive.isEnabled ? 'bg-primary-600' : 'bg-dark-700'}`}
                aria-label={adaptive.isEnabled ? t('trainer.aria.adaptiveDisable') : t('trainer.aria.adaptiveToggle')}
              >
                <motion.div
                  className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                  animate={{ x: adaptive.isEnabled ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          <motion.button
            onClick={initExercise}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center justify-center gap-2 min-h-touch"
            title={t('action.restart')}
            aria-label={t('action.restart')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{t('action.restart')}</span>
          </motion.button>
        </div>
      </div>

      {/* Text area — with animated focus glow */}
      <div
        ref={textContainerRef}
        onClick={() => {
          inputRef.current?.focus({ preventScroll: true })
          setIsFocused(true)
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { inputRef.current?.focus({ preventScroll: true }); setIsFocused(true) } }}
        role="button"
        tabIndex={0}
        className={`relative glass rounded-2xl p-5 sm:p-6 cursor-text min-h-[220px] sm:min-h-[260px] transition-all duration-300 outline-none ${
          isFocused && !isComplete
            ? 'ring-2 ring-primary-500/40 shadow-lg shadow-primary-500/15 border-primary-500/40'
            : 'ring-0 shadow-sm border-dark-700/50 hover:border-dark-600/50'
        }`}
        onMouseEnter={() => !isComplete && inputRef.current?.focus({ preventScroll: true })}
      >
        {/* Focus hint */}
        {!isFocused && !isComplete && (
          <div className="absolute top-3 right-3 text-[10px] sm:text-xs text-dark-500 flex items-center gap-1.5 bg-dark-800/60 rounded-lg px-2.5 py-1.5 border border-dark-700/30 animate-fade-in">
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
            setIsFocused(true)
            if (isComplete) return
            if (blurTimerRef.current) {
              clearTimeout(blurTimerRef.current)
              blurTimerRef.current = null
            }
          }}
          onBlur={() => {
            setIsFocused(false)
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

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveRegionText}
        </div>

        <div className="font-mono leading-relaxed sm:leading-loose break-words select-none max-w-full overflow-wrap-anywhere text-lg sm:text-xl" style={fontSizeStyle}>
          {renderedChars}
        </div>

        {/* Progress bar */}
        <div className="mt-5 space-y-2" role="progressbar" aria-valuenow={currentIndex} aria-valuemin={0} aria-valuemax={text.length} aria-valuetext={`${progressPercent}%`} aria-label={t('trainer.aria.progress')}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-400 font-medium">{t('trainer.progressLabel')}</span>
            <span className="text-primary-400 font-bold font-mono tabular-nums">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-dark-800/60 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-full relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
            </motion.div>
          </div>
          <div className="flex justify-between text-[10px] text-dark-500">
            <span className="font-medium">{currentIndex} / {text.length} chars</span>
            <span className="font-mono font-medium text-dark-400">{wpm > 0 ? `${wpm} WPM` : '—'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-dark-700/30">
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all text-sm font-medium flex items-center gap-2 min-h-touch"
            title={t('trainer.aria.skip')}
            aria-label={t('trainer.aria.skip')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span className="hidden sm:inline">{t('action.skip')}</span>
          </motion.button>

          {!isComplete && (
            <div className="flex items-center gap-2">
              {/* Current key hint */}
              {currentKey && (
                <div className="flex items-center gap-1.5 text-xs text-dark-400">
                  <span>{t('trainer.nextKey')}:</span>
                  <span className="px-2 py-1 bg-primary-500/15 rounded-md border border-primary-500/20 text-primary-400 font-mono text-sm font-bold">
                    {currentKey === ' ' ? '␣' : currentKey}
                  </span>
                </div>
              )}
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={initExercise}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 bg-dark-800/60 hover:bg-dark-700/60 rounded-lg text-sm font-medium transition-all flex items-center gap-2 min-h-touch border border-dark-700/30"
                aria-label={t('trainer.aria.nextExercise')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('action.restart')}
              </motion.button>
            </div>
          )}
        </div>

        {/* Completion overlay */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 bg-dark-900/80 backdrop-blur-md rounded-2xl z-10 flex items-center justify-center"
              role="dialog"
              aria-modal="true"
              aria-labelledby="completion-title"
            >
              <div ref={completionRef} className="w-full h-full flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.1, stiffness: 200, damping: 15 }}
                    className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20"
                  >
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <motion.h3
                    id="completion-title"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold mb-1.5"
                  >
                    <span className="text-gradient-success">{t('status.completed')}</span>
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-dark-400 mb-5"
                  >
                    {t('trainer.exerciseComplete')}
                  </motion.p>

                  {/* Mini stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center gap-5 mb-5"
                  >
                    <div className="text-center">
                      <div className="text-xl font-bold font-mono text-primary-400">{wpm}</div>
                      <div className="text-[10px] text-dark-500 uppercase tracking-wider font-medium">WPM</div>
                    </div>
                    <div className="w-px bg-dark-700/50" />
                    <div className="text-center">
                      <div className={`text-xl font-bold font-mono ${accuracy >= 95 ? 'text-green-400' : accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>{accuracy}%</div>
                      <div className="text-[10px] text-dark-500 uppercase tracking-wider font-medium">{t('common.accuracy')}</div>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={initExercise}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/25 flex items-center gap-2 mx-auto text-sm"
                    aria-label={t('trainer.nextExercise')}
                  >
                    {t('trainer.nextExercise')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
