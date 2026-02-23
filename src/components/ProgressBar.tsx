import './ProgressBar.css'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showValue?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
}

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  color = 'primary',
  size = 'medium',
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`progress-bar progress-bar--${size}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      {(label || showValue) && (
        <div className="progress-bar__header">
          {label && <span className="progress-bar__label">{label}</span>}
          {showValue && (
            <span className="progress-bar__value">
              {Math.round(value)} / {max}
            </span>
          )}
        </div>
      )}

      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill progress-bar__fill--${color} ${animated ? 'progress-bar__fill--animated' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
