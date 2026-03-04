import { useState } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'

export interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: 'wpm' | 'accuracy' | 'words' | 'sessions' | 'streak'
  icon: string
  completed: boolean
  createdAt: string
  completedAt?: string
}

interface GoalsPanelProps {
  onClose: () => void
  currentProgress: {
    wpm: number
    accuracy: number
    totalWords: number
    totalSessions: number
    streak: number
  }
}

const DEFAULT_GOALS: Omit<Goal, 'id' | 'current' | 'completed' | 'createdAt'>[] = [
  {
    title: 'Новичок',
    description: 'Достичь скорости 20 WPM',
    target: 20,
    unit: 'wpm',
    icon: '🌱',
  },
  {
    title: 'Уверенный старт',
    description: 'Достичь скорости 40 WPM',
    target: 40,
    unit: 'wpm',
    icon: '🚀',
  },
  {
    title: 'Профессионал',
    description: 'Достичь скорости 60 WPM',
    target: 60,
    unit: 'wpm',
    icon: '⚡',
  },
  {
    title: 'Мастер точности',
    description: 'Достичь 95% точности',
    target: 95,
    unit: 'accuracy',
    icon: '🎯',
  },
  {
    title: 'Словарный запас',
    description: 'Напечатать 5000 слов',
    target: 5000,
    unit: 'words',
    icon: '📚',
  },
  {
    title: 'Постоянство',
    description: 'Серия в 7 дней',
    target: 7,
    unit: 'streak',
    icon: '🔥',
  },
]

