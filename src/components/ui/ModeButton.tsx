import { memo } from 'react'
import { motion } from 'framer-motion'

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
    <motion.button
      onClick={onClick}
      aria-pressed={isActive}
      whileHover={!isActive ? { scale: 1.03 } : undefined}
      whileTap={{ scale: 0.95 }}
      className={`relative px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
        isActive
          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
          : 'text-dark-400 hover:text-white hover:bg-dark-700/40'
      }`}
      title={title}
    >
      {isActive && (
        <motion.span
          layoutId="activeNav"
          className="absolute inset-0 bg-primary-600 rounded-[inherit] -z-10"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <span className="text-base leading-none" aria-hidden="true">{icon}</span>
      <span className="hidden sm:inline text-xs">{label}</span>
    </motion.button>
  )
})
