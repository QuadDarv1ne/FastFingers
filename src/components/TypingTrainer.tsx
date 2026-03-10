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
  { value: 'all', label: '🎲 Случайные слова' },
  { value: 'basic', label: '⌨️ Основной ряд' },
  { value: 'upper', label: '⬆️ Верхний ряд' },
  { value: 'lower', label: '⬇️ Нижний ряд' },
  { value: 'words', label: '📝 Слова' },
  { value: 'sentences', label: '📄 Предложения' },
  { value: 'code', label: '💻 Код' },
] as const

const DIFFICULTY_OPTIONS = [
  { value: 1, label: '⭐ Очень легко' },
  { value: 3, label: '⭐⭐ Легко' },
  { value: 5, label: '⭐⭐⭐ Средне' },
  { value: 7, label: '⭐⭐⭐⭐ Сложно' },
  { value: 9, label: '⭐⭐⭐⭐⭐ Очень сложно' },
] as const

export const TypingTrainer = memo<TypingTrainerProps>(function TypingTrainer({
  onSessionComplete,
  onKeyInput,
  sound,
  customExercises = [],
  isChallenge = false,
  challengeText
}: TypingTrainerProps) {
  const { t } = useAppTranslation()
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

  useFocusTrap(completionRef, isComplete)

  // Завершение упражнения — оптимизировано
  const handleComplete = useCallback((results: KeyInputResult[]) => {
    if (!startTime) return

    let correctChars = 0
    let errors = 0
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result && result.isCorrect) {
        correctChars++
      } else {
        errors++
      }
    }
    const timeElapsed = (Date.now() - startTime) / 1000

    const stats = calculateStats(correctChars, results.length, errors, timeElapsed)

    setIsComplete(true)
    onSessionComplete(stats)
  }, [startTime, onSessionComplete])

  // Инициализация упражнения — оптимизировано
  const initExercise = useCallback(() => {
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
      exerciseText = generatePracticeText(20, selectedDifficulty)
    }

    setText(exerciseText)
    setCurrentIndex(0)
    setInputResults([])
    setStartTime(null)
    setIsComplete(false)
    textLengthRef.current = exerciseText.length
  }, [selectedCategory, selectedDifficulty, customExercises, isChallenge, challengeText])

  useEffect(() => {
    initExercise()
  }, [initExercise])

  // Обработка ввода — оптимизировано с использованием refs
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value

    if (isComplete) return

    if (!startTime && value) {
      setStartTime(Date.now())
    }

    const newChar = value[value.length - 1]
    if (!newChar || !text) return

    const expectedChar = text[currentIndex]
    if (!expectedChar) return

    const isCorrect = newChar === expectedChar

    if (sound) {
      isCorrect ? sound.playCorrect(expectedChar.toLowerCase()) : sound.playError()
    }

    onKeyInput?.(expectedChar.toLowerCase(), isCorrect)

    const result: KeyInputResult = {
      isCorrect,
      char: newChar,
      expectedChar,
      timestamp: Date.now(),
    }

    setCurrentIndex(prev => prev + 1)
    setInputResults(prev => {
      const newResults = [...prev, result]
      if (currentIndex >= textLengthRef.current - 1) {
        handleComplete(newResults)
      }
      return newResults
    })

    e.currentTarget.value = ''
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
  }, { enabled: !isChallenge })

  useHotkey('enter', () => {
    inputRef.current?.focus({ preventScroll: true })
  }, { enabled: true })

  // Размер шрифта (мемоизация)
  const fontSizeStyle = useMemo(() => ({ fontSize: 'var(--font-size-practice)' }), [])

  // Текущая клавиша для подсветки (мемоизация)
  const currentKey = useMemo(() =>
    text[currentIndex]?.toLowerCase() || '',
    [text, currentIndex]
  )

  // Опции категории с мемоизацией
  const categoryOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [...CATEGORY_OPTIONS]
    if (customExercises.length > 0) {
      options.push({ value: 'custom', label: `✏️ Мои упражнения (${customExercises.length})` })
    }
    return options
  }, [customExercises.length])

  // Опции сложности с мемоизацией
  const difficultyOptions = useMemo(() => DIFFICULTY_OPTIONS, [])

  // Рендеринг символов текста (мемоизация)
  const renderedChars = useMemo(() => {
    const chars = text.split('')
    const result: JSX.Element[] = []
    const textLen = text.length

    for (let i = 0; i < textLen; i++) {
      const char = chars[i]
      if (!char) continue

      let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'

      if (i < currentIndex) {
        const resultItem = inputResults[i]
        status = resultItem?.isCorrect ? 'correct' : 'incorrect'
      } else if (i === currentIndex && !isComplete) {
        status = 'current'
      }

      result.push(<TypingChar key={`${i}-${char}`} char={char} status={status} />)
    }

    return result
  }, [text, currentIndex, inputResults, isComplete])

  // Статистика для live region (мемоизация)
  const liveRegionText = useMemo(() => {
    const correctCount = inputResults.reduce((sum, r) => sum + (r?.isCorrect ? 1 : 0), 0)
    return `${currentIndex} из ${text.length} символов. Точность: ${correctCount} из ${inputResults.length}`
  }, [currentIndex, text.length, inputResults])

  return (
    <div className="space-y-6" role="region" aria-label="Тренажёр печати">
      {/* Выбор режима */}
      <div className="card" role="group" aria-label="Настройки упражнения">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="category-select" className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <span>📁</span>
              {t('exercise.custom').split(' ')[0]}
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-dark-600"
              disabled={isChallenge}
              aria-disabled={isChallenge}
              aria-label="Категория упражнения"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label htmlFor="difficulty-select" className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <span>🎯</span>
              {t('common.level')}
            </label>
            <select
              id="difficulty-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-dark-600"
              aria-label="Выберите сложность"
            >
              {difficultyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={initExercise}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center gap-2"
            title="Сгенерировать новое упражнение"
            aria-label="Новое упражнение"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{t('action.restart')}</span>
          </button>
        </div>
      </div>

      {/* Область текста */}
      <div
        ref={textContainerRef}
        className="card cursor-text min-h-[250px] relative group hover:border-primary-500/30 transition-all"
        role="textbox"
        aria-readonly="true"
        aria-label="Область текста для печати"
      >
        {/* Подсказка о фокусе */}
        {!isComplete && (
          <div className="absolute top-4 right-4 text-xs text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Кликните или нажмите Enter
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          className="sr-only"
          aria-hidden="true"
          onInput={handleInput}
          onBlur={() => !isComplete && setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100)}
          disabled={isComplete}
          aria-label="Поле ввода для печати"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Live region для screen reader */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveRegionText}
        </div>

        <div className="font-mono leading-relaxed break-words select-none" style={fontSizeStyle} aria-live="polite">
          {renderedChars}
        </div>
        
        {/* Индикатор прогресса */}
        <div className="mt-8 space-y-2" role="progressbar" aria-valuenow={currentIndex} aria-valuemin={0} aria-valuemax={text.length} aria-label="Прогресс упражнения">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-400 font-medium">Прогресс</span>
            <span className="text-primary-400 font-bold">{Math.round((currentIndex / text.length) * 100)}%</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-dark-800 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 shadow-glow"
                initial={{ width: 0 }}
                animate={{ width: `${(currentIndex / text.length) * 100}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm text-dark-400 font-medium whitespace-nowrap min-w-[80px] text-right">
              {currentIndex} / {text.length}
            </span>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-dark-700/50" role="group" aria-label="Управление упражнением">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
            title="Пропустить это упражнение"
            aria-label="Пропустить упражнение"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            {t('action.skip')}
          </button>

          {isComplete && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={initExercise}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center gap-2"
              aria-label="Продолжить следующее упражнение"
            >
              {t('action.continue')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
              className="absolute inset-0 bg-dark-900/95 backdrop-blur-sm rounded-2xl flex items-center justify-center"
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
                  {t('exercise.custom').split(' ')[0]} {t('status.completed')}. {t('action.continue')}!
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={initExercise}
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center gap-2 mx-auto"
                  aria-label="Следующее упражнение"
                >
                  Следующее упражнение
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-dark-400 font-medium">Следующая клавиша:</span>
            <div className="px-4 py-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
              <span className="text-primary-400 font-mono text-2xl font-bold">{currentKey}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.isChallenge === nextProps.isChallenge &&
    prevProps.challengeText === nextProps.challengeText &&
    prevProps.layout === nextProps.layout
  )
})
