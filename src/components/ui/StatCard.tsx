import { memo } from 'react'

export interface StatCardProps {
  label: string
  value: string | number
  icon?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  trend?: string
  highlight?: boolean
  wide?: boolean
  unit?: string
  className?: string
}

export const StatCard = memo<StatCardProps>(function StatCard({
  label,
  value,
  icon,
  color = 'text-white',
  size = 'md',
  trend,
  highlight = false,
  wide = false,
  unit,
  className = '',
}) {
  const sizeClasses = {
    sm: { container: 'p-2.5', icon: 'text-base', label: 'text-[10px]', value: 'text-base' },
    md: { container: 'p-3', icon: 'text-xl', label: 'text-xs', value: 'text-xl' },
    lg: { container: 'p-4', icon: 'text-2xl', label: 'text-xs', value: 'text-2xl' },
  }

  const s = sizeClasses[size]
  const trendColor = trend
    ? trend.startsWith('+')
      ? 'text-success bg-success/20'
      : trend.startsWith('-')
        ? 'text-error bg-error/20'
        : 'text-dark-400 bg-dark-500/20'
    : ''

  const baseClasses = `${wide ? 'col-span-2' : ''} ${s.container} bg-dark-800/25 rounded-lg hover:bg-dark-800/40 transition-colors`
  const highlightClasses = highlight ? 'ring-1 ring-primary-500' : ''
  const displayValue = typeof value === 'number' ? value : value

  return (
    <div className={`${baseClasses} ${highlightClasses} ${className}`} role="listitem">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {icon && <span className={s.icon} aria-hidden="true">{icon}</span>}
          <p className={`${s.label} text-dark-500 font-medium uppercase tracking-wide`}>{label}</p>
        </div>
        {trend && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${trendColor}`}>{trend}</span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <p className={`font-bold ${color} ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'}`} aria-live="polite">
          {displayValue}
        </p>
        {unit && <span className="text-[10px] text-dark-500">{unit}</span>}
      </div>
    </div>
  )
})
