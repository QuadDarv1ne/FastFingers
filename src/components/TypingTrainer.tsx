import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyboardLayout, TypingStats, KeyInputResult, Exercise } from '../types'
import { getRandomExercise, generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from '../hooks/useTypingSound'

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

export function TypingTrainer({ 
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
      exerciseText = customExercises[randomIndex].text
    } else if (selectedCategory !== 'all') {
      const exercise = getRandomExercise(selectedCategory, selectedDifficulty)
      exerciseText = exercise.text
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

    if (isComplete || isPaused) return

    // Начало отсчёта времени при первом вводе
    if (!startTime) {
      setStartTime(Date.now())
    }

    const newChar = value[value.length - 1]
    const expectedChar = text[currentIndex]

    if (newChar) {
      const isCorrect = newChar === expectedChar

      // Звуковой эффект
      if (sound) {
        isCorrect ? sound.playCorrect(expectedChar.toLowerCase()) : sound.playError()
      }

      // Callback для тепловой карты
      onKeyInput?.(expectedChar.toLowerCase(), isCorrect)

      const result: KeyInputResult = {
        isCorrect,
        char: newChar,
        expectedChar,
        timestamp: Date.now(),
      }

      setInputResults(prev => [...prev, result])
      setCurrentIndex(prev => prev + 1)

      // Проверка завершения
      if (currentIndex >= text.length - 1) {
        handleComplete([...inputResults, result])
      }
    }

    // Очищаем инпут, но сохраняем историю
    e.currentTarget.value = ''
  }, [text, currentIndex, startTime, isComplete, isPaused, inputResults, sound, onKeyInput, handleComplete])

  // Пропуск упражнения
  const handleSkip = () => {
    initExercise()
  }

  // Фокус при клике
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  // Размер шрифта
  const fontSizeClass = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  }[fontSize]

  // Текущая клавиша для подсветки
  const currentKey = text[currentIndex]?.toLowerCase() || ''

  return (
    <div className="space-y-6">
      {/* Выбор режима */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-dark-400 mb-2">Категория</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isChallenge}
            >
              <option value="all">Случайные слова</option>
              <option value="basic">Основной ряд</option>
              <option value="upper">Верхний ряд</option>
              <option value="lower">Нижний ряд</option>
              <option value="words">Слова</option>
              <option value="sentences">Предложения</option>
              <option value="code">Код</option>
              {customExercises.length > 0 && (
                <option value="custom">Мои упражнения ({customExercises.length})</option>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-2">Сложность</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
              className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={1}>1 - Очень легко</option>
              <option value={3}>3 - Легко</option>
              <option value={5}>5 - Средне</option>
              <option value={7}>7 - Сложно</option>
              <option value={9}>9 - Очень сложно</option>
            </select>
          </div>
          
          <div className="flex-1" />
          
          <button
            onClick={initExercise}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-medium transition-colors"
          >
            Новое упражнение
          </button>
        </div>
      </div>

      {/* Область текста */}
      <div
        ref={textContainerRef}
        onClick={handleContainerClick}
        className="glass rounded-xl p-8 cursor-text min-h-[200px] relative"
      >
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute"
          onInput={handleInput}
          onBlur={() => !isComplete && setTimeout(() => inputRef.current?.focus(), 100)}
          disabled={isComplete}
        />
        
        <div className={`font-mono leading-relaxed ${fontSizeClass} break-words`}>
          {text.split('').map((char, index) => {
            let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
            
            if (index < currentIndex) {
              status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
            } else if (index === currentIndex && !isComplete) {
              status = 'current'
            }
            
            return (
              <span
                key={index}
                className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded transition-all duration-100 ${
                  status === 'correct' ? 'bg-success/20 text-success' :
                  status === 'incorrect' ? 'bg-error/20 text-error' :
                  status === 'current' ? 'bg-primary/30 text-primary border-2 border-primary animate-pulse' :
                  'text-dark-400'
                }`}
              >
                {char}
              </span>
            )
          })}
        </div>
        
        {/* Индикатор прогресса */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400"
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / text.length) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-sm text-dark-400 whitespace-nowrap">
            {currentIndex} / {text.length}
          </span>
        </div>
        
        {/* Кнопки управления */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-dark-400 hover:text-white transition-colors text-sm"
          >
            Пропустить
          </button>
          
          {isComplete && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={initExercise}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
            >
              Продолжить →
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
              className="absolute inset-0 bg-dark-900/90 rounded-xl flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Упражнение завершено!</h3>
                <p className="text-dark-400 mb-6">Отличная работа! Так держать!</p>
                <button
                  onClick={initExercise}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                >
                  Следующее упражнение
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Подсказка по текущей клавише */}
      {currentKey && !isComplete && (
        <div className="text-center">
          <p className="text-sm text-dark-400">
            Текущая клавиша: <span className="text-primary-400 font-mono text-lg">{currentKey}</span>
          </p>
        </div>
      )}
    </div>
  )
}
