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
}

interface UseTypingGameReturn {
  text: string
  currentIndex: number
  inputResults: KeyInputResult[]
  startTime: number | null
  isComplete: boolean
  isPaused: boolean
  wpm: number
  accuracy: number
  errors: number
  inputRef: React.RefObject<HTMLInputElement>
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  handleSkip: () => void
  handleStart: () => void
  reset: () => void
  focusInput: () => void
}

export function useTypingGame({
  initialWordCount = 30,
  initialDifficulty = 5,
  onComplete,
  sound,
  onKeyInput,
}: UseTypingGameOptions = {}): UseTypingGameReturn {
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<KeyInputResult[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
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
    setWpm(0)
    setAccuracy(100)
    setErrors(0)
  }, [initialWordCount, initialDifficulty])

  useEffect(() => {
    generateNewText()
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [generateNewText])

  const handleComplete = useCallback(
    (results: KeyInputResult[]) => {
      if (!startTime) return

      const correctChars = results.filter(r => r.isCorrect).length
      const errorCount = results.filter(r => !r.isCorrect).length
      const timeElapsed = (Date.now() - startTime) / 1000

      const stats = calculateStats(correctChars, results.length, errorCount, timeElapsed)

      setIsComplete(true)
      setWpm(stats.wpm)
      setAccuracy(stats.accuracy)
      setErrors(errorCount)
      onComplete?.(stats)
    },
    [startTime, onComplete]
  )

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value

      if (isPaused || isComplete) return

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

          if (prevIndex >= text.length - 1) {
            handleComplete(newResults)
          }

          return newResults
        })

        return prevIndex + 1
      })

      e.currentTarget.value = ''
    },
    [text, startTime, isPaused, isComplete, sound, onKeyInput, handleComplete]
  )

  const handleSkip = useCallback(() => {
    generateNewText()
  }, [generateNewText])

  const handleStart = useCallback(() => {
    setStartTime(Date.now())
    setIsPaused(false)
    inputRef.current?.focus()
  }, [])

  const reset = useCallback(() => {
    generateNewText()
  }, [generateNewText])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return {
    text,
    currentIndex,
    inputResults,
    startTime,
    isComplete,
    isPaused,
    wpm,
    accuracy,
    errors,
    inputRef,
    handleInput,
    handleSkip,
    handleStart,
    reset,
    focusInput,
  }
}
