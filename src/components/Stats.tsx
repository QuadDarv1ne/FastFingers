import { UserProgress, TypingStats as TypingStatsType } from '../types'
import { formatTime } from '../utils/stats'

interface StatsProps {
  progress: UserProgress
  currentStats: TypingStatsType | null
  onViewHistory?: () => void
  onViewAchievements?: () => void
  challengeStats?: {
    total: number
    completed: number
    completionRate: number
  }
}

export function Stats({ progress, currentStats, onViewHistory, onViewAchievements, challengeStats }: StatsProps) {
  return (
    <div className="space-y-4">
      {/* Текущая сессия */}
      {currentStats && (
        <div className="glass rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Последняя сессия
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="WPM" value={currentStats.wpm.toString()} color="text-primary-400" />
            <StatCard label="CPM" value={currentStats.cpm.toString()} color="text-primary-400" />
            <StatCard label="Точность" value={`${currentStats.accuracy}%`} color={currentStats.accuracy >= 95 ? 'text-success' : currentStats.accuracy >= 80 ? 'text-yellow-400' : 'text-error'} />
            <StatCard label="Ошибки" value={currentStats.errors.toString()} color={currentStats.errors === 0 ? 'text-success' : 'text-error'} />
            <StatCard label="Время" value={formatTime(currentStats.timeElapsed)} color="text-dark-300" />
            <StatCard label="Символы" value={`${currentStats.correctChars}/${currentStats.totalChars}`} color="text-dark-300" />
          </div>
        </div>
      )}
      
      {/* Общий прогресс */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Прогресс
        </h3>
        
        <div className="space-y-4">
          <StatCard label="Лучший WPM" value={progress.bestWpm.toString()} color="text-primary-400" large />
          <StatCard label="Лучшая точность" value={`${progress.bestAccuracy}%`} color="text-success" large />
          <StatCard label="Всего слов" value={progress.totalWordsTyped.toLocaleString()} color="text-dark-300" large />
          
          <div className="pt-4 border-t border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-400">Уровень {progress.level}</span>
              <span className="text-sm text-dark-400">{progress.xp} XP</span>
            </div>
            <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-600 to-primary-400 progress-bar"
                style={{ width: `${(progress.xp / progress.xpToNextLevel) * 100}%` }}
              />
            </div>
            <p className="text-xs text-dark-500 mt-1">{progress.xpToNextLevel - progress.xp} XP до следующего уровня</p>
          </div>
        </div>
      </div>
      
      {/* Достижения */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Достижения
        </h3>
        
        <div className="space-y-2">
          <AchievementBadge 
            icon="🚀" 
            title="Первые шаги" 
            description="WPM 10+" 
            unlocked={progress.bestWpm >= 10} 
          />
          <AchievementBadge 
            icon="⚡" 
            title="Скоростной демон" 
            description="WPM 40+" 
            unlocked={progress.bestWpm >= 40} 
          />
          <AchievementBadge 
            icon="🎯" 
            title="Мастер точности" 
            description="95% точности" 
            unlocked={progress.bestAccuracy >= 95} 
          />
          <AchievementBadge 
            icon="📚" 
            title="Словарь" 
            description="1000 слов" 
            unlocked={progress.totalWordsTyped >= 1000} 
          />
        </div>
      </div>

      {/* Статистика челленджей */}
      {challengeStats && challengeStats.total > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Челленджи
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-400">Выполнено</span>
              <span className="text-lg font-bold text-success">
                {challengeStats.completed} / {challengeStats.total}
              </span>
            </div>
            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success to-emerald-400 progress-bar"
                style={{ width: `${challengeStats.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-dark-500 text-right">
              {challengeStats.completionRate}% успеха
            </p>
          </div>
        </div>
      )}

      {/* Кнопка истории */}
      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          История тренировок
        </button>
      )}

      {/* Кнопка достижений */}
      {onViewAchievements && (
        <button
          onClick={onViewAchievements}
          className="w-full py-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 border border-yellow-600/50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">🏆</span>
          Достижения
        </button>
      )}
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  color = 'text-white',
  large = false 
}: { 
  label: string
  value: string
  color?: string
  large?: boolean
}) {
  return (
    <div className={large ? 'col-span-2' : ''}>
      <p className="text-sm text-dark-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function AchievementBadge({ 
  icon, 
  title, 
  description, 
  unlocked 
}: { 
  icon: string
  title: string
  description: string
  unlocked: boolean
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${unlocked ? 'bg-dark-800' : 'bg-dark-800/50 opacity-50'}`}>
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className={`font-medium ${unlocked ? 'text-white' : 'text-dark-500'}`}>{title}</p>
        <p className="text-xs text-dark-500">{description}</p>
      </div>
      {unlocked && (
        <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  )
}
