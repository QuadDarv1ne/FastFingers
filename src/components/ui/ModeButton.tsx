import { memo } from 'react'

export interface ModeButtonProps {
  isActive: boolean
  onClick: () => void
  icon: string
  label: string
  title: string
}

export const ModeButton = memo<ModeButtonProps>(function ModeButton({
  isActive,
  onClick,
  icon,
  label,
  title,
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
        isActive
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
          : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
      }`}
      title={title}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
})
