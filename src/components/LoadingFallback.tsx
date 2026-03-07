import { Skeleton } from './Skeleton'

interface LoadingFallbackProps {
  message?: string
}

export function LoadingFallback({ message }: LoadingFallbackProps) {
  return (
    <div className="min-h-[400px] card flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <Skeleton variant="circular" width={64} height={64} animation="pulse" />
        </div>
        <Skeleton
          variant="text"
          width={200}
          height={24}
          animation="wave"
          className="mx-auto"
        />
        {message && (
          <p className="text-dark-300 font-medium mt-4">{message}</p>
        )}
      </div>
    </div>
  )
}
