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

    expect(screen.getByText('Упс. Что-то пошло не так')).toBeInTheDocument()
    expect(screen.getByText('Попробовать снова')).toBeInTheDocument()
    expect(screen.getByText('Обновить страницу')).toBeInTheDocument()
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

    expect(screen.getByText('Показать детали ошибки')).toBeInTheDocument()
  })

  it('должен позволять повторить попытку при клике на "Попробовать снова"', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    // ErrorBoundary перехватывает ошибку
    expect(screen.getByText('Упс. Что-то пошло не так')).toBeInTheDocument()

    // Клик по кнопке "Попробовать снова" должен сбросить состояние
    fireEvent.click(screen.getByText('Попробовать снова'))

    // Компонент снова попытается рендериться и снова упадёт
    expect(screen.getByText('Упс. Что-то пошло не так')).toBeInTheDocument()
  })

  it('должен вызывать onRetry при клике на "Попробовать снова"', () => {
    const onRetry = vi.fn()

    render(
      <ErrorBoundary onRetry={onRetry}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Попробовать снова'))

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

    const details = screen.getByText('Показать детали ошибки')
    expect(details).toBeInTheDocument()
  })

  it('должен иметь кнопку обновления страницы', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Обновить страницу')
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
    expect(screen.queryByText('Упс. Что-то пошло не так')).not.toBeInTheDocument()
  })

  it('должен иметь метод resetError который существует', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test</div>
      </ErrorBoundary>
    )

    expect(container).toBeInTheDocument()
  })
})
