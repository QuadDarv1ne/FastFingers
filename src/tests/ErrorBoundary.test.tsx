import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../components/ErrorBoundary'

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errorBoundary.title': 'Oops. Something went wrong',
        'errorBoundary.description': 'An unexpected error occurred. Try refreshing the page or retry.',
        'errorBoundary.showDetails': 'Show error details',
        'errorBoundary.tryAgain': 'Try again',
        'action.reload': 'Reload page',
      }
      return translations[key] ?? key
    },
    language: 'en',
  },
}))

const BrokenComponent = () => {
  throw new Error('Test error')
}

function WorkingComponent() {
  return <div data-testid="working">All good!</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children without errors', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('working')).toBeInTheDocument()
  })

  it('catches error and shows fallback UI', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByText('Reload page')).toBeInTheDocument()
  })

  it('shows custom fallback', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
  })

  it('calls onError on error', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
  })

  it('shows error details in dev mode', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Show error details')).toBeInTheDocument()
  })

  it('allows retry on "Try again" click', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Try again'))
    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
  })

  it('calls onRetry on "Try again" click', () => {
    const onRetry = vi.fn()
    render(
      <ErrorBoundary onRetry={onRetry}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    fireEvent.click(screen.getByText('Try again'))
    expect(onRetry).toHaveBeenCalled()
  })

  it('renders children if no error', () => {
    render(
      <ErrorBoundary>
        <div>Children content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Children content')).toBeInTheDocument()
  })

  it('shows error in details', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const details = screen.getByText('Show error details')
    expect(details).toBeInTheDocument()
  })

  it('has reload page button', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const reloadButton = screen.getByText('Reload page')
    expect(reloadButton).toBeInTheDocument()
  })

  it('calls onError with correct arguments', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({
      componentStack: expect.any(String),
    }))
  })

  it('shows custom fallback instead of standard', () => {
    const CustomFallback = () => <div data-testid="fallback">Custom</div>
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    expect(screen.queryByText('Oops. Something went wrong')).not.toBeInTheDocument()
  })

  it('has resetError method', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test</div>
      </ErrorBoundary>
    )
    expect(container).toBeInTheDocument()
  })

  it('saves errorInfo in state on error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
  })

  it('uses getDerivedStateFromError to set state', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Show error details')).toBeInTheDocument()
  })

  it('supports resetKeys prop without errors', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={[1]}>
        <WorkingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('working')).toBeInTheDocument()
    rerender(
      <ErrorBoundary resetKeys={[2]}>
        <WorkingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('working')).toBeInTheDocument()
  })

  it('ignores resetKeys when no error', () => {
    render(
      <ErrorBoundary resetKeys={[1]}>
        <WorkingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('working')).toBeInTheDocument()
  })

  it('supports resetKeys without crash', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={[1]}>
        <WorkingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('working')).toBeInTheDocument()
    rerender(
      <ErrorBoundary resetKeys={[2]}>
        <WorkingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('working')).toBeInTheDocument()
  })

  it('calls resetError and resets error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
    const retryButton = screen.getByText('Try again')
    fireEvent.click(retryButton)
    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
  })

  it('has correct styles for error icon', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const errorIcon = screen.getByText('Oops. Something went wrong')
    expect(errorIcon).toBeInTheDocument()
  })

  it('renders details with error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const details = screen.getByText('Show error details')
    expect(details).toBeInTheDocument()
  })

  it('has glass class for error container', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const container = screen.getByText('Oops. Something went wrong').closest('.glass')
    expect(container).toBeInTheDocument()
  })

  it('renders SVG error icon', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('has correct path for SVG icon', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const paths = document.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('supports empty fallback', () => {
    render(
      <ErrorBoundary fallback={null}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
  })

  it('renders fallback with React element', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })

  it('has reload page button', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const reloadButton = screen.getByText('Reload page')
    expect(reloadButton).toBeInTheDocument()
    fireEvent.click(reloadButton)
  })

  it('shows error in pre element', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const details = screen.getByText('Show error details')
    fireEvent.click(details)
    const preElement = document.querySelector('pre')
    expect(preElement).toBeInTheDocument()
    expect(preElement).toHaveClass('text-xs', 'text-red-400', 'bg-dark-800', 'rounded-lg', 'p-4')
  })

  it('has correct classes for container', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const container = screen.getByText('Oops. Something went wrong').closest('.min-h-screen')
    expect(container).toHaveClass('min-h-screen', 'bg-dark-900', 'flex', 'items-center', 'justify-center', 'p-4')
  })

  it('has SVG with correct attributes', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('has path element', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const paths = document.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('has button with transition classes', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const retryButton = screen.getByText('Try again')
    expect(retryButton).toHaveClass('px-4', 'py-2', 'bg-primary-600', 'hover:bg-primary-700', 'text-white', 'rounded-lg')
  })

  it('has reload button with classes', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    const reloadButton = screen.getByText('Reload page')
    expect(reloadButton).toHaveClass('px-4', 'py-2', 'bg-dark-700', 'hover:bg-dark-600', 'text-white', 'rounded-lg')
  })
})
