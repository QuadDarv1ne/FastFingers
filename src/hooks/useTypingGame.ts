import { useState, useEffect, useCallback, useRef } from 'react'
import { TypingStats, KeyInputResult } from '../types'
import { generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from './useTypingSound'

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

export function useTypingGame({
  initialWordCount = 30,
  initialDifficulty = 5,
  onComplete,
  sound,
  onKeyInput,
  mode = 'practice',
  duration = 60,
}: UseTypingGameOptions = {}): UseTypingGameReturn {
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<KeyInputResult[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  const generateNewText = useCallback(() => {
    const newText = generatePracticeText(initialWordCount, initialDifficulty)
    setText(newText)
    setCurrentIndex(0)
    setInputResults([])
    setStartTime(null)
    setIsComplete(false)
    setIsPaused(false)
    setIsActive(false)
    setTimeLeft(duration)
    setWpm(0)
    setAccuracy(100)
    setErrors(0)
  }, [initialWordCount, initialDifficulty, duration])

  useEffect(() => {
    generateNewText()
    // Убрали авто-фокус при монтировании - он вызывает нежелательный скролл
    // Фокус устанавливается при первом взаимодействии пользователя
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
      if (!startTime && mode !== 'timed') return

      const elapsed = mode === 'timed' ? duration - timeLeft : (Date.now() - (startTime || 0)) / 1000
      const correctChars = results.filter(r => r.isCorrect).length
      const errorCount = results.filter(r => !r.isCorrect).length

      const stats = calculateStats(correctChars, results.length, errorCount, elapsed)

      setIsComplete(true)
      setWpm(stats.wpm)
      setAccuracy(stats.accuracy)
      setErrors(errorCount)
      onComplete?.(stats)
    },
    [startTime, onComplete, mode, duration, timeLeft]
  )

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value

      if (isPaused || isComplete) return

      // Авто-старт в timed режиме
      if (mode === 'timed' && !isActive && timeLeft === duration) {
        setIsActive(true)
      }

      if (!startTime && value) {
        setStartTime(Date.now())
      }

      const newChar = value[value.length - 1]

      if (!newChar) return

      setCurrentIndex(prevIndex => {
        const expectedChar = text[prevIndex]
        if (!expectedChar) return prevIndex

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
    },
    [text, startTime, isPaused, isComplete, mode, isActive, timeLeft, duration, sound, onKeyInput, generateNewText, handleComplete]
  )

  const handleSkip = useCallback(() => {
    generateNewText()
  }, [generateNewText])

  const reset = useCallback(() => {
    generateNewText()
  }, [generateNewText])

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true })
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
      setIsActive(true)
      setStartTime(Date.now())
      inputRef.current?.focus({ preventScroll: true })
    },
    reset,
    focusInput,
    generateNewText,
  }
}
