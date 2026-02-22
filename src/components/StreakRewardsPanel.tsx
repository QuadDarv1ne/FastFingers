import { motion } from 'framer-motion'

interface StreakReward {
  days: number
  xpBonus: number
  icon: string
  title: string
  description: string
}

const streakRewards: StreakReward[] = [
  { days: 3, xpBonus: 50, icon: '🥉', title: 'Бронзовый', description: '+50 XP бонус' },
  { days: 7, xpBonus: 150, icon: '🥈', title: 'Серебряный', description: '+150 XP бонус' },
  { days: 14, xpBonus: 400, icon: '🥇', title: 'Золотой', description: '+400 XP бонус' },
  { days: 30, xpBonus: 1000, icon: '💎', title: 'Алмазный', description: '+1000 XP бонус' },
  { days: 60, xpBonus: 2500, icon: '👑', title: 'Королевский', description: '+2500 XP бонус' },
  { days: 100, xpBonus: 5000, icon: '🌟', title: 'Легендарный', description: '+5000 XP бонус' },
]

interface StreakRewardsProps {
  currentStreak: number
  onClose: () => void
}

export function StreakRewardsPanel({ currentStreak, onClose }: StreakRewardsProps) {
  const currentReward = streakRewards.filter(r => r.days <= currentStreak).pop()
  const nextReward = streakRewards.find(r => r.days > currentStreak)
  const progressToNext = nextReward 
    ? ((currentStreak - (streakRewards[streakRewards.indexOf(nextReward) - 1]?.days || 0)) / (nextReward.days - (streakRewards[streakRewards.indexOf(nextReward) - 1]?.days || 0))) * 100
    : 100

  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl my-8"
      >
        <div className="glass rounded-2xl p-6 md:p-8">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span>🔥</span>
                Награды за серию
              </h2>
              <p className="text-dark-400 mt-1">
                Тренируйся каждый день и получай бонусы!
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Текущая награда */}
          {currentReward && (
            <div className="mb-8 p-6 bg-gradient-to-br from-primary-600/20 to-purple-600/20 border border-primary-500/50 rounded-xl">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="text-6xl"
                >
                  {currentReward.icon}
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm text-dark-400">Текущий статус</p>
                  <h3 className="text-2xl font-bold">{currentReward.title}</h3>
                  <p className="text-primary-400">{currentReward.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-dark-400">Серия</p>
                  <p className="text-4xl font-bold text-orange-400">{currentStreak}</p>
                  <p className="text-sm text-dark-500">дней</p>
                </div>
              </div>
            </div>
          )}

          {/* Прогресс до следующей награды */}
          {nextReward && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">До следующей награды</span>
                <span className="text-sm text-dark-400">
                  {nextReward.days - currentStreak} дн.
                </span>
              </div>
              <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{nextReward.icon}</span>
                <div>
                  <p className="text-sm font-medium">{nextReward.title}</p>
                  <p className="text-xs text-dark-500">{nextReward.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Все награды */}
          <h3 className="text-lg font-semibold mb-4">Все награды</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {streakRewards.map((reward, index) => {
              const isUnlocked = currentStreak >= reward.days
              const isNext = nextReward?.days === reward.days
              
              return (
                <motion.div
                  key={reward.days}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-primary-600/20 to-purple-600/20 border-primary-500/50'
                      : isNext
                      ? 'bg-dark-800/50 border-orange-500/50 ring-1 ring-orange-500/50'
                      : 'bg-dark-800/30 border-dark-700 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {reward.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${isUnlocked ? 'text-white' : 'text-dark-500'}`}>
                          {reward.title}
                        </p>
                        {isUnlocked && (
                          <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-dark-400">{reward.days} дней</p>
                      <p className={`text-xs ${isUnlocked ? 'text-yellow-400' : 'text-dark-600'}`}>
                        {reward.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Информация */}
          <div className="mt-6 p-4 bg-dark-800/50 rounded-lg">
            <p className="text-sm text-dark-400">
              <strong>💡 Как это работает:</strong> Тренируйся каждый день, чтобы поддерживать серию. 
              Бонус XP добавляется автоматически после каждой тренировки при достижении порога серии.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Хук для расчёта бонуса XP за серию
export function calculateStreakXpBonus(streak: number): number {
  const reward = streakRewards.filter(r => r.days <= streak).pop()
  return reward ? reward.xpBonus : 0
}
