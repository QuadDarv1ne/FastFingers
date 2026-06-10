import { useState, useEffect, useCallback, useRef } from 'react'
import type { TypingStats, KeyInputResult } from '../types'
import { generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from './useTypingSound'
import { useTypingTimer } from './useTypingTimer'
import { createScopedLogger } from '../utils/logger'

interface UseTypingGameOptions {
  initialWordCount?: number
  initialDifficulty?: number
  onComplete?: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
  onKeyInput?: (key: string, isCorrect: boolean) => void
  mode?: 'practice' | 'timed'
  duration?: number
  customText?: string
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

const FALLBACK_TEXT = 'Text for typing'
const FALLBACK_ERROR_TEXT = 'Error generating text'

const logger = createScopedLogger('useTypingGame')

export function useTypingGame({
  initialWordCount = DEFAULT_WORD_COUNT,
  initialDifficulty = DEFAULT_DIFFICULTY,
  onComplete,
  sound,
  onKeyInput,
  mode = 'practice',
  duration = DEFAULT_DURATION,
  customText,
}: UseTypingGameOptions = {}): UseTypingGameReturn {
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
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)

  const { timeLeft, timeLeftRef, timeExpiredRef, setTimeLeft } = useTypingTimer({
    mode,
    duration: safeDuration,
    isActive,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const isHandlingInput = useRef(false)
  const inputResultsRef = useRef<KeyInputResult[]>([])
  const pendingCompletionRef = useRef<{ results: KeyInputResult[]; shouldGenerateText: boolean } | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const generateNewText = useCallback(() => {
    try {
      if (customText) {
        if (customText.trim().length === 0) {
          logger.warn('Custom text is empty, using fallback')
          setText(FALLBACK_TEXT)
        } else {
          setText(customText)
        }
      } else {
        const newText = generatePracticeText(safeWordCount, safeDifficulty)

        if (!newText || newText.trim().length === 0) {
          logger.warn('Generated empty text, using fallback')
          setText(FALLBACK_TEXT)
        } else {
          setText(newText)
        }
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
      setText(FALLBACK_ERROR_TEXT)
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
  }, [safeWordCount, safeDifficulty, safeDuration, customText, setTimeLeft])

  useEffect(() => {
    generateNewText()
  }, [generateNewText])

  useEffect(() => {
    inputResultsRef.current = inputResults
  }, [inputResults])

  useEffect(() => {
    startTimeRef.current = startTime
  }, [startTime])

  const handleComplete = useCallback(
    (results: KeyInputResult[]) => {
      if (!results || results.length === 0) {
        logger.warn('handleComplete called with empty results')
        return
      }

      if (!startTimeRef.current && mode !== 'timed') {
        logger.warn('handleComplete called without startTime')
        return
      }

      try {
        const elapsed = mode === 'timed'
          ? startTimeRef.current
            ? (Date.now() - startTimeRef.current) / 1000
            : safeDuration - timeLeftRef.current
          : (Date.now() - (startTimeRef.current || 0)) / 1000
        const correctChars = results.filter(r => r?.isCorrect).length
        const errorCount = results.filter(r => r && !r.isCorrect).length

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
    [onComplete, mode, safeDuration, timeLeftRef]
  )

  useEffect(() => {
    if (!timeExpiredRef.current) return
    timeExpiredRef.current = false
    setIsActive(false)
    setIsComplete(true)
    if (mode === 'timed') {
      handleComplete(inputResultsRef.current)
    }
  }, [timeLeft, mode, handleComplete, timeExpiredRef])

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      try {
        const value = e.currentTarget.value

        if (isHandlingInput.current) return
        isHandlingInput.current = true

        if (isPaused || isComplete) return

        if (mode === 'timed' && !isActive && timeLeftRef.current === safeDuration) {
          setIsActive(true)
        }

        if (!startTime && value) {
          setStartTime(Date.now())
        }

        const newChar = value[value.length - 1]

        if (!newChar || !text || text.length === 0) {
          isHandlingInput.current = false
          return
        }

        const expectedChar = text[currentIndex]

        if (!expectedChar || currentIndex >= text.length) {
          isHandlingInput.current = false
          return
        }

        const isCorrect = newChar === expectedChar
        const result: KeyInputResult = {
          isCorrect,
          char: newChar,
          expectedChar,
          timestamp: Date.now(),
        }

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

        setInputResults(prev => [...prev, result])

        const isTextComplete = mode === 'practice' && currentIndex >= text.length - 1
        if (isTextComplete) {
          pendingCompletionRef.current = {
            results: [...inputResults, result],
            shouldGenerateText: true,
          }
        }

        setCurrentIndex(prev => prev + 1)

        e.currentTarget.value = ''
      } catch (error) {
        logger.error('Error in handleInput:', error)
      } finally {
        isHandlingInput.current = false
      }
    },
    [text, startTime, isPaused, isComplete, mode, isActive, safeDuration, sound, onKeyInput, currentIndex, inputResults, timeLeftRef]
  )

  useEffect(() => {
    const pending = pendingCompletionRef.current
    if (!pending) return

    pendingCompletionRef.current = null

    if (pending.shouldGenerateText && !customText) {
      generateNewText()
    }

    if (mode === 'practice') {
      handleComplete(pending.results)
    }
  }, [currentIndex, mode, generateNewText, handleComplete, customText])

  const handleSkip = useCallback(() => {
    try {
      generateNewText()
    } catch (error) {
      logger.error('Error in handleSkip:', error)
    }
  }, [generateNewText])

  const focusInput = useCallback(() => {
    try {
      inputRef.current?.focus({ preventScroll: true })
    } catch (error) {
      logger.warn('Error focusing input:', error)
    }
  }, [])

  const reset = useCallback(() => {
    generateNewText()
  }, [generateNewText])

  const handleStart = useCallback(() => {
    try {
      setIsActive(true)
      setStartTime(Date.now())
      inputRef.current?.focus({ preventScroll: true })
    } catch (error) {
      logger.warn('Error in handleStart:', error)
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
    handleStart,
    reset,
    focusInput,
    generateNewText,
  }
}
