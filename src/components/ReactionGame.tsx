import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppTranslation } from '../i18n/config'
import { useAppStore } from '../stores/useAppStore'
import { layouts } from '../utils/layouts'

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

export const ReactionGame = memo(function ReactionGame({ onExit, onComplete }: ReactionGameProps) {
  const { t } = useAppTranslation()
  const settings = useAppStore()
  const KEY_ROWS = useMemo(
    () => layouts[settings.layout]?.rows ?? layouts.qwerty?.rows ?? [['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['z','x','c','v','b','n','m']],
    [settings.layout]
  )
  const [targets, setTargets] = useState<KeyTarget[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isPlaying, setIsPlaying] = useState(false)
  const [missed, setMissed] = useState(0)
  const [hits, setHits] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const targetIdRef = useRef(0)
  const scoreRef = useRef(score)
  const missedRef = useRef(missed)
  const hitsRef = useRef(hits)
  const targetsRef = useRef(targets)
  const comboRef = useRef(combo)
  const isPlayingRef = useRef(isPlaying)
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const targetTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  // Keep refs in sync
  useEffect(() => {
    scoreRef.current = score
    missedRef.current = missed
    hitsRef.current = hits
    targetsRef.current = targets
    comboRef.current = combo
    isPlayingRef.current = isPlaying
  }, [score, missed, hits, targets, combo, isPlaying])

  // Random position generation
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
  }, [KEY_ROWS])

  // Spawn a new target
  const spawnTarget = useCallback(() => {
    const newTarget = getRandomPosition()
    setTargets(prev => [...prev, newTarget])
    
    // Target disappears after 1.5 seconds
    const timeoutId = setTimeout(() => {
      timeoutIdsRef.current.delete(timeoutId)
      targetTimeoutsRef.current.delete(newTarget.id)
      setTargets(prev => {
        const exists = prev.find(t => t.id === newTarget.id)
        if (exists && isPlayingRef.current) {
          setMissed(m => m + 1)
          setCombo(0)
        }
        return prev.filter(t => t.id !== newTarget.id)
      })
    }, 1500)
    timeoutIdsRef.current.add(timeoutId)
    targetTimeoutsRef.current.set(newTarget.id, timeoutId)
  }, [getRandomPosition])

  // Game loop
  useEffect(() => {
    if (!isPlaying) return

    const gameInterval = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) return 0
        return time - 1
      })
    }, 1000)

    const spawnInterval = setInterval(() => {
      if (targetsRef.current.length < 3) {
        spawnTarget()
      }
    }, 800)

    // Capture refs at subscription time for cleanup
    const timeouts = timeoutIdsRef.current
    const targetTimeouts = targetTimeoutsRef.current

    return () => {
      clearInterval(gameInterval)
      clearInterval(spawnInterval)
      for (const id of timeouts) {
        clearTimeout(id)
      }
      timeouts.clear()
      targetTimeouts.clear()
    }
  }, [isPlaying, spawnTarget])

  // End game when timer reaches zero
  useEffect(() => {
    if (!isPlaying || timeLeft > 0) return

    setIsPlaying(false)
    const totalAttempts = missedRef.current + hitsRef.current
    const accuracy = totalAttempts > 0 ? Math.round((hitsRef.current / totalAttempts) * 100) : 0
    onComplete(scoreRef.current, accuracy)
  }, [isPlaying, timeLeft, onComplete])

  // Start game
  const handleStart = () => {
    setIsPlaying(true)
    setScore(0)
    setMissed(0)
    setHits(0)
    setCombo(0)
    setMaxCombo(0)
    setTimeLeft(GAME_DURATION)
    setTargets([])
    spawnTarget()
  }

  // Target click handler
  const handleTargetClick = useCallback((id: number) => {
    if (!isPlayingRef.current) return

    // Clear the target's expiration timeout
    const timeoutId = targetTimeoutsRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutIdsRef.current.delete(timeoutId)
      targetTimeoutsRef.current.delete(id)
    }

    setTargets(prev => prev.filter(t => t.id !== id))
    setHits(h => h + 1)
    setScore(s => s + 10 + comboRef.current + 1)
    const newCombo = comboRef.current + 1
    setCombo(newCombo)
    setMaxCombo(m => Math.max(m, newCombo))
  }, [])

  // Keyboard handling
  useEffect(() => {
    if (!isPlaying) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const targetIndex = targetsRef.current.findIndex(t => t.key === key)

      if (targetIndex !== -1) {
        const target = targetsRef.current[targetIndex]
        if (target) {
          handleTargetClick(target.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, handleTargetClick])

  // Cleanup timeouts on unmount
  useEffect(() => {
    // Capture refs at subscription time for cleanup
    const timeouts = timeoutIdsRef.current
    const targetTimeouts = targetTimeoutsRef.current

    return () => {
      for (const id of timeouts) {
        clearTimeout(id)
      }
      timeouts.clear()
      targetTimeouts.clear()
    }
  }, [])

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="fixed inset-0 bg-dark-900 z-50 flex flex-col">
      {/* Top bar */}
      <div className="glass border-b border-dark-700 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>⚡</span>
              {t('reaction.title')}
            </h2>
            <p className="text-sm text-dark-400">{t('reaction.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-dark-400">{t('reaction.score')}</p>
              <p className="text-2xl font-bold text-primary-400">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-dark-400">{t('common.combo')}</p>
              <p className={`text-2xl font-bold ${combo >= 5 ? 'text-yellow-400' : 'text-dark-300'}`}>
                x{combo}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-dark-400">{t('common.time')}</p>
              <p className={`text-2xl font-bold font-mono ${timeLeft <= 5 ? 'text-error' : 'text-dark-300'}`}>
                {timeLeft}s
              </p>
            </div>
            <button
              onClick={onExit}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              aria-label={t('action.exit')}
            >
              <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Time progress bar */}
        <div className="mt-4 h-1 bg-dark-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-600 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Game area */}
      <div ref={gameAreaRef} className="flex-1 relative overflow-hidden">
        {/* Keyboard grid (background) */}
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

        {/* Targets */}
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

        {/* Start overlay */}
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
              
              <h3 className="text-3xl font-bold mb-4">{t('reaction.title')}</h3>
              <p className="text-dark-400 mb-6">
                {t('reaction.subtitle')}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">{t('reaction.hits')}</p>
                  <p className="text-2xl font-bold text-success">+10 XP</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">{t('common.combo')}</p>
                  <p className="text-2xl font-bold text-yellow-400">{t('reaction.comboBonus')}</p>
                </div>
              </div>
              
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl 
                           font-bold text-lg transition-colors shadow-lg shadow-primary-500/30"
                aria-label={t('reaction.startGame')}
              >
                {t('reaction.startGame')}
              </button>
            </div>
          </div>
        )}

        {/* Completion overlay */}
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
              
              <h3 className="text-3xl font-bold mb-6">{t('reaction.gameOver')}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">{t('reaction.score')}</p>
                  <p className="text-3xl font-bold text-primary-400">{score}</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">{t('common.accuracy')}</p>
                  <p className="text-3xl font-bold text-success">
                    {hits + missed > 0 ? Math.round((hits / (hits + missed)) * 100) : 0}%
                  </p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">{t('reaction.misses')}</p>
                  <p className="text-3xl font-bold text-error">{missed}</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-400">{t('reaction.maxCombo')}</p>
                  <p className="text-3xl font-bold text-yellow-400">{maxCombo}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onExit}
                  className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
                  aria-label={t('reaction.menu')}
                >
                  {t('reaction.menu')}
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                  aria-label={t('reaction.playAgain')}
                >
                  {t('reaction.playAgain')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="glass border-t border-dark-700 p-4">
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <span className="text-dark-400">{t('reaction.hitsLabel')} </span>
            <span className="text-success font-bold">{hits}</span>
          </div>
          <div className="text-center">
            <span className="text-dark-400">{t('reaction.missesLabel')} </span>
            <span className="text-error font-bold">{missed}</span>
          </div>
          <div className="text-center">
            <span className="text-dark-400">{t('common.combo')}: </span>
            <span className="text-yellow-400 font-bold">x{combo}</span>
          </div>
        </div>
      </div>
    </div>
  )
})
