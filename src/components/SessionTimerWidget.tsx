import { useSessionTimer } from '@hooks/useSessionTimer'
import { useNotifications } from '@hooks/useNotifications'

interface SessionTimerWidgetProps {
  isTyping: boolean
  onBreakStart?: () => void
}

export function SessionTimerWidget({
  isTyping,
  onBreakStart,
}: SessionTimerWidgetProps) {
  const { addNotification } = useNotifications()

  const timer = useSessionTimer({
    breakInterval: 600, // 10 минут
    breakDuration: 60, // 1 минута
    onBreakReminder: () => {
      addNotification({
        type: 'info',
        title: 'Время для перерыва',
        message: 'Вы печатаете уже 10 минут. Сделайте небольшой перерыв!',
        icon: '☕',
      })
    },
    enabled: true,
  })

  // Автоматический старт/пауза при печати
  if (isTyping && !timer.isActive) {
    timer.start()
  } else if (!isTyping && timer.isActive) {
    timer.pause()
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span>⏱️</span>
          Таймер сессии
        </h3>
        {timer.isActive && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Активна</span>
          </div>
        )}
      </div>

      {/* Время сессии */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-gradient">
            {timer.formatTime(timer.sessionTime)}
          </span>
          <span className="text-xs text-dark-400">текущая сессия</span>
        </div>
        <div className="text-sm text-dark-400">
          Сегодня: {timer.formatTime(timer.totalTime)}
        </div>
      </div>

      {/* Прогресс до перерыва */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-dark-400">До перерыва</span>
          <span className="font-medium">
            {timer.formatTime(
              Math.max(
                0,
                timer.breakInterval -
                  (timer.lastBreakTime
                    ? timer.totalTime - timer.lastBreakTime
                    : timer.totalTime)
              )
            )}
          </span>
        </div>
        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timer.needsBreak
                ? 'bg-gradient-to-r from-red-600 to-orange-500 animate-pulse'
                : 'bg-gradient-to-r from-primary-600 to-primary-400'
            }`}
            style={{
              width: `${Math.min(
                100,
                ((timer.lastBreakTime
                  ? timer.totalTime - timer.lastBreakTime
                  : timer.totalTime) /
                  timer.breakInterval) *
                  100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Уведомление о перерыве */}
      {timer.needsBreak && (
        <div className="p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg mb-4 animate-scale-in">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xl">☕</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-400">
                Пора отдохнуть!
              </p>
              <p className="text-xs text-dark-300 mt-1">
                Рекомендуем сделать перерыв на {timer.breakDuration} секунд
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                timer.takeBreak()
                onBreakStart?.()
              }}
              className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-xs font-medium transition-colors"
            >
              Сделать перерыв
            </button>
            <button
              onClick={timer.skipBreak}
              className="px-3 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-xs font-medium transition-colors"
            >
              Пропустить
            </button>
          </div>
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex gap-2">
        {!timer.isActive ? (
          <button
            onClick={timer.start}
            className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Старт
          </button>
        ) : (
          <button
            onClick={timer.pause}
            className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Пауза
          </button>
        )}
        <button
          onClick={timer.reset}
          className="px-3 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm font-medium transition-colors"
          title="Сбросить сессию"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Советы */}
      <div className="mt-4 p-3 bg-dark-800/50 rounded-lg">
        <p className="text-xs text-dark-400">
          💡 <span className="font-medium">Совет:</span> Регулярные перерывы
          помогают избежать усталости и улучшают концентрацию.
        </p>
      </div>
    </div>
  )
}
