import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toast } from '@components/Toast'
import type { Toast as ToastType } from '@contexts/ToastContext'

vi.mock('../i18n/config', () => ({
  useAppTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'action.close': 'Закрыть',
      }
      return translations[key] || key
    },
  }),
}))

describe('Toast', () => {
  const createToast = (type: ToastType['type'], message: string): ToastType => ({
    id: 'test-id',
    type,
    message,
    duration: 3000,
  })

  it('должен рендерить success toast', () => {
    const toast = createToast('success', 'Успешно!')
    render(<Toast toast={toast} onDismiss={vi.fn()} />)

    expect(screen.getByTestId('toast-success')).toBeInTheDocument()
    expect(screen.getByText('Успешно!')).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('должен рендерить error toast', () => {
    const toast = createToast('error', 'Ошибка!')
    render(<Toast toast={toast} onDismiss={vi.fn()} />)

    expect(screen.getByTestId('toast-error')).toBeInTheDocument()
    expect(screen.getByText('Ошибка!')).toBeInTheDocument()
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('должен рендерить info toast', () => {
    const toast = createToast('info', 'Информация')
    render(<Toast toast={toast} onDismiss={vi.fn()} />)

    expect(screen.getByTestId('toast-info')).toBeInTheDocument()
    expect(screen.getByText('Информация')).toBeInTheDocument()
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })

  it('должен рендерить warning toast', () => {
    const toast = createToast('warning', 'Предупреждение')
    render(<Toast toast={toast} onDismiss={vi.fn()} />)

    expect(screen.getByTestId('toast-warning')).toBeInTheDocument()
    expect(screen.getByText('Предупреждение')).toBeInTheDocument()
    expect(screen.getByText('⚠')).toBeInTheDocument()
  })

  it('должен вызывать onDismiss при клике на кнопку закрытия', () => {
    const onDismiss = vi.fn()
    const toast = createToast('info', 'Тест')
    render(<Toast toast={toast} onDismiss={onDismiss} />)

    fireEvent.click(screen.getByLabelText('Закрыть'))

    expect(onDismiss).toHaveBeenCalledWith('test-id')
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('должен иметь правильные стили для каждого типа', () => {
    const { rerender } = render(
      <Toast toast={createToast('success', 'Test')} onDismiss={vi.fn()} />
    )
    expect(screen.getByTestId('toast-success')).toHaveClass('bg-green-500')

    rerender(<Toast toast={createToast('error', 'Test')} onDismiss={vi.fn()} />)
    expect(screen.getByTestId('toast-error')).toHaveClass('bg-red-500')

    rerender(<Toast toast={createToast('info', 'Test')} onDismiss={vi.fn()} />)
    expect(screen.getByTestId('toast-info')).toHaveClass('bg-blue-500')

    rerender(<Toast toast={createToast('warning', 'Test')} onDismiss={vi.fn()} />)
    expect(screen.getByTestId('toast-warning')).toHaveClass('bg-yellow-500')
  })

  it('должен иметь aria-атрибуты для доступности', () => {
    const toast = createToast('info', 'Тест')
    render(<Toast toast={toast} onDismiss={vi.fn()} />)

    const button = screen.getByLabelText('Закрыть')
    expect(button).toHaveAttribute('aria-label', 'Закрыть')
  })
})
