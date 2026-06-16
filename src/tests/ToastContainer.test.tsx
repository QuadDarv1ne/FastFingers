import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ToastContainer } from '@components/ToastContainer'
import { ToastProvider, useToast } from '@contexts/ToastContext'

function renderWithProvider(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('ToastContainer', () => {
  it('не должен рендерить toasts когда их нет', () => {
    renderWithProvider(<ToastContainer />)
    expect(screen.queryByTestId('toast-success')).toBeNull()
    expect(screen.queryByTestId('toast-error')).toBeNull()
    expect(screen.queryByTestId('toast-info')).toBeNull()
    expect(screen.queryByTestId('toast-warning')).toBeNull()
  })

  it('должен рендерить toasts когда они есть', () => {
    function TestComponent() {
      const { showToast } = useToast()
      
      React.useEffect(() => {
        showToast('Тест 1', 'success')
        showToast('Тест 2', 'error')
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      
      return <ToastContainer />
    }
    
    renderWithProvider(<TestComponent />)
    
    expect(screen.getByText('Тест 1')).toBeInTheDocument()
    expect(screen.getByText('Тест 2')).toBeInTheDocument()
  })

  it('должен иметь правильные aria-атрибуты', () => {
    function TestComponent() {
      const { showToast } = useToast()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(() => { showToast('Тест', 'info') }, [])
       
      return <ToastContainer />
    }

    renderWithProvider(<TestComponent />)

    const container = screen.getByTestId('toast-info').closest('[aria-live]')
    expect(container).toHaveAttribute('aria-live', 'polite')
    expect(container).toHaveAttribute('aria-atomic', 'true')
  })

  it('должен позиционироваться в правом верхнем углу', () => {
    function TestComponent() {
      const { showToast } = useToast()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(() => { showToast('Тест', 'info') }, [])
       
      return <ToastContainer />
    }

    const { container } = renderWithProvider(<TestComponent />)
    const toastContainer = container.querySelector('div[class*="fixed"]')
    expect(toastContainer).toHaveClass('fixed', 'top-4', 'right-4')
  })

  it('должен иметь z-index для отображения поверх других элементов', () => {
    function TestComponent() {
      const { showToast } = useToast()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(() => { showToast('Тест', 'info') }, [])

      return <ToastContainer />
    }

    const { container } = renderWithProvider(<TestComponent />)
    const toastContainer = container.querySelector('div[class*="fixed"]')
    expect(toastContainer).toHaveClass('z-[100]')
  })
})
