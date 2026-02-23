import { memo } from 'react'

interface HeaderProps {
  level: number
  xp: number
  xpToNextLevel: number
  onProfileClick?: () => void
}

export const Header = memo(function Header({ level, xp, xpToNextLevel, onProfileClick }: HeaderProps) {
  const progress = ((xp / xpToNextLevel) * 100).toFixed(0)

  return (
    <header className="glass border-b border-dark-700 sticky top-0 z-30 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient tracking-tight">FastFingers</h1>
              <p className="text-xs text-dark-400 font-medium">Тренажёр слепой печати</p>
            </div>
          </div>

          {/* Уровень и XP */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-3xl font-bold text-gradient">#{level}</span>
                <span className="text-sm text-dark-400 font-medium">уровень</span>
              </div>
              <div className="w-40 h-2.5 bg-dark-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 progress-bar shadow-glow"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-dark-500 mt-1.5 font-medium">{xp} / {xpToNextLevel} XP ({progress}%)</p>
            </div>
            
            {/* Мобильная версия уровня */}
            <div className="sm:hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-gradient">#{level}</span>
              </div>
              <div className="w-20 h-1.5 bg-dark-800 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-400 progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Кнопка профиля */}
            {onProfileClick && (
              <button
                onClick={onProfileClick}
                className="w-11 h-11 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30"
                title="Профиль"
                aria-label="Открыть профиль"
              >
                <span className="text-xl">👤</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
})
