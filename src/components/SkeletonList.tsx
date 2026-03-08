import { Skeleton } from './Skeleton'

interface SkeletonListProps {
  count?: number
  variant?: 'card' | 'row' | 'stat'
}

export function SkeletonList({ count = 3, variant = 'card' }: SkeletonListProps) {
  if (variant === 'row') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'stat') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 bg-dark-800/30 rounded-xl">
            <Skeleton variant="text" width={80} height={12} className="mb-2" />
            <Skeleton variant="text" width={60} height={24} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4">
          <div className="flex items-start gap-3 mb-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton variant="text" width="70%" height={16} className="mb-2" />
              <Skeleton variant="text" width="100%" height={12} />
            </div>
          </div>
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      ))}
    </div>
  )
}

export default SkeletonList
