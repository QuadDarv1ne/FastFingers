import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '../components/ThemeToggle'

describe('ThemeToggle', () => {
  const mockOnThemeChange = vi.fn()

  beforeEach(() => {
    mockOnThemeChange.mockClear()
  })

  it('должен рендерить кнопку выбора темы', () => {
    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    expect(screen.getByRole('button', { name: /выбрать тему/i })).toBeInTheDocument()
  })

  it('должен показывать текущую тему', () => {
    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    expect(screen.getByText('Тёмная')).toBeInTheDocument()
  })

  it('должен открывать меню при клике', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /выбрать тему/i })
    await user.click(button)

    expect(screen.getByText('Светлая')).toBeInTheDocument()
    expect(screen.getByText('Фиолетовая')).toBeInTheDocument()
    expect(screen.getByText('Синяя')).toBeInTheDocument()
    expect(screen.getByText('Оранжевая')).toBeInTheDocument()
    expect(screen.getByText('Настраиваемая')).toBeInTheDocument()
  })

  it('должен вызывать onThemeChange при выборе темы', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /выбрать тему/i })
    await user.click(button)

    const lightTheme = screen.getByText('Светлая')
    await user.click(lightTheme)

    expect(mockOnThemeChange).toHaveBeenCalledWith('light')
  })

  it('должен закрывать меню после выбора темы', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /выбрать тему/i })
    await user.click(button)

    const purpleTheme = screen.getByText('Фиолетовая')
    await user.click(purpleTheme)

    expect(screen.queryByText('Синяя')).not.toBeInTheDocument()
  })

  it('должен отображать иконки для каждой темы', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /выбрать тему/i })
    await user.click(button)

    expect(screen.getByText('🌙')).toBeInTheDocument()
    expect(screen.getByText('☀️')).toBeInTheDocument()
    expect(screen.getByText('💜')).toBeInTheDocument()
    expect(screen.getByText('💙')).toBeInTheDocument()
    expect(screen.getByText('🧡')).toBeInTheDocument()
    expect(screen.getByText('🎨')).toBeInTheDocument()
  })
})
