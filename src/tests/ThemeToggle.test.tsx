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

    expect(screen.getByRole('button', { name: /Тема/i })).toBeInTheDocument()
  })

  it('должен показывать текущую тему', () => {
    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    expect(screen.getByText(/Тема 1/i)).toBeInTheDocument()
  })

  it('должен открывать меню при клике', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    expect(screen.getByText(/Тема 2/i)).toBeInTheDocument()
    expect(screen.getByText(/Тема 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Тема 4/i)).toBeInTheDocument()
    expect(screen.getByText(/Тема 5/i)).toBeInTheDocument()
    expect(screen.getByText(/Тема 6/i)).toBeInTheDocument()
  })

  it('должен вызывать onThemeChange при выборе темы', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    const lightTheme = screen.getByText(/Тема 2/i)
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

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    const purpleTheme = screen.getByText(/Тема 3/i)
    await user.click(purpleTheme)

    expect(screen.queryByText(/Тема 4/i)).not.toBeInTheDocument()
  })

  it('должен отображать иконки для каждой темы', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    // Проверяем, что все иконки тем присутствуют в меню
    const themeIcons = ['🌙', '☀️', '💜', '💙', '🧡', '🎨']
    themeIcons.forEach(icon => {
      expect(screen.getAllByText(icon).length).toBeGreaterThanOrEqual(1)
    })
  })
})
