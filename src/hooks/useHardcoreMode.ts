import { useState, useEffect, useCallback, useRef } from 'react'
import type { TypingStats } from '../types'
import { generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import type { useTypingSound } from './useTypingSound'
import { useCountdown } from './useCountdown'

const COUNTDOWN_SECONDS = 3
const TEXT_LENGTH = 30
const TEXT_DIFFICULTY = 5

interface UseHardcoreModeOptions {
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
  setBestStreak?: React.Dispatch<React.SetStateAction<number>>
}

export interface UseHardcoreModeReturn {
  text: string
  currentIndex: number
  inputResults: Array<{ isCorrect: boolean; char: string }>
  isActive: boolean
  countdown: number | null
  streak: number
  bestStreak: number
  startTime: number | null
  inputRef: React.RefObject<HTMLInputElement>
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  handleStart: () => void
  resetGame: () => void
}

export function useHardcoreMode({
  onComplete,
  sound,
  setBestStreak: setBestStreakProp,
}: UseHardcoreModeOptions): UseHardcoreModeReturn {
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<Array<{ isCorrect: boolean; char: string }>>([])
  const [isActive, setIsActive] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreakLocal] = useState(0)

  const setBestStreak = useCallback((value: React.SetStateAction<number>) => {
    setBestStreakLocal(value)
    setBestStreakProp?.(value)
  }, [setBestStreakProp])

  const inputRef = useRef<HTMLInputElement>(null)
  const textLengthRef = useRef(0)
  const textRef = useRef(text)
  const streakRef = useRef(0)
  const pendingCompletionRef = useRef(false)
  const inputResultsRef = useRef(inputResults)
  const currentIndexRef = useRef(currentIndex)
  const startTimeRef = useRef(startTime)
  streakRef.current = streak
  inputResultsRef.current = inputResults
  textRef.current = text
  currentIndexRef.current = currentIndex
  startTimeRef.current = startTime

  const calculateCorrectCount = useCallback((results: Array<{ isCorrect: boolean }>): number => {
    let count = 0
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result && result.isCorrect) count++
    }
    return count
  }, [])

  const generateNewText = useCallback(() => {
    const newText = generatePracticeText(TEXT_LENGTH, TEXT_DIFFICULTY)
    setText(newText)
    setCurrentIndex(0)
    setInputResults([])
    textLengthRef.current = newText.length
  }, [])

  useEffect(() => {
    generateNewText()
  }, [generateNewText])

  const activateGame = useCallback(() => {
    setIsActive(true)
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const { countdown, start: startCountdown, cancel: cancelCountdown } = useCountdown({
    onComplete: activateGame,
  })

  const handleStart = useCallback(() => {
    setStartTime(Date.now())
    startCountdown(COUNTDOWN_SECONDS)
  }, [startCountdown])

  const handleMistake = useCallback(() => {
    setIsActive(false)
    setBestStreak?.(prev => Math.max(prev, streakRef.current))

    const results = inputResultsRef.current
    const startedAt = startTimeRef.current
    const correct = calculateCorrectCount(results)
    const timeElapsed = startedAt ? (Date.now() - startedAt) / 1000 : 0
    const total = results.length + 1
    const errors = 1

    const stats = calculateStats(correct, total, errors, timeElapsed)
    onComplete(stats)
  }, [calculateCorrectCount, onComplete, setBestStreak])

  const isHandlingInput = useRef(false)

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (isHandlingInput.current) return
    isHandlingInput.current = true

    try {
      if (!isActive && countdown === null) {
        handleStart()
        return
      }

      const value = e.currentTarget.value
      const newChar = value[value.length - 1]
      if (!newChar) return

      const idx = currentIndexRef.current
      const currentText = textRef.current
      if (idx < textLengthRef.current) {
        const expectedChar = currentText[idx]
        const isCorrect = newChar === expectedChar

        if (!isCorrect) {
          try { if (sound) sound.playError() } catch { /* sound failure is non-critical */ }
          handleMistake()
          return
        }

        try { if (sound) sound.playCorrect(expectedChar.toLowerCase()) } catch { /* sound failure is non-critical */ }

        setStreak(prev => prev + 1)

        setInputResults(prev => [...prev, { isCorrect: true, char: newChar }])

        if (idx >= textLengthRef.current - 1) {
          pendingCompletionRef.current = true
        }

        setCurrentIndex(prev => prev + 1)
      }

      e.currentTarget.value = ''
    } finally {
      isHandlingInput.current = false
    }
  }, [isActive, countdown, sound, handleMistake, handleStart])

  // Process deferred text generation outside of setState updaters
  useEffect(() => {
    if (!pendingCompletionRef.current) return
    pendingCompletionRef.current = false
    generateNewText()
  }, [currentIndex, generateNewText])

  const resetGame = useCallback(() => {
    pendingCompletionRef.current = false
    setStreak(0)
    setBestStreak?.(prev => Math.max(prev, streakRef.current))
    generateNewText()
    setIsActive(false)
    cancelCountdown()
    setStartTime(null)
    setInputResults([])
    setCurrentIndex(0)
  }, [generateNewText, setBestStreak, cancelCountdown])

  return {
    text,
    currentIndex,
    inputResults,
    isActive,
    countdown,
    streak,
    bestStreak,
    startTime,
    inputRef,
    handleInput,
    handleStart,
    resetGame,
  }
}
