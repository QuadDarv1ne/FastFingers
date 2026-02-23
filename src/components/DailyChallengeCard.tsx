import { motion } from 'framer-motion'
import { ChallengeWithProgress, StreakData } from '../types'

interface DailyChallengeCardProps {
  challenge?: ChallengeWithProgress
  streak: StreakData
  onComplete?: (id: string, wpm: number, accuracy: number) => void
}

export function DailyChallengeCard({ challenge, streak }: DailyChallengeCardProps) {
  if (!challenge) return null

  const isCompleted = challenge.completed
  const isSuccessful = challenge.userWpm && challenge.userWpm >= challenge.targetWpm

  return (
    <div className="glass rounded-xl p-6 relative overflow-hidden">
      {/* Фон с градиентом */}
      <div className={`absolute inset-0 opacity-10 ${
        isCompleted 
          ? 'bg-gradient-to-br from-success to-transparent' 
          : 'bg-gradient-to-br from-primary-600 to-transparent'
      }`} />
      
      <div className="relative">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isCompleted 
                ? 'bg-success/20 text-success' 
                : 'bg-primary-600/20 text-primary-400'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">Ежедневный челлендж</h3>
              <p className="text-sm text-dark-400">{challenge.date}</p>
            </div>
          </div>
          
          {/* Награда */}
          <div className="text-right">
            <p className="text-sm text-dark-400">Награда</p>
            <p className="text-xl font-bold text-yellow-400">+{challenge.xpReward} XP</p>
          </div>
        </div>

        {/* Стрик */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-dark-800/50 rounded-lg">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-medium">
              Текущая серия: <span className="text-orange-400">{streak.current} дн.</span>
            </p>
            <p className="text-xs text-dark-500">
              Лучшая: {streak.longest} дн.
            </p>
          </div>
        </div>

        {/* Цели */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-dark-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-dark-400 mb-1">Цель WPM</p>
            <p className="text-2xl font-bold text-primary-400">{challenge.targetWpm}</p>
          </div>
          <div className="bg-dark-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-dark-400 mb-1">Точность</p>
            <p className="text-2xl font-bold text-success">{challenge.targetAccuracy}%</p>
          </div>
        </div>

        {/* Текст для печати */}
        <div className="bg-dark-800/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-dark-300 font-mono leading-relaxed">
            {challenge.text}
          </p>
        </div>

        {/* Результаты пользователя */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg bg-dark-800/50"
          >
            <div className="flex items-center gap-2 mb-2">
              {isSuccessful ? (
                <>
                  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-success font-medium">Челлендж выполнен!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-400 font-medium">Почти получилось!</span>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-dark-400">Ваш WPM:</span>{' '}
                <span className={challenge.userWpm! >= challenge.targetWpm ? 'text-success font-bold' : ''}>
                  {challenge.userWpm}
                </span>
              </div>
              <div>
                <span className="text-dark-400">Точность:</span>{' '}
                <span className={challenge.userAccuracy! >= challenge.targetAccuracy ? 'text-success font-bold' : ''}>
                  {challenge.userAccuracy}%
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Кнопка старта */}
        {!isCompleted && (
          <button
            onClick={() => {
              // Запуск челленджа будет обработан в родительском компоненте
              const event = new CustomEvent('startChallenge', { 
                detail: { 
                  challenge: {
                    id: challenge.id,
                    text: challenge.text,
                    targetWpm: challenge.targetWpm,
                    targetAccuracy: challenge.targetAccuracy,
                  }
                } 
              })
              window.dispatchEvent(event)
            }}
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            aria-label={`Начать челлендж: ${challenge.text.substring(0, 30)}...`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Начать челлендж
          </button>
        )}
      </div>
    </div>
  )
}
