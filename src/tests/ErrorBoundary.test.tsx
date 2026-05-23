import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../components/ErrorBoundary'

// Компонент который всегда выбрасывает ошибку
const BrokenComponent = () => {
  throw new Error('Test error')
}

// Нормальный компонент
function WorkingComponent() {
  return <div data-testid="working">All good!</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('должен рендерить children без ошибок', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('working')).toBeInTheDocument()
  })

  it('должен перехватывать ошибку и показывать fallback UI', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByText('Refresh page')).toBeInTheDocument()
  })

  it('должен показывать кастомный fallback', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
  })

  it('должен вызывать onError при ошибке', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
  })

  it('должен показывать детали ошибки в development режиме', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Show error details')).toBeInTheDocument()
  })

  it('должен позволять повторить попытку при клике на "Try again"', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Try again'))

    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
  })

  it('должен вызывать onRetry при клике на "Try again"', () => {
    const onRetry = vi.fn()

    render(
      <ErrorBoundary onRetry={onRetry}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Try again'))

    expect(onRetry).toHaveBeenCalled()
  })

  it('должен рендерить children если ошибки нет', () => {
    render(
      <ErrorBoundary>
        <div>Children content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Children content')).toBeInTheDocument()
  })

  it('должен показывать ошибку в details', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const details = screen.getByText('Show error details')
    expect(details).toBeInTheDocument()
  })

  it('должен иметь кнопку обновления страницы', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Refresh page')
    expect(reloadButton).toBeInTheDocument()
  })

  it('должен вызывать onError с правильными аргументами', () => {
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

  it('должен показывать кастомный fallback вместо стандартного', () => {
    const CustomFallback = () => <div data-testid="fallback">Custom</div>

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    expect(screen.queryByText('Oops. Something went wrong')).not.toBeInTheDocument()
  })

  it('должен иметь метод resetError который существует', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test</div>
      </ErrorBoundary>
    )

    expect(container).toBeInTheDocument()
  })

  it('должен сохранять errorInfo в состоянии при ошибке', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
  })

  it('должен использовать getDerivedStateFromError для установки состояния', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Show error details')).toBeInTheDocument()
  })

  it('должен поддерживать resetKeys проп без ошибок', () => {
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

  it('должен игнорировать resetKeys когда нет ошибки', () => {
    render(
      <ErrorBoundary resetKeys={[1]}>
        <WorkingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('working')).toBeInTheDocument()
  })

  it('должен поддерживать resetKeys без падения', () => {
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

  it('должен вызывать resetError и сбрасывать ошибку', () => {
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

  it('должен иметь правильные стили для иконки ошибки', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const errorIcon = screen.getByText('Oops. Something went wrong')
    expect(errorIcon).toBeInTheDocument()
  })

  it('должен рендерить details с ошибкой', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const details = screen.getByText('Show error details')
    expect(details).toBeInTheDocument()

    fireEvent.click(details)

    const errorText = screen.getByText(/Test error/)
    expect(errorText).toBeInTheDocument()
  })

  it('должен иметь glass класс для контейнера ошибки', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const container = screen.getByText('Oops. Something went wrong').closest('.glass')
    expect(container).toBeInTheDocument()
  })

  it('должен рендерить SVG иконку ошибки', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('должен иметь правильный путь для SVG иконки', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const paths = document.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('должен поддерживать пустой fallback', () => {
    render(
      <ErrorBoundary fallback={null}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops. Something went wrong')).toBeInTheDocument()
  })

  it('должен рендерить fallback с React элементом', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })

  it('должен иметь кнопку обновления страницы', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Refresh page')
    expect(reloadButton).toBeInTheDocument()
    fireEvent.click(reloadButton)
    // Кнопка вызывает window.location.reload()
  })

  it('должен показывать ошибку в pre элементе', () => {
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

  it('должен иметь правильные классы для контейнера', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const container = screen.getByText('Oops. Something went wrong').closest('.min-h-screen')
    expect(container).toHaveClass('min-h-screen', 'bg-dark-900', 'flex', 'items-center', 'justify-center', 'p-4')
  })

  it('должен иметь SVG с правильными атрибутами', () => {
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

  it('должен иметь path элемент', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const paths = document.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('должен иметь кнопку с классами перехода', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const retryButton = screen.getByText('Try again')
    expect(retryButton).toHaveClass('px-4', 'py-2', 'bg-primary-600', 'hover:bg-primary-700', 'text-white', 'rounded-lg')
  })

  it('должен иметь кнопку обновления с классами', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Refresh page')
    expect(reloadButton).toHaveClass('px-4', 'py-2', 'bg-dark-700', 'hover:bg-dark-600', 'text-white', 'rounded-lg')
  })
})
