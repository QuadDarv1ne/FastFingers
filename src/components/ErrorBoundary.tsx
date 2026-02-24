import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRetry?: () => void
  resetKeys?: unknown[]
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  key: number
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    key: 0,
  }

  public static getDerivedStateFromError(error: Error): Pick<State, 'hasError' | 'error'> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  public static getDerivedStateFromProps(nextProps: Props, prevState: State): Pick<State, 'hasError' | 'error' | 'errorInfo'> | null {
    if (nextProps.resetKeys && nextProps.resetKeys.length > 0) {
      const keysChanged = prevState.key !== nextProps.resetKeys.length
      if (keysChanged && prevState.hasError) {
        return { hasError: false, error: null, errorInfo: null }
      }
    }
    return null
  }

  public handleRetry = () => {
    this.props.onRetry?.()
    this.setState(prev => ({
      hasError: false,
      error: null,
      errorInfo: null,
      key: prev.key + 1,
    }))
  }

  public resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  public render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
          <div className="glass rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-xl font-semibold mb-2">Упс! Что-то пошло не так</h1>
            <p className="text-dark-400 mb-6">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу или повторить попытку.
            </p>

            {error && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-sm text-dark-500 hover:text-dark-400 mb-2">
                  Показать детали ошибки
                </summary>
                <pre className="text-xs text-red-400 bg-dark-800 rounded-lg p-4 overflow-auto max-h-48">
                  {error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Попробовать снова
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
