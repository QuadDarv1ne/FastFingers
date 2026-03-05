import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReactionGameProps {
  onExit: () => void
  onComplete: (score: number, accuracy: number) => void
}

interface KeyTarget {
  key: string
  x: number
  y: number
  id: number
}

const GAME_DURATION = 30
const KEY_ROWS = [
  ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
  ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
  ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.'],
]

export function ReactionGame({ onExit, onComplete }: ReactionGameProps) {
  const [targets, setTargets] = useState<KeyTarget[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isPlaying, setIsPlaying] = useState(false)
  const [missed, setMissed] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const targetIdRef = useRef(0)

  // Генерация случайной позиции
  const getRandomPosition = useCallback(() => {
    const rowIndex = Math.floor(Math.random() * KEY_ROWS.length)
    const row = KEY_ROWS[rowIndex]
    if (!row) return { key: 'a', x: 0, y: 0, id: targetIdRef.current++ }
    const keyIndex = Math.floor(Math.random() * row.length)
    const key = row[keyIndex]

    if (!key) return { key: 'a', x: 0, y: 0, id: targetIdRef.current++ }

    return {
      key,
      x: (keyIndex / 12) * 100,
      y: (rowIndex / 3) * 100,
      id: targetIdRef.current++,
    }
  }, [])

  // Создание новой цели
  const spawnTarget = useCallback(() => {
    const newTarget = getRandomPosition()
    setTargets(prev => [...prev, newTarget])
    
    // Цель исчезает через 1.5 секунды
    setTimeout(() => {
      setTargets(prev => {
        const exists = prev.find(t => t.id === newTarget.id)
        if (exists && isPlaying) {
          setMissed(m => m + 1)
          setCombo(0)
        }
        return prev.filter(t => t.id !== newTarget.id)
      })
    }, 1500)
  }, [getRandomPosition, isPlaying])

  // Игровой цикл
  useEffect(() => {
    if (!isPlaying) return

    const gameInterval = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          setIsPlaying(false)
          onComplete(score, Math.round((score / (score + missed)) * 100) || 0)
          return 0
        }
        return time - 1
      })
    }, 1000)

    const spawnInterval = setInterval(() => {
      if (targets.length < 3) {
        spawnTarget()
      }
    }, 800)

    return () => {
      clearInterval(gameInterval)
      clearInterval(spawnInterval)
    }
  }, [isPlaying, targets.length, spawnTarget, score, missed, onComplete])

  // Старт игры
  const handleStart = () => {
    setIsPlaying(true)
    setScore(0)
    setMissed(0)
    setCombo(0)
    setMaxCombo(0)
    setTimeLeft(GAME_DURATION)
    setTargets([])
    spawnTarget()
  }

  // Клик по цели
  const handleTargetClick = useCallback((id: number) => {
    if (!isPlaying) return

    setTargets(prev => prev.filter(t => t.id !== id))
    setScore(s => s + 10 + combo)
    setCombo(c => {
      const newCombo = c + 1
      setMaxCombo(m => Math.max(m, newCombo))
      return newCombo
    })
  }, [isPlaying, combo])

  // Обработка клавиатуры
  useEffect(() => {
    if (!isPlaying) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const targetIndex = targets.findIndex(t => t.key === key)

      if (targetIndex !== -1) {
        const target = targets[targetIndex]
        if (target) {
          handleTargetClick(target.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, targets, handleTargetClick])

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="fixed inset-0 bg-dark-900 z-50 flex flex-col">
      {/* Верхняя панель */}
      <div className="glass border-b border-dark-700 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>⚡</span>
              Игра на реакцию
            </h2>
            <p className="text-sm text-dark-400">Нажимайте клавиши, когда они появляются</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-dark-400">Счёт</p>
              <p className="text-2xl font-bold text-primary-400">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-dark-400">Комбо</p>
              <p className={`text-2xl font-bold ${combo >= 5 ? 'text-yellow-400' : 'text-dark-300'}`}>
                x{combo}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-dark-400">Время</p>
              <p className={`text-2xl font-bold font-mono ${timeLeft <= 5 ? 'text-error' : 'text-dark-300'}`}>
                {timeLeft}s
              </p>
            </div>
            <button
              onClick={onExit}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Прогресс бар времени */}
        <div className="mt-4 h-1 bg-dark-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-600 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Игровая зона */}
      <div ref={gameAreaRef} className="flex-1 relative overflow-hidden">
        {/* Сетка клавиатуры (фон) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="space-y-2">
            {KEY_ROWS.map((row, i) => (
              <div key={i} className="flex gap-1" style={{ paddingLeft: `${i * 8}px` }}>
                {row.map((key, j) => (
                  <div
                    key={j}
                    className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-dark-500 text-sm font-mono"
                  >
                    {key.toUpperCase()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Цели */}
        <AnimatePresence>
          {targets.map(target => (
            <motion.button
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500 }}
              className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 
                         flex items-center justify-center text-2xl font-bold text-white shadow-lg 
                         shadow-primary-500/50 border-4 border-white/20
                         hover:scale-110 active:scale-95 transition-transform"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => handleTargetClick(target.id)}
            >
              {target.key.toUpperCase()}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Оверлей старта */}
        {!isPlaying && timeLeft === GAME_DURATION && (
          <div className="absolute inset-0 bg-dark-900/90 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full 
                           flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-5xl">⚡</span>
              </motion.div>
              
              <h3 className="text-3xl font-bold mb-4">Игра на реакцию</h3>
              <p className="text-dark-400 mb-6">
                На экране будут появляться буквы. Нажимайте соответствующие клавиши 
                как можно быстрее!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">Попал</p>
                  <p className="text-2xl font-bold text-success">+10 XP</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">Комбо</p>
                  <p className="text-2xl font-bold text-yellow-400">+1 за серию</p>
                </div>
              </div>
              
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl 
                           font-bold text-lg transition-colors shadow-lg shadow-primary-500/30"
              >
                Начать игру
              </button>
            </div>
          </div>
        )}

        {/* Оверлей завершения */}
        {!isPlaying && timeLeft === 0 && (
          <div className="absolute inset-0 bg-dark-900/90 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-success/20 to-success/10 rounded-full 
                           flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-5xl">🎉</span>
              </motion.div>
              
              <h3 className="text-3xl font-bold mb-6">Игра завершена!</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">Счёт</p>
                  <p className="text-3xl font-bold text-primary-400">{score}</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">Точность</p>
                  <p className="text-3xl font-bold text-success">
                    {Math.round((score / (score + missed * 10)) * 100) || 0}%
                  </p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">Промахи</p>
                  <p className="text-3xl font-bold text-error">{missed}</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">Макс. комбо</p>
                  <p className="text-3xl font-bold text-yellow-400">{maxCombo}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onExit}
                  className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
                >
                  Меню
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                >
                  Играть снова
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="glass border-t border-dark-700 p-4">
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <span className="text-dark-400">Попал: </span>
            <span className="text-success font-bold">{Math.floor(score / 10)}</span>
          </div>
          <div className="text-center">
            <span className="text-dark-400">Промах: </span>
            <span className="text-error font-bold">{missed}</span>
          </div>
          <div className="text-center">
            <span className="text-dark-400">Комбо: </span>
            <span className="text-yellow-400 font-bold">x{combo}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
