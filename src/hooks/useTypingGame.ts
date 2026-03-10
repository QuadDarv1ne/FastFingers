import { useState, useEffect, useCallback, useRef } from 'react'
import { TypingStats, KeyInputResult } from '../types'
import { generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from './useTypingSound'
import { createScopedLogger } from '../utils/logger'

interface UseTypingGameOptions {
  initialWordCount?: number
  initialDifficulty?: number
  onComplete?: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
  onKeyInput?: (key: string, isCorrect: boolean) => void
  mode?: 'practice' | 'timed'
  duration?: number
}

interface UseTypingGameReturn {
  text: string
  currentIndex: number
  inputResults: KeyInputResult[]
  startTime: number | null
  isComplete: boolean
  isPaused: boolean
  isActive: boolean
  wpm: number
  accuracy: number
  errors: number
  timeLeft: number
  inputRef: React.RefObject<HTMLInputElement>
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  handleSkip: () => void
  handleStart: () => void
  reset: () => void
  focusInput: () => void
  generateNewText: () => void
}

const DEFAULT_WORD_COUNT = 30
const DEFAULT_DIFFICULTY = 5
const DEFAULT_DURATION = 60
const MIN_WORD_COUNT = 1
const MAX_WORD_COUNT = 200
const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 10
const MIN_DURATION = 10
const MAX_DURATION = 600

const logger = createScopedLogger('useTypingGame')

export function useTypingGame({
  initialWordCount = DEFAULT_WORD_COUNT,
  initialDifficulty = DEFAULT_DIFFICULTY,
  onComplete,
  sound,
  onKeyInput,
  mode = 'practice',
  duration = DEFAULT_DURATION,
}: UseTypingGameOptions = {}): UseTypingGameReturn {
  // Валидация входных параметров
  const safeWordCount = Math.max(
    MIN_WORD_COUNT,
    Math.min(MAX_WORD_COUNT, Math.floor(initialWordCount || DEFAULT_WORD_COUNT))
  )
  const safeDifficulty = Math.max(
    MIN_DIFFICULTY,
    Math.min(MAX_DIFFICULTY, Math.floor(initialDifficulty || DEFAULT_DIFFICULTY))
  )
  const safeDuration = Math.max(
    MIN_DURATION,
    Math.min(MAX_DURATION, Math.floor(duration || DEFAULT_DURATION))
  )

  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<KeyInputResult[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(safeDuration)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const isHandlingInput = useRef(false)

  const generateNewText = useCallback(() => {
    try {
      const newText = generatePracticeText(safeWordCount, safeDifficulty)

      if (!newText || newText.trim().length === 0) {
        logger.warn('Generated empty text, using fallback')
        setText('текст для печати')
      } else {
        setText(newText)
      }
      
      setCurrentIndex(0)
      setInputResults([])
      setStartTime(null)
      setIsComplete(false)
      setIsPaused(false)
      setIsActive(false)
      setTimeLeft(safeDuration)
      setWpm(0)
      setAccuracy(100)
      setErrors(0)
    } catch (error) {
      logger.error('Error generating text:', error)
      setText('ошибка генерации текста')
      setCurrentIndex(0)
      setInputResults([])
      setStartTime(null)
      setIsComplete(false)
      setIsPaused(false)
      setIsActive(false)
      setTimeLeft(safeDuration)
      setWpm(0)
      setAccuracy(100)
      setErrors(0)
    }
  }, [safeWordCount, safeDifficulty, safeDuration])

  useEffect(() => {
    generateNewText()
  }, [generateNewText])

  // Таймер для timed режима
  useEffect(() => {
    if (mode !== 'timed' || !isActive || timeLeft <= 0) return

    const interval = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false)
          setIsComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [mode, isActive, timeLeft])

  const handleComplete = useCallback(
    (results: KeyInputResult[]) => {
      if (!results || results.length === 0) {
        logger.warn('handleComplete called with empty results')
        return
      }

      if (!startTime && mode !== 'timed') {
        logger.warn('handleComplete called without startTime')
        return
      }

      try {
        const elapsed = mode === 'timed' ? safeDuration - timeLeft : (Date.now() - (startTime || 0)) / 1000
        const correctChars = results.filter(r => r?.isCorrect).length
        const errorCount = results.filter(r => r && !r.isCorrect).length

        // Защита от деления на ноль и некорректных значений
        const safeElapsed = Math.max(elapsed, 0.001)
        const safeTotal = Math.max(results.length, 1)

        const stats = calculateStats(correctChars, safeTotal, errorCount, safeElapsed)

        setIsComplete(true)
        setWpm(stats.wpm)
        setAccuracy(stats.accuracy)
        setErrors(errorCount)
        onComplete?.(stats)
      } catch (error) {
        logger.error('Error in handleComplete:', error)
        setIsComplete(true)
        setWpm(0)
        setAccuracy(100)
        setErrors(0)
      }
    },
    [startTime, onComplete, mode, safeDuration, timeLeft]
  )

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      try {
        const value = e.currentTarget.value

        // Защита от повторного входа
        if (isHandlingInput.current) return
        isHandlingInput.current = true

        if (isPaused || isComplete) return

        // Авто-старт в timed режиме
        if (mode === 'timed' && !isActive && timeLeft === safeDuration) {
          setIsActive(true)
        }

        if (!startTime && value) {
          setStartTime(Date.now())
        }

        const newChar = value[value.length - 1]

        // Защита от пустых символов
        if (!newChar || !text || text.length === 0) {
          isHandlingInput.current = false
          return
        }

        setCurrentIndex(prevIndex => {
          const expectedChar = text[prevIndex]
          
          // Защита от выхода за границы текста
          if (!expectedChar || prevIndex >= text.length) {
            isHandlingInput.current = false
            return prevIndex
          }

          const isCorrect = newChar === expectedChar

          try {
            if (sound) {
              isCorrect ? sound.playCorrect(expectedChar.toLowerCase()) : sound.playError()
            }
          } catch (soundError) {
            logger.warn('Sound playback error:', soundError)
          }

          try {
            onKeyInput?.(expectedChar.toLowerCase(), isCorrect)
          } catch (callbackError) {
            logger.warn('onKeyInput callback error:', callbackError)
          }

          const result: KeyInputResult = {
            isCorrect,
            char: newChar,
            expectedChar,
            timestamp: Date.now(),
          }

          setInputResults(prev => {
            const newResults = [...prev, result]

            // Авто-генерация нового текста когда дошли до конца
            if (prevIndex >= text.length - 5) {
              generateNewText()
            }

            // Завершение в practice режиме
            if (mode === 'practice' && prevIndex >= text.length - 1) {
              handleComplete(newResults)
            }

            return newResults
          })

          return prevIndex + 1
        })

        e.currentTarget.value = ''
      } catch (error) {
        logger.error('Error in handleInput:', error)
      } finally {
        isHandlingInput.current = false
      }
    },
    [text, startTime, isPaused, isComplete, mode, isActive, timeLeft, safeDuration, sound, onKeyInput, generateNewText, handleComplete]
  )

  const handleSkip = useCallback(() => {
    try {
      generateNewText()
    } catch (error) {
      logger.error('Error in handleSkip:', error)
    }
  }, [generateNewText])

  const reset = useCallback(() => {
    try {
      generateNewText()
    } catch (error) {
      logger.error('Error in reset:', error)
    }
  }, [generateNewText])

  const focusInput = useCallback(() => {
    try {
      inputRef.current?.focus({ preventScroll: true })
    } catch (error) {
      logger.warn('Error focusing input:', error)
    }
  }, [])

  return {
    text,
    currentIndex,
    inputResults,
    startTime,
    isComplete,
    isPaused,
    isActive,
    wpm,
    accuracy,
    errors,
    timeLeft,
    inputRef,
    handleInput,
    handleSkip,
    handleStart: () => {
      try {
        setIsActive(true)
        setStartTime(Date.now())
        inputRef.current?.focus({ preventScroll: true })
      } catch (error) {
        logger.warn('Error in handleStart:', error)
      }
    },
    reset,
    focusInput,
    generateNewText,
  }
}
