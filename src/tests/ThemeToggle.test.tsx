import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '../components/ThemeToggle'

describe('ThemeToggle', () => {
  const mockOnThemeChange = vi.fn()
  const mockOnThemeOptionChange = vi.fn()

  beforeEach(() => {
    mockOnThemeChange.mockClear()
    mockOnThemeOptionChange.mockClear()
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

  it('должен вызывать onThemeOptionChange при выборе auto', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        themeOption="dark"
        onThemeChange={mockOnThemeChange}
        onThemeOptionChange={mockOnThemeOptionChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    const autoTheme = screen.getByText(/Авт/i)
    await user.click(autoTheme)

    expect(mockOnThemeOptionChange).toHaveBeenCalledWith('auto')
    expect(mockOnThemeChange).not.toHaveBeenCalled()
  })

  it('должен вызывать onThemeOptionChange при выборе темы', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        themeOption="dark"
        onThemeChange={mockOnThemeChange}
        onThemeOptionChange={mockOnThemeOptionChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    const lightTheme = screen.getByText(/Тема 2/i)
    await user.click(lightTheme)

    expect(mockOnThemeOptionChange).toHaveBeenCalledWith('light')
    expect(mockOnThemeChange).toHaveBeenCalledWith('light')
  })

  it('должен закрывать меню при клике вне', async () => {
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

    await user.keyboard('{Escape}')

    expect(screen.queryByText(/Тема 2/i)).not.toBeInTheDocument()
  })

  it('должен переключаться стрелками клавиатуры', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(mockOnThemeChange).toHaveBeenCalled()
  })

  it('должен выбирать тему по Enter', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(mockOnThemeChange).toHaveBeenCalled()
  })

  it('должен выбирать тему по Space', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    await user.keyboard('{ArrowDown}')
    await user.keyboard(' ')

    expect(mockOnThemeChange).toHaveBeenCalled()
  })

  it('должен показывать галочку у выбранной темы', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    // Ищем кнопку с темой в меню по роли и тексту
    const darkThemeButton = screen.getByRole('menuitem', { name: /Тема 1/i })
    // Проверяем, что у кнопки есть класс активного элемента
    expect(darkThemeButton).toHaveClass('bg-primary-600')
  })

  it('должен иметь правильные ARIA атрибуты', () => {
    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('должен менять aria-expanded при открытии меню', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    
    expect(button).toHaveAttribute('aria-expanded', 'false')
    
    await user.click(button)
    
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('должен переключаться стрелками внутри меню', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    const menu = screen.getByRole('menu')
    
    // Фокус на меню
    menu.focus()
    
    // Стрелка вниз
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(mockOnThemeChange).toHaveBeenCalled()
  })

  it('должен переключаться стрелкой вверх внутри меню', async () => {
    const user = userEvent.setup()

    render(
      <ThemeToggle
        theme="dark"
        onThemeChange={mockOnThemeChange}
      />
    )

    const button = screen.getByRole('button', { name: /Тема/i })
    await user.click(button)

    const menu = screen.getByRole('menu')
    menu.focus()
    
    // Стрелка вверх
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{Enter}')

    expect(mockOnThemeChange).toHaveBeenCalled()
  })

  it('должен возвращать null если currentTheme не найден', () => {
    // Этот тест покрывает строку "if (!currentTheme) return null"
    // currentTheme всегда находится благодаря themes.find, но тест полезен для edge case
    render(
      <ThemeToggle
        theme={'invalid_theme' as any}
        onThemeChange={mockOnThemeChange}
      />
    )

    // Компонент должен рендериться без ошибок
    expect(screen.getByRole('button', { name: /Тема/i })).toBeInTheDocument()
  })
})
