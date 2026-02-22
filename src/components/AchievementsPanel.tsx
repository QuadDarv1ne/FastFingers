import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { UserProgress } from '../types'

interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  category: 'speed' | 'accuracy' | 'dedication' | 'special'
  unlocked: boolean
  progress: number // 0-100
  requirement: string
}

interface AchievementsPanelProps {
  progress: UserProgress
  onClose: () => void
}

export function AchievementsPanel({ progress, onClose }: AchievementsPanelProps) {
  const achievements: Achievement[] = useMemo(() => [
    // Скорость
    {
      id: 'speed-10',
      icon: '🐣',
      title: 'Новичок',
      description: 'Достигните 10 WPM',
      category: 'speed',
      unlocked: progress.bestWpm >= 10,
      progress: Math.min(100, (progress.bestWpm / 10) * 100),
      requirement: '10 WPM',
    },
    {
      id: 'speed-20',
      icon: '🐤',
      title: 'Любитель',
      description: 'Достигните 20 WPM',
      category: 'speed',
      unlocked: progress.bestWpm >= 20,
      progress: Math.min(100, (progress.bestWpm / 20) * 100),
      requirement: '20 WPM',
    },
    {
      id: 'speed-40',
      icon: '🐇',
      title: 'Спринтер',
      description: 'Достигните 40 WPM',
      category: 'speed',
      unlocked: progress.bestWpm >= 40,
      progress: Math.min(100, (progress.bestWpm / 40) * 100),
      requirement: '40 WPM',
    },
    {
      id: 'speed-60',
      icon: '🐆',
      title: 'Молния',
      description: 'Достигните 60 WPM',
      category: 'speed',
      unlocked: progress.bestWpm >= 60,
      progress: Math.min(100, (progress.bestWpm / 60) * 100),
      requirement: '60 WPM',
    },
    {
      id: 'speed-80',
      icon: '⚡',
      title: 'Скоростной демон',
      description: 'Достигните 80 WPM',
      category: 'speed',
      unlocked: progress.bestWpm >= 80,
      progress: Math.min(100, (progress.bestWpm / 80) * 100),
      requirement: '80 WPM',
    },
    {
      id: 'speed-100',
      icon: '🚀',
      title: 'Легенда',
      description: 'Достигните 100 WPM',
      category: 'speed',
      unlocked: progress.bestWpm >= 100,
      progress: Math.min(100, (progress.bestWpm / 100) * 100),
      requirement: '100 WPM',
    },
    
    // Точность
    {
      id: 'acc-80',
      icon: '🎯',
      title: 'Стрелок',
      description: 'Достигните 80% точности',
      category: 'accuracy',
      unlocked: progress.bestAccuracy >= 80,
      progress: Math.min(100, (progress.bestAccuracy / 80) * 100),
      requirement: '80%',
    },
    {
      id: 'acc-90',
      icon: '🏹',
      title: 'Снайпер',
      description: 'Достигните 90% точности',
      category: 'accuracy',
      unlocked: progress.bestAccuracy >= 90,
      progress: Math.min(100, (progress.bestAccuracy / 90) * 100),
      requirement: '90%',
    },
    {
      id: 'acc-95',
      icon: '💎',
      title: 'Перфекционист',
      description: 'Достигните 95% точности',
      category: 'accuracy',
      unlocked: progress.bestAccuracy >= 95,
      progress: Math.min(100, (progress.bestAccuracy / 95) * 100),
      requirement: '95%',
    },
    {
      id: 'acc-100',
      icon: '👑',
      title: 'Безупречный',
      description: 'Достигните 100% точности',
      category: 'accuracy',
      unlocked: progress.bestAccuracy >= 100,
      progress: Math.min(100, progress.bestAccuracy),
      requirement: '100%',
    },
    
    // Преданность
    {
      id: 'words-100',
      icon: '📝',
      title: 'Писатель',
      description: 'Напечатайте 100 слов',
      category: 'dedication',
      unlocked: progress.totalWordsTyped >= 100,
      progress: Math.min(100, (progress.totalWordsTyped / 100) * 100),
      requirement: '100 слов',
    },
    {
      id: 'words-1000',
      icon: '📚',
      title: 'Автор',
      description: 'Напечатайте 1000 слов',
      category: 'dedication',
      unlocked: progress.totalWordsTyped >= 1000,
      progress: Math.min(100, (progress.totalWordsTyped / 1000) * 100),
      requirement: '1000 слов',
    },
    {
      id: 'words-10000',
      icon: '📖',
      title: 'Мастер слова',
      description: 'Напечатайте 10000 слов',
      category: 'dedication',
      unlocked: progress.totalWordsTyped >= 10000,
      progress: Math.min(100, (progress.totalWordsTyped / 10000) * 100),
      requirement: '10000 слов',
    },
    {
      id: 'streak-7',
      icon: '🔥',
      title: 'Недельный стрик',
      description: '7 дней практики подряд',
      category: 'dedication',
      unlocked: progress.streak >= 7,
      progress: Math.min(100, (progress.streak / 7) * 100),
      requirement: '7 дней',
    },
    {
      id: 'streak-30',
      icon: '🌟',
      title: 'Месячный стрик',
      description: '30 дней практики подряд',
      category: 'dedication',
      unlocked: progress.streak >= 30,
      progress: Math.min(100, (progress.streak / 30) * 100),
      requirement: '30 дней',
    },
    
    // Специальные
    {
      id: 'level-5',
      icon: '⭐',
      title: 'Опытный',
      description: 'Достигните 5 уровня',
      category: 'special',
      unlocked: progress.level >= 5,
      progress: Math.min(100, (progress.level / 5) * 100),
      requirement: 'Ур. 5',
    },
    {
      id: 'level-10',
      icon: '🌙',
      title: 'Эксперт',
      description: 'Достигните 10 уровня',
      category: 'special',
      unlocked: progress.level >= 10,
      progress: Math.min(100, (progress.level / 10) * 100),
      requirement: 'Ур. 10',
    },
    {
      id: 'level-20',
      icon: '☀️',
      title: 'Мастер',
      description: 'Достигните 20 уровня',
      category: 'special',
      unlocked: progress.level >= 20,
      progress: Math.min(100, (progress.level / 20) * 100),
      requirement: 'Ур. 20',
    },
  ], [progress])

  const categories = [
    { id: 'all', label: 'Все', icon: '🏆' },
    { id: 'speed', label: 'Скорость', icon: '⚡' },
    { id: 'accuracy', label: 'Точность', icon: '🎯' },
    { id: 'dedication', label: 'Преданность', icon: '💪' },
    { id: 'special', label: 'Особые', icon: '🌟' },
  ]

  const [activeCategory, setActiveCategory] = useState('all')

  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100)

  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl my-8"
      >
        <div className="glass rounded-2xl p-6 md:p-8">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span>🏆</span>
                Достижения
              </h2>
              <p className="text-dark-400 mt-1">
                {unlockedCount} из {totalCount} разблокировано
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

          {/* Прогресс */}
          <div className="mb-6 p-4 bg-dark-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Общий прогресс</span>
              <span className="text-sm font-bold text-primary-400">{completionPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-primary-600 via-purple-500 to-pink-500"
              />
            </div>
          </div>

          {/* Категории */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-400 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Сетка достижений */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
            {filteredAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-primary-600/20 to-purple-600/20 border-primary-500/50'
                    : 'bg-dark-800/50 border-dark-700 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-dark-500'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-dark-400 mt-1">{achievement.description}</p>
                    
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-dark-500">Прогресс</span>
                          <span className="text-dark-400">{Math.round(achievement.progress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {achievement.unlocked && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-success">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Разблокировано
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">{unlockedCount}</p>
              <p className="text-xs text-dark-400">Разблокировано</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dark-300">{totalCount - unlockedCount}</p>
              <p className="text-xs text-dark-400">Осталось</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{completionPercentage}%</p>
              <p className="text-xs text-dark-400">Завершено</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