export function GoalsPanel({ onClose, currentProgress }: GoalsPanelProps) {
  const [goals, setGoals] = useLocalStorageState<Goal[]>('fastfingers_goals', [])
  const [showAddGoal, setShowAddGoal] = useState(false)

  // Инициализация целей по умолчанию
  if (goals.length === 0) {
    const initialGoals: Goal[] = DEFAULT_GOALS.map((goal, index) => ({
      ...goal,
      id: `goal-${Date.now()}-${index}`,
      current: getCurrentValue(goal.unit, currentProgress),
      completed: false,
      createdAt: new Date().toISOString(),
    }))
    setGoals(initialGoals)
  }

  // Обновление прогресса целей
  const updateGoalsProgress = () => {
    const updatedGoals = goals.map(goal => {
      const current = getCurrentValue(goal.unit, currentProgress)
      const wasCompleted = goal.completed
      const isCompleted = current >= goal.target

      return {
        ...goal,
        current,
        completed: isCompleted,
        completedAt: !wasCompleted && isCompleted ? new Date().toISOString() : goal.completedAt,
      }
    })
    setGoals(updatedGoals)
  }

  // Вызываем обновление при изменении прогресса
  useState(() => {
    updateGoalsProgress()
  })

  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  const handleAddGoal = (newGoal: Omit<Goal, 'id' | 'current' | 'completed' | 'createdAt'>) => {
    const goal: Goal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      current: getCurrentValue(newGoal.unit, currentProgress),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setGoals([...goals, goal])
    setShowAddGoal(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🎯</span>
              Цели и достижения
            </h2>
            <p className="text-dark-400 text-sm mt-1">
              Ставьте цели и отслеживайте прогресс
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
            aria-label="Закрыть"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Активных"
              value={activeGoals.length}
              icon="🎯"
              color="text-primary-400"
            />
            <StatCard
              label="Выполнено"
              value={completedGoals.length}
              icon="✅"
              color="text-green-400"
            />
            <StatCard
              label="Всего"
              value={goals.length}
              icon="📊"
              color="text-blue-400"
            />
            <StatCard
              label="Прогресс"
              value={`${goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%`}
              icon="📈"
              color="text-yellow-400"
            />
          </div>

          {/* Активные цели */}
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🎯</span>
                Активные цели
              </h3>
              <div className="space-y-3">
                {activeGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}

          {/* Выполненные цели */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>✅</span>
                Выполненные цели
              </h3>
              <div className="space-y-3">
                {completedGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}

          {/* Пустое состояние */}
          {goals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Нет целей</h3>
              <p className="text-dark-400 mb-6">
                Создайте свою первую цель для отслеживания прогресса
              </p>
              <button
                onClick={() => setShowAddGoal(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all"
              >
                Создать цель
              </button>
            </div>
          )}

          {/* Кнопка добавления цели */}
          {goals.length > 0 && (
            <button
              onClick={() => setShowAddGoal(true)}
              className="w-full py-3 bg-dark-800 hover:bg-dark-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить цель
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно добавления цели */}
      {showAddGoal && (
        <AddGoalModal
          onClose={() => setShowAddGoal(false)}
          onAdd={handleAddGoal}
        />
      )}
    </div>
  )
}

function GoalCard({ goal }: { goal: Goal }) {
  const progress = Math.min((goal.current / goal.target) * 100, 100)
  const unitLabel = getUnitLabel(goal.unit)

  return (
    <div
      className={`card p-4 ${goal.completed ? 'border border-green-500/30 bg-green-500/5' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            goal.completed
              ? 'bg-green-500/20'
              : 'bg-gradient-to-br from-primary-500/20 to-primary-700/20'
          }`}
        >
          {goal.icon}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-white">{goal.title}</h4>
              <p className="text-sm text-dark-400">{goal.description}</p>
            </div>
            {goal.completed && (
              <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Выполнено
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Прогресс</span>
              <span className="font-semibold">
                {goal.current} / {goal.target} {unitLabel}
              </span>
            </div>
            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  goal.completed
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500'
                    : 'bg-gradient-to-r from-primary-600 to-primary-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-dark-500 text-right">
              {progress.toFixed(1)}%
            </div>
          </div>

          {goal.completedAt && (
            <p className="text-xs text-green-400 mt-2">
              Выполнено {new Date(goal.completedAt).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number | string
  icon: string
  color: string
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-dark-400 font-medium uppercase">
          {label}
        </span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function getCurrentValue(
  unit: Goal['unit'],
  progress: GoalsPanelProps['currentProgress']
): number {
  switch (unit) {
    case 'wpm':
      return progress.wpm
    case 'accuracy':
      return progress.accuracy
    case 'words':
      return progress.totalWords
    case 'sessions':
      return progress.totalSessions
    case 'streak':
      return progress.streak
    default:
      return 0
  }
}

function getUnitLabel(unit: Goal['unit']): string {
  switch (unit) {
    case 'wpm':
      return 'WPM'
    case 'accuracy':
      return '%'
    case 'words':
      return 'слов'
    case 'sessions':
      return 'сессий'
    case 'streak':
      return 'дней'
    default:
      return ''
  }
}

function AddGoalModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (goal: Omit<Goal, 'id' | 'current' | 'completed' | 'createdAt'>) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState<Goal['unit']>('wpm')
  const [icon, setIcon] = useState('🎯')

  const icons = ['🎯', '🚀', '⚡', '🔥', '💪', '🏆', '⭐', '💎', '🎨', '📚']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !target) return

    onAdd({
      title,
      description,
      target: Number(target),
      unit,
      icon,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="glass rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Новая цель</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goal-icon" id="goal-icon-label" className="block text-sm font-medium text-dark-300 mb-2">
              Иконка
            </label>
            <div role="radiogroup" aria-labelledby="goal-icon-label" className="flex gap-2 flex-wrap">
              {icons.map(i => (
                <button
                  key={i}
                  id={`goal-icon-${i}`}
                  type="button"
                  role="radio"
                  aria-checked={icon === i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    icon === i
                      ? 'bg-primary-600 scale-110'
                      : 'bg-dark-800 hover:bg-dark-700'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <input type="hidden" id="goal-icon" value={icon} />
          </div>

          <div>
            <label htmlFor="goal-title" className="block text-sm font-medium text-dark-300 mb-2">
              Название
            </label>
            <input
              id="goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Моя цель"
              required
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="goal-description" className="block text-sm font-medium text-dark-300 mb-2">
              Описание
            </label>
            <input
              id="goal-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание"
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="goal-target" className="block text-sm font-medium text-dark-300 mb-2">
                Цель
              </label>
              <input
                id="goal-target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="100"
                required
                min="1"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="goal-unit" className="block text-sm font-medium text-dark-300 mb-2">
                Единица
              </label>
              <select
                id="goal-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Goal['unit'])}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="wpm">WPM</option>
                <option value="accuracy">Точность %</option>
                <option value="words">Слова</option>
                <option value="sessions">Сессии</option>
                <option value="streak">Серия дней</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-semibold transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-semibold transition-all"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
