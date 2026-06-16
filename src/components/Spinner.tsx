import { memo } from 'react'
import { useAppTranslation } from '../i18n/config'
import './Spinner.css'

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'white'
  label?: string
}

function Spinner({ size = 'medium', color = 'primary', label }: SpinnerProps) {
  const { t } = useAppTranslation()
  const ariaLabel = label ?? t('action.loading')
  return (
    <div className={`spinner spinner--${size} spinner--${color}`} role="status" aria-label={ariaLabel}>
      <div className="spinner__circle" />
      {label && <span className="spinner__label">{label}</span>}
    </div>
  )
}

export default memo(Spinner)
