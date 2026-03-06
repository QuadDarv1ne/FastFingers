import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingStats } from '../types'
import { generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from '../hooks/useTypingSound'
import { useHotkey } from '../hooks/useHotkeys'
import { useAuth } from '@hooks/useAuth'
import { supabase } from '../services/supabase'
import { CertificateGenerator } from './CertificateGenerator'

interface HardcoreModeProps {
  onExit: () => void
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
}

const COUNTDOWN_SECONDS = 3

interface HardcoreRecord {
  id: string
  user_id: string
  streak: number
  wpm: number
  accuracy: number
  created_at: string
}

export const HardcoreMode = memo<HardcoreModeProps>(function HardcoreMode({
  onExit,
  onComplete,
  sound,
}: HardcoreModeProps) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputResults, setInputResults] = useState<Array<{ isCorrect: boolean; char: string }>>([])
  const [isActive, setIsActive] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showCertificate, setShowCertificate] = useState(false)
  const [lastStats, setLastStats] = useState<TypingStats | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [records, setRecords] = useState<HardcoreRecord[]>([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(true)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)

  const inputRef = useRef<HTMLInputElement>(null)

  // Загрузка рекордов
  useEffect(() => {
    const loadRecords = async () => {
      if (!user || !supabase) {
        setIsLoadingRecords(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('hardcore_records')
          .select('*')
          .eq('user_id', user.id)
          .order('streak', { ascending: false })
          .limit(10)

        if (error) throw error
        setRecords(data || [])
        if (data && data.length > 0) {
          setBestStreak(data[0].streak)
        }
      } catch (error) {
        console.error('Error loading hardcore records:', error)
      } finally {
        setIsLoadingRecords(false)
      }
    }

    loadRecords()
  }, [user])

  // Генерация текста
  const generateNewText = useCallback(() => {
    const newText = generatePracticeText(30, 5)
    setText(newText)
    setCurrentIndex(0)
    setInputResults([])
  }, [])

  useEffect(() => {
    generateNewText()
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [generateNewText])

  // Старт с обратным отсчётом
  const handleStart = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS)
    setStartTime(Date.now())

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          setIsActive(true)
          inputRef.current?.focus()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Завершение при ошибке
  const handleMistake = useCallback(async () => {
    setIsActive(false)

    const correct = inputResults.filter(r => r.isCorrect).length
    const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0
    const errors = inputResults.filter(r => !r.isCorrect).length + 1 // +1 за текущую ошибку

    const stats = calculateStats(correct, inputResults.length + 1, errors, timeElapsed)
    setLastStats(stats)
    onComplete(stats)

    // Сохранение рекорда
    if (user && streak > 0 && supabase) {
      try {
        await supabase.from('hardcore_records').insert({
          user_id: user.id,
          streak,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
        })
      } catch (error) {
        console.error('Error saving hardcore record:', error)
      }
    }

    setShowCertificate(true)
  }, [inputResults, startTime, onComplete, user, streak])

  // Обработка ввода
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (!isActive) {
      handleStart()
    }

    const value = e.currentTarget.value
    const newChar = value[value.length - 1]

    if (newChar && currentIndex < text.length) {
      const expectedChar = text[currentIndex]
      const isCorrect = newChar === expectedChar

      if (!isCorrect) {
        // МГНОВЕННОЕ ЗАВЕРШЕНИЕ ПРИ ОШИБКЕ
        if (sound) {
          sound.playError()
        }
        handleMistake()
        return
      }

      // Правильное нажатие
      if (sound) {
        sound.playCorrect(expectedChar.toLowerCase())
      }

      setStreak(prev => prev + 1)
      setInputResults(prev => [...prev, { isCorrect: true, char: newChar }])
      setCurrentIndex(prev => prev + 1)

      // Если текст закончился, генерируем новый
      if (currentIndex >= text.length - 5) {
        generateNewText()
      }
    }

    e.currentTarget.value = ''
  }, [isActive, text, currentIndex, sound, generateNewText, handleStart, handleMistake])

  // Подсчёт статистики в реальном времени
  useEffect(() => {
    if (inputResults.length > 0 && startTime) {
      const correct = inputResults.filter(r => r.isCorrect).length
      const timeElapsed = (Date.now() - startTime) / 1000
      const timeInMinutes = timeElapsed / 60

      const newWpm = timeInMinutes > 0 ? Math.round(correct / 5 / timeInMinutes) : 0
      const newAccuracy = Math.round((correct / inputResults.length) * 100)

      setWpm(newWpm)
      setAccuracy(newAccuracy)
    }
  }, [inputResults, startTime])

  // Горячие клавиши
  useHotkey('escape', () => {
    if (countdown === null && !isActive) {
      onExit()
    }
  }, { enabled: true })

  useHotkey('r', () => {
    if (countdown === null && !isActive) {
      handleStart()
    }
  }, { enabled: true })

  // Пропуск текста (без штрафа, но сбрасывает серию)
  const handleSkip = useCallback(() => {
    setStreak(0)
    generateNewText()
    inputRef.current?.focus()
  }, [generateNewText])

  // Прогресс текста
  const textProgress = (currentIndex / text.length) * 100

  return (
    <div className="glass rounded-xl p-8 relative overflow-hidden border-red-500/20">
      {/* Overlay с обратным отсчётом */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-900/90 z-50 flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-9xl font-bold text-red-500"
            >
              {countdown || 'GO'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
            <span>💀</span>
            Без ошибок
          </h2>
          <p className="text-sm text-dark-400">Любая ошибка завершает сессию</p>
        </div>

        <div className="flex items-center gap-2">
          {!isActive && countdown === null && (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-all"
            >
              Старт (R)
            </button>
          )}
          <button
            onClick={onExit}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            title="Выйти (Escape)"
          >
            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Статистика в реальном времени */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-lg p-4 text-center border border-red-500/20">
          <p className="text-sm text-dark-400">Серия</p>
          <p className="text-3xl font-bold text-red-400">{streak}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">WPM</p>
          <p className="text-3xl font-bold text-primary-400">{wpm}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">Точность</p>
          <p className={`text-3xl font-bold ${accuracy >= 95 ? 'text-success' : accuracy >= 80 ? 'text-yellow-400' : 'text-error'}`}>
            {accuracy}%
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">Рекорд</p>
          <p className="text-3xl font-bold text-yellow-400">{bestStreak}</p>
        </div>
      </div>

      {/* Индикатор серии */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 p-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-xl border border-red-500/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-300">🔥 Текущая серия:</span>
            <span className="text-2xl font-bold text-red-400">{streak}</span>
          </div>
          {streak >= 50 && (
            <p className="text-xs text-red-300 mt-2">
              {streak >= 200 ? '👑 Легендарно' : streak >= 100 ? '🏆 Эпично' : '⚡ Потрясающе'}
            </p>
          )}
        </motion.div>
      )}

      {/* Область ввода */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="bg-dark-800/50 rounded-xl p-6 cursor-text min-h-[120px] relative mb-4 border border-red-500/10"
      >
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute"
          onInput={handleInput}
          disabled={!isActive && timeLeft === 0}
          aria-label="Поле ввода режима без ошибок"
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
                  status === 'current' ? 'bg-red-500/30 text-red-500 border-2 border-red-500 animate-pulse' :
                  'text-dark-500'
                }`}
              >
                {char}
              </span>
            )
          })}
        </div>

        {/* Оверлей старта */}
        {!isActive && countdown === null && inputResults.length === 0 && (
          <div className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg text-dark-300 mb-4">Одна ошибка = конец игры</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
              >
                Начать хардкор
              </button>
            </div>
          </div>
        )}

        {/* Прогресс текста */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-dark-400">Прогресс</span>
            <span className="text-red-400 font-bold">{Math.round(textProgress)}%</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${textProgress * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      {isActive && (
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-dark-400 hover:text-white transition-colors text-sm flex items-center gap-2"
            title="Пропустить текст (сбрасывает серию)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Пропустить (сброс серии)
          </button>
          <span className="text-xs text-dark-500">
            Символов: {currentIndex} / {text.length}
          </span>
        </div>
      )}

      {/* Таблица рекордов */}
      <div className="mt-8 p-6 bg-dark-800/50 rounded-xl border border-dark-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🏆</span>
          Ваши рекорды
        </h3>
        
        {isLoadingRecords ? (
          <p className="text-dark-400 text-sm">Загрузка...</p>
        ) : records.length === 0 ? (
          <p className="text-dark-400 text-sm">Пока нет рекордов. Начните игру</p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 5).map((record, index) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-dark-500'}`}>
                    {index + 1}
                  </span>
                  <span className="text-red-400 font-semibold">{record.streak} серия</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-dark-400">
                  <span>{record.wpm} WPM</span>
                  <span>{record.accuracy}%</span>
                  <span className="text-dark-500">
                    {new Date(record.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Сертификат */}
      {showCertificate && lastStats && user && (
        <CertificateGenerator
          user={user}
          wpm={lastStats.wpm}
          accuracy={lastStats.accuracy}
          cpm={lastStats.cpm}
          testType="hardcore"
          streak={streak}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  )
})

// Временная переменная для совместимости
const timeLeft = 0
