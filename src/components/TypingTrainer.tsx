import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyboardLayout, TypingStats, KeyInputResult, Exercise } from '../types'
import { getRandomExercise, generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from '../hooks/useTypingSound'
import { useHotkey } from '../hooks/useHotkeys'
import { TypingChar } from './TypingChar'

interface TypingTrainerProps {
  layout: KeyboardLayout
  fontSize: 'small' | 'medium' | 'large'
  onSessionComplete: (stats: TypingStats) => void
  onKeyInput?: (key: string, isCorrect: boolean) => void
  sound?: ReturnType<typeof useTypingSound>
  customExercises?: Exercise[]
  isChallenge?: boolean
  challengeText?: string
}

export const TypingTrainer = memo<TypingTrainerProps>(function TypingTrainer({ 
  fontSize, 
  onSessionComplete,
  onKeyInput,
  sound,
  customExercises = [],
  isChallenge = false,
  challengeText
}: TypingTrainerProps) {
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<KeyInputResult[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(5)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)

  // Завершение упражнения
  const handleComplete = useCallback((results: KeyInputResult[]) => {
    const correctChars = results.filter(r => r.isCorrect).length
    const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0

    const stats = calculateStats(correctChars, results.length, results.filter(r => !r.isCorrect).length, timeElapsed)

    setIsComplete(true)
    onSessionComplete(stats)
  }, [startTime, onSessionComplete])

  // Инициализация упражнения
  const initExercise = useCallback(() => {
    let exerciseText: string

    // Если режим челленджа - используем текст челленджа
    if (isChallenge && challengeText) {
      exerciseText = challengeText
    } else if (selectedCategory === 'custom' && customExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * customExercises.length)
      exerciseText = customExercises[randomIndex]?.text || ''
    } else if (selectedCategory !== 'all') {
      const exercise = getRandomExercise(selectedCategory, selectedDifficulty)
      exerciseText = exercise?.text || ''
    } else {
      exerciseText = generatePracticeText(20, selectedDifficulty)
    }

    setText(exerciseText)
    setCurrentIndex(0)
    setInputResults([])
    setStartTime(null)
    setIsComplete(false)
    setIsPaused(false)

    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [selectedCategory, selectedDifficulty, customExercises, isChallenge, challengeText])

  useEffect(() => {
    initExercise()
  }, [initExercise])

  // Обработка ввода
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value

    if (isPaused) return

    // Начало отсчёта времени при первом вводе
    if (!startTime && value) {
      setStartTime(Date.now())
    }

    const newChar = value[value.length - 1]

    if (newChar) {
      setCurrentIndex(prevIndex => {
        const expectedChar = text[prevIndex]
        const isCorrect = newChar === expectedChar

        // Звуковой эффект
        if (sound && expectedChar) {
          isCorrect ? sound.playCorrect(expectedChar.toLowerCase()) : sound.playError()
        }

        // Callback для тепловой карты
        if (expectedChar) {
          onKeyInput?.(expectedChar.toLowerCase(), isCorrect)
        }

        const result: KeyInputResult = {
          isCorrect,
          char: newChar,
          expectedChar: expectedChar || '',
          timestamp: Date.now(),
        }

        setInputResults(prev => {
          const newResults = [...prev, result]
          
          // Проверка завершения
          if (prevIndex >= text.length - 1) {
            handleComplete(newResults)
          }
          
          return newResults
        })

        return prevIndex + 1
      })
    }

    // Очищаем инпут, но сохраняем историю
    e.currentTarget.value = ''
  }, [text, startTime, isPaused, sound, onKeyInput, handleComplete])

  // Пропуск упражнения
  const handleSkip = useCallback(() => {
    initExercise()
  }, [initExercise])

  // Горячие клавиши
  useHotkey('escape', () => {
    if (!isChallenge) {
      handleSkip()
    }
  }, { enabled: !isPaused })

  useHotkey('enter', () => {
    inputRef.current?.focus()
  }, { enabled: true })

  // Размер шрифта (мемоизация)
  const fontSizeClass = useMemo(() => ({
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  }[fontSize]), [fontSize])

  // Текущая клавиша для подсветки (мемоизация)
  const currentKey = useMemo(() => 
    text[currentIndex]?.toLowerCase() || '',
    [text, currentIndex]
  )

  return (
    <div className="space-y-6">
      {/* Выбор режима */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="category-select" className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <span>📁</span>
              Категория
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-dark-600"
              disabled={isChallenge}
            >
              <option value="all">🎲 Случайные слова</option>
              <option value="basic">⌨️ Основной ряд</option>
              <option value="upper">⬆️ Верхний ряд</option>
              <option value="lower">⬇️ Нижний ряд</option>
              <option value="words">📝 Слова</option>
              <option value="sentences">📄 Предложения</option>
              <option value="code">💻 Код</option>
              {customExercises.length > 0 && (
                <option value="custom">✏️ Мои упражнения ({customExercises.length})</option>
              )}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label htmlFor="difficulty-select" className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <span>🎯</span>
              Сложность
            </label>
            <select
              id="difficulty-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-dark-600"
            >
              <option value={1}>⭐ Очень легко</option>
              <option value={3}>⭐⭐ Легко</option>
              <option value={5}>⭐⭐⭐ Средне</option>
              <option value={7}>⭐⭐⭐⭐ Сложно</option>
              <option value={9}>⭐⭐⭐⭐⭐ Очень сложно</option>
            </select>
          </div>
          
          <button
            onClick={initExercise}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center gap-2"
            title="Сгенерировать новое упражнение"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Новое</span>
          </button>
        </div>
      </div>

      {/* Область текста */}
      <div
        ref={textContainerRef}
        className="card cursor-text min-h-[250px] relative group hover:border-primary-500/30 transition-all"
      >
        {/* Подсказка о фокусе */}
        {!isComplete && (
          <div className="absolute top-4 right-4 text-xs text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Кликните или нажмите Enter
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute pointer-events-none"
          onInput={handleInput}
          onBlur={() => !isComplete && setTimeout(() => inputRef.current?.focus(), 100)}
          disabled={isComplete}
          aria-label="Поле ввода для печати"
        />
        
        <div className={`font-mono leading-relaxed ${fontSizeClass} break-words select-none`}>
          {text.split('').map((char, index) => {
            let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
            
            if (index < currentIndex) {
              status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
            } else if (index === currentIndex && !isComplete) {
              status = 'current'
            }
            
            return <TypingChar key={index} char={char} status={status} />
          })}
        </div>
        
        {/* Индикатор прогресса */}
        <div className="mt-8 space-y-2">
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
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-dark-700/50">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
            title="Пропустить это упражнение"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Пропустить
          </button>
          
          {isComplete && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={initExercise}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center gap-2"
            >
              Продолжить
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          )}
        </div>
        
        {/* Экран завершения */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark-900/95 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <div className="text-center px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1, duration: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-success"
                >
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-3 text-gradient-success"
                >
                  Отлично! 🎉
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-dark-300 mb-8 text-lg"
                >
                  Упражнение завершено. Продолжайте в том же духе!
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={initExercise}
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center gap-2 mx-auto"
                >
                  Следующее упражнение
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.isChallenge === nextProps.isChallenge &&
    prevProps.challengeText === nextProps.challengeText &&
    prevProps.layout === nextProps.layout
  )
})
