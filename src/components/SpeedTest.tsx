import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { TypingStats } from '../types'
import { generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from '../hooks/useTypingSound'

type TestDuration = 15 | 30 | 60

interface SpeedTestProps {
  duration: TestDuration
  onExit: () => void
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
}

export function SpeedTest({ duration, onExit, onComplete, sound }: SpeedTestProps) {
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<Array<{ isCorrect: boolean; char: string }>>([])
  const [timeLeft, setTimeLeft] = useState<number>(duration)
  const [isActive, setIsActive] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Генерация текста
  const generateNewText = useCallback(() => {
    const newText = generatePracticeText(100, 5)
    setText(newText)
    setCurrentIndex(0)
    setInputResults([])
  }, [])

  useEffect(() => {
    generateNewText()
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [generateNewText])

  // Таймер
  useEffect(() => {
    let interval: number | null = null

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            setIsActive(false)
            handleFinish()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) window.clearInterval(interval)
    }
  }, [isActive])

  // Старт при первом нажатии
  const handleStart = () => {
    setIsActive(true)
    inputRef.current?.focus()
  }

  // Обработка ввода
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (!isActive && timeLeft === duration) {
      handleStart()
    }

    const value = e.currentTarget.value
    const newChar = value[value.length - 1]
    
    if (newChar && currentIndex < text.length) {
      const expectedChar = text[currentIndex]
      const isCorrect = newChar === expectedChar
      
      if (sound) {
        isCorrect ? sound.playCorrect() : sound.playError()
      }
      
      setInputResults(prev => [...prev, { isCorrect, char: newChar }])
      setCurrentIndex(prev => prev + 1)
      
      // Если текст заканчивается, генерируем новый
      if (currentIndex >= text.length - 10) {
        generateNewText()
      }
    }
    
    e.currentTarget.value = ''
  }, [isActive, timeLeft, text, currentIndex, sound, generateNewText, duration])

  // Подсчёт статистики в реальном времени
  useEffect(() => {
    if (inputResults.length > 0) {
      const correct = inputResults.filter(r => r.isCorrect).length
      const timeElapsed = duration - timeLeft
      const timeInMinutes = timeElapsed / 60
      
      const newWpm = timeInMinutes > 0 ? Math.round(correct / 5 / timeInMinutes) : 0
      const newAccuracy = Math.round((correct / inputResults.length) * 100)
      
      setWpm(newWpm)
      setAccuracy(newAccuracy)
    }
  }, [inputResults, timeLeft, duration])

  // Завершение
  const handleFinish = () => {
    const correct = inputResults.filter(r => r.isCorrect).length
    const timeElapsed = duration - timeLeft
    const errors = inputResults.filter(r => !r.isCorrect).length
    
    const stats = calculateStats(correct, inputResults.length, errors, timeElapsed)
    onComplete(stats)
  }

  // Пропуск текста
  const handleSkip = () => {
    generateNewText()
    inputRef.current?.focus()
  }

  // Прогресс времени
  const timeProgress = ((duration - timeLeft) / duration) * 100

  // Определение цвета таймера
  const timerColor = timeLeft <= 5 ? 'text-error' : timeLeft <= 10 ? 'text-yellow-400' : 'text-primary-400'

  return (
    <div className="glass rounded-xl p-6 relative overflow-hidden">
      {/* Фон с прогрессом */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000"
        style={{ width: `${timeProgress}%` }}
      />
      
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Тест скорости</h2>
          <p className="text-sm text-dark-400">{duration} секунд на максимум</p>
        </div>
        
        <button
          onClick={onExit}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          title="Выйти"
        >
          <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Таймер */}
      <div className="text-center mb-6">
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-6xl font-bold font-mono ${timerColor} ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
        >
          {timeLeft}s
        </motion.div>
      </div>

      {/* Статистика в реальном времени */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">WPM</p>
          <p className="text-3xl font-bold text-primary-400">{wpm}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">Точность</p>
          <p className={`text-3xl font-bold ${accuracy >= 95 ? 'text-success' : accuracy >= 85 ? 'text-yellow-400' : 'text-error'}`}>
            {accuracy}%
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">Символы</p>
          <p className="text-3xl font-bold text-dark-300">{currentIndex}</p>
        </div>
      </div>

      {/* Область ввода */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="bg-dark-800/50 rounded-xl p-6 cursor-text min-h-[120px] relative mb-4"
      >
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute"
          onInput={handleInput}
          disabled={timeLeft === 0}
        />
        
        <div className="font-mono text-lg leading-relaxed break-words">
          {text.split('').map((char, index) => {
            let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
            
            if (index < currentIndex) {
              status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
            } else if (index === currentIndex && isActive) {
              status = 'current'
            }
            
            return (
              <span
                key={index}
                className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded transition-all duration-100 ${
                  status === 'correct' ? 'bg-green-500/20 text-green-500' :
                  status === 'incorrect' ? 'bg-red-500/20 text-red-500' :
                  status === 'current' ? 'bg-violet-500/30 text-violet-500 border-2 border-violet-500 animate-pulse' :
                  'text-dark-500'
                }`}
              >
                {char}
              </span>
            )
          })}
        </div>

        {/* Оверлей старта */}
        {!isActive && timeLeft === duration && (
          <div className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <p className="text-lg text-dark-300 mb-4">Начните печатать для старта</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
              >
                Начать тест
              </button>
            </div>
          </div>
        )}

        {/* Оверлей завершения */}
        {timeLeft === 0 && (
          <div className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center">
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
              <h3 className="text-2xl font-bold mb-2">Тест завершён!</h3>
              <div className="grid grid-cols-2 gap-4 mb-6 max-w-xs mx-auto">
                <div className="bg-dark-800 rounded-lg p-3">
                  <p className="text-sm text-dark-400">WPM</p>
                  <p className="text-2xl font-bold text-primary-400">{wpm}</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-3">
                  <p className="text-sm text-dark-400">Точность</p>
                  <p className="text-2xl font-bold text-success">{accuracy}%</p>
                </div>
              </div>
              <button
                onClick={onExit}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
              >
                Продолжить
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Кнопка пропуска */}
      {isActive && (
        <div className="flex justify-center">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-dark-400 hover:text-white transition-colors text-sm"
          >
            Пропустить текст
          </button>
        </div>
      )}
    </div>
  )
}
