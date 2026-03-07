import { memo } from 'react'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave'
  className?: string
}

export const Skeleton = memo<SkeletonProps>(function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
}) {
  const baseClasses = 'bg-dark-800 overflow-hidden'
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-sm',
    rounded: 'rounded-lg',
  }
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
  }

  const style: React.CSSProperties = {
    ...(width && { width }),
    ...(height && { height }),
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
})

export default Skeleton
