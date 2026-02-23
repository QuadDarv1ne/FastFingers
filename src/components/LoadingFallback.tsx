interface LoadingFallbackProps {
  message?: string
}

export function LoadingFallback({ message = 'Загрузка...' }: LoadingFallbackProps) {
  return (
    <div className="min-h-[400px] bg-dark-900/50 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark-400">{message}</p>
      </div>
    </div>
  )
}
