interface HeaderProps {
  level: number
  xp: number
  xpToNextLevel: number
  onProfileClick?: () => void
}

export function Header({ level, xp, xpToNextLevel, onProfileClick }: HeaderProps) {
  const progress = ((xp / xpToNextLevel) * 100).toFixed(0)

  return (
    <header className="glass border-b border-dark-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">FastFingers</h1>
              <p className="text-xs text-dark-400">Тренажёр слепой печати</p>
            </div>
          </div>
          
          {/* Уровень и XP */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-400">#{level}</span>
                <span className="text-sm text-dark-400">уровень</span>
              </div>
              <div className="w-32 h-2 bg-dark-800 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-400 progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">{xp} / {xpToNextLevel} XP</p>
            </div>
            
            {/* Кнопка профиля */}
            {onProfileClick && (
              <button
                onClick={onProfileClick}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold hover:scale-105 transition-transform"
                title="Профиль"
              >
                👤
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
