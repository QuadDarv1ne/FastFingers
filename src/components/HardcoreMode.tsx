import { useState, useEffect, useCallback, memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingStats } from '../types'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from '../hooks/useTypingSound'
import { useAuth } from '@hooks/useAuth'
import { supabase } from '../services/supabase'
import { CertificateGenerator } from './CertificateGenerator'
import { useHardcoreMode } from '@hooks/useHardcoreMode'
import { useHotkey } from '../hooks/useHotkeys'

interface HardcoreModeProps {
  onExit: () => void
  onComplete: (stats: TypingStats) => void
  sound?: ReturnType<typeof useTypingSound>
}

interface HardcoreRecord {
  id: string
  user_id: string
  streak: number
  wpm: number
  accuracy: number
  created_at: string
}

interface UserWithMetadata {
  id: string
  name: string
  email: string
  createdAt: string
  stats: any
}

export const HardcoreMode = memo<HardcoreModeProps>(function HardcoreMode({
  onExit,
  onComplete,
  sound,
}: HardcoreModeProps) {
  const { user } = useAuth()
  const [showCertificate, setShowCertificate] = useState(false)
  const [lastStats, setLastStats] = useState<TypingStats | null>(null)
  const [records, setRecords] = useState<HardcoreRecord[]>([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(true)
  const [bestStreak, setBestStreak] = useState(0)

  const {
    text,
    currentIndex,
    inputResults,
    isActive,
    countdown,
    streak,
    startTime,
    inputRef,
    handleInput,
    handleStart,
    resetGame,
  } = useHardcoreMode({ onComplete, sound, setBestStreak })

  useEffect(() => {
    const loadRecords = async () => {
      if (!user || !supabase) {
        setIsLoadingRecords(false)
        return
      }

      try {
        let retries = 3
        while (retries > 0) {
          const { data, error } = await supabase
            .from('hardcore_records')
            .select('*')
            .eq('user_id', user.id)
            .order('streak', { ascending: false })
            .limit(10)

          if (!error) {
            setRecords(data || [])
            if (data && data.length > 0) {
              const firstRecord = data[0]
              if (firstRecord) setBestStreak(firstRecord.streak)
            }
            break
          }
          retries--
          if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)))
        }
      } finally {
        setIsLoadingRecords(false)
      }
    }

    loadRecords()
  }, [user])

  useEffect(() => {
    if (!isActive && inputResults.length > 0 && startTime && user && streak > 0 && supabase) {
      const correct = inputResults.filter(r => r.isCorrect).length
      const timeElapsed = (Date.now() - startTime) / 1000
      const errors = inputResults.length - correct
      const stats = calculateStats(correct, inputResults.length, errors, timeElapsed)
      
      setLastStats(stats)
      onComplete(stats)

      const saveRecord = async () => {
        let retries = 3
        while (retries > 0) {
          const { error } = await (supabase as any).from('hardcore_records').insert({
            user_id: user.id,
            streak,
            wpm: stats.wpm,
            accuracy: stats.accuracy,
          })
          if (!error) break
          retries--
          if (retries > 0) await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      saveRecord().catch(() => {})
      setShowCertificate(true)
    }
  }, [isActive, inputResults, startTime, user, streak, onComplete])

  const { wpm, accuracy } = useMemo(() => {
    if (inputResults.length === 0 || !startTime) return { wpm: 0, accuracy: 0 }
    const correct = inputResults.filter(r => r.isCorrect).length
    const timeInMinutes = (Date.now() - startTime) / 60000
    return {
      wpm: timeInMinutes > 0 ? Math.round(correct / 5 / timeInMinutes) : 0,
      accuracy: inputResults.length > 0 ? Math.round((correct / inputResults.length) * 100) : 0,
    }
  }, [inputResults, startTime])

  useHotkey('escape', () => { if (countdown === null && !isActive) onExit() }, { enabled: true })
  useHotkey('r', () => { if (countdown === null && !isActive) handleStart() }, { enabled: true })

  const handleSkip = useCallback(() => {
    resetGame()
    inputRef.current?.focus({ preventScroll: true })
  }, [resetGame, inputRef])

  const textProgress = text.length > 0 ? (currentIndex / text.length) * 100 : 0

  return (
    <div className="glass rounded-xl p-8 relative overflow-hidden border-red-500/20">
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
            <span>💀</span> Без ошибок
          </h2>
          <p className="text-sm text-dark-400">Любая ошибка завершает сессию</p>
        </div>
        {!isActive && countdown === null && (
          <button onClick={handleStart} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-all">
            Старт (R)
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Серия" value={streak.toString()} icon="🔥" />
        <StatCard label="WPM" value={wpm.toString()} icon="⚡" />
        <StatCard label="Точность" value={`${accuracy}%`} icon="🎯" />
      </div>

      {bestStreak > 0 && (
        <div className="mb-4 p-3 bg-dark-800/50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-dark-400">Лучшая серия</span>
          <span className="text-lg font-bold text-primary-400">{bestStreak} 🔥</span>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.focus({ preventScroll: true }) }}
        role="button"
        tabIndex={0}
        aria-label="Область ввода текста. Нажмите для фокуса"
        className="bg-dark-800/50 rounded-xl p-6 cursor-text min-h-[120px] relative mb-4 border border-red-500/10"
      >
        <input ref={inputRef} type="text" className="opacity-0 absolute" onInput={handleInput} disabled={!isActive} aria-label="Поле ввода режима без ошибок" />
        <div className="font-mono text-lg leading-relaxed break-words">
          {text.split('').map((char, index) => {
            let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
            if (index < currentIndex) status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
            else if (index === currentIndex && isActive) status = 'current'
            return (
              <span
                key={index}
                className={`px-0.5 rounded ${
                  status === 'correct' ? 'bg-green-500/20 text-green-400' :
                  status === 'incorrect' ? 'bg-red-500/20 text-red-400' :
                  status === 'current' ? 'bg-primary-500/30 text-primary-300 animate-pulse' :
                  'text-dark-500'
                }`}
              >
                {char === ' ' ? '␣' : char}
              </span>
            )
          })}
        </div>
      </div>

      <div className="mb-6" role="progressbar" aria-valuenow={currentIndex} aria-valuemin={0} aria-valuemax={text.length} aria-label="Прогресс">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-dark-400">Прогресс</span>
          <span className="text-primary-400 font-bold">{Math.round(textProgress)}%</span>
        </div>
        <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400" initial={{ width: 0 }} animate={{ width: `${textProgress}%` }} transition={{ duration: 0.2 }} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={handleSkip} className="px-4 py-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all text-sm font-medium flex items-center gap-2" aria-label="Пропустить">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          Пропустить
        </button>
        <button onClick={onExit} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm font-medium transition-all">Выйти</button>
      </div>

      {isLoadingRecords && <div className="mt-6 text-center text-dark-400 text-sm">Загрузка рекордов...</div>}
      
      {!isLoadingRecords && records.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-dark-300">🏆 Ваши рекорды</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {records.slice(0, 5).map((record, i) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                <span className="text-sm text-dark-400">#{i + 1}</span>
                <span className="font-bold text-primary-400">{record.streak} 🔥</span>
                <span className="text-xs text-dark-500">{record.wpm} WPM</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCertificate && lastStats && user && (
        <CertificateGenerator
          user={user as unknown as UserWithMetadata}
          wpm={lastStats.wpm}
          accuracy={lastStats.accuracy}
          cpm={lastStats.cpm}
          testType="hardcore"
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  )
})

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-dark-800/50 rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-dark-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )
}
