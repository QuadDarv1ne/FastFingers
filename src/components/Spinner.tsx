import './Spinner.css'

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'white'
  label?: string
}

export function Spinner({ size = 'medium', color = 'primary', label = 'Загрузка...' }: SpinnerProps) {
  return (
    <div className={`spinner spinner--${size} spinner--${color}`} role="status" aria-label={label}>
      <div className="spinner__circle" />
      {label && <span className="spinner__label">{label}</span>}
    </div>
  )
}
