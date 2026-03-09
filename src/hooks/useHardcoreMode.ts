import { useState, useEffect, useCallback, useRef } from 'react'
import { TypingStats } from '../types'
import { generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from './useTypingSound'

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
  const [countdown, setCountdown] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreakLocal] = useState(0)

  const setBestStreak = setBestStreakProp || setBestStreakLocal

  const inputRef = useRef<HTMLInputElement>(null)
  const textLengthRef = useRef(0)

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

  const handleStart = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS)
    setStartTime(Date.now())

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          setIsActive(true)
          inputRef.current?.focus({ preventScroll: true })
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleMistake = useCallback(() => {
    setIsActive(false)

    const correct = calculateCorrectCount(inputResults)
    const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0
    const errors = inputResults.length + 1 - correct + 1

    const stats = calculateStats(correct, inputResults.length + 1, errors, timeElapsed)
    onComplete(stats)
  }, [inputResults, startTime, calculateCorrectCount, onComplete])

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (!isActive && countdown === null) {
      handleStart()
      return
    }

    const value = e.currentTarget.value
    const newChar = value[value.length - 1]
    if (!newChar) return

    if (currentIndex < textLengthRef.current) {
      const expectedChar = text[currentIndex]
      const isCorrect = newChar === expectedChar

      if (!isCorrect) {
        if (sound) sound.playError()
        handleMistake()
        return
      }

      if (sound) sound.playCorrect(expectedChar.toLowerCase())

      setStreak(prev => prev + 1)

      setInputResults(prev => {
        const newResults = [...prev, { isCorrect: true, char: newChar }]

        if (currentIndex >= textLengthRef.current - 1) {
          generateNewText()
        }

        return newResults
      })

      setCurrentIndex(prev => prev + 1)
    }

    e.currentTarget.value = ''
  }, [isActive, countdown, text, currentIndex, sound, handleMistake, generateNewText, handleStart])

  const resetGame = useCallback(() => {
    setStreak(0)
    setBestStreak?.(prev => Math.max(prev, streak))
    generateNewText()
    setIsActive(false)
    setCountdown(null)
    setStartTime(null)
    setInputResults([])
    setCurrentIndex(0)
  }, [streak, generateNewText, setBestStreak])

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
