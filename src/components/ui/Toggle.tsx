import { memo } from 'react'
import { motion } from 'framer-motion'

export interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const Toggle = memo<ToggleProps>(function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-dark-400">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onChange(!checked)
          }
        }}
        className={`relative w-9 h-5 rounded-full transition-all duration-200 ${checked ? 'bg-primary-600 shadow-sm shadow-primary-500/30' : 'bg-dark-700'}`}
      >
        <motion.div
          className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-0.5`}
          animate={{ left: checked ? '18px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
})
