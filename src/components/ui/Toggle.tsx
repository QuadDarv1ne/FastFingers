import { memo } from 'react'

export interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const Toggle = memo<ToggleProps>(function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-dark-400">{label}</span>
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
        className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-dark-700'}`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
})
