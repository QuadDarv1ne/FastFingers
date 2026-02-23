import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '../components/ThemeToggle'

describe('ThemeToggle', () => {
  const mockOnThemeChange = vi.fn()

  beforeEach(() => {
    mockOnThemeChange.mockClear()
  })

  it('должен рендерить три кнопки переключения темы', () => {
    render(
      <ThemeToggle
        theme="dark"
        resolvedTheme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    expect(screen.getByRole('button', { name: /светлая тема/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /тёмная тема/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /системная тема/i })).toBeInTheDocument()
  })

  it('должен подсвечивать активную тему', () => {
    render(
      <ThemeToggle
        theme="dark"
        resolvedTheme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const darkButton = screen.getByRole('button', { name: /тёмная тема/i })
    expect(darkButton).toHaveClass('bg-primary-600')
  })

  it('должен вызывать onThemeChange при клике на светлую тему', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeToggle
        theme="dark"
        resolvedTheme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const lightButton = screen.getByRole('button', { name: /светлая тема/i })
    await user.click(lightButton)

    expect(mockOnThemeChange).toHaveBeenCalledWith('light')
  })

  it('должен вызывать onThemeChange при клике на тёмную тему', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeToggle
        theme="light"
        resolvedTheme="light"
        onThemeChange={mockOnThemeChange}
      />
    )

    const darkButton = screen.getByRole('button', { name: /тёмная тема/i })
    await user.click(darkButton)

    expect(mockOnThemeChange).toHaveBeenCalledWith('dark')
  })

  it('должен вызывать onThemeChange при клике на системную тему', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeToggle
        theme="light"
        resolvedTheme="light"
        onThemeChange={mockOnThemeChange}
      />
    )

    const systemButton = screen.getByRole('button', { name: /системная тема/i })
    await user.click(systemButton)

    expect(mockOnThemeChange).toHaveBeenCalledWith('system')
  })

  it('должен отображать иконку солнца для светлой темы', () => {
    render(
      <ThemeToggle
        theme="light"
        resolvedTheme="light"
        onThemeChange={mockOnThemeChange}
      />
    )

    const lightButton = screen.getByRole('button', { name: /светлая тема/i })
    const sunIcon = lightButton.querySelector('svg')
    expect(sunIcon).toBeInTheDocument()
  })

  it('должен отображать иконку луны для тёмной темы', () => {
    render(
      <ThemeToggle
        theme="dark"
        resolvedTheme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const darkButton = screen.getByRole('button', { name: /тёмная тема/i })
    const moonIcon = darkButton.querySelector('svg')
    expect(moonIcon).toBeInTheDocument()
  })
})
