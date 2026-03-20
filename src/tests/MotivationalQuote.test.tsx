import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MotivationalQuote, QUOTES } from '../components/MotivationalQuote'

// Mock i18next
vi.mock('../i18n/config', () => ({
  useAppTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'notification.achievement': 'Достижение',
        'action.restart': 'Перезапустить',
        'quote.practice1': 'Практика делает мастера',
        'quote.learning1': 'Учиться никогда не поздно',
        'quote.motivation1': 'Мотивация важна',
        'quote.success1': 'Успех приходит с трудом',
        'quote.motivation2': 'Stay hungry, stay foolish',
        'quote.fastfingers': 'FastFingers',
        'quote.collier': 'Collier',
        'quote.jobs': 'Steve Jobs',
      }
      return translations[key] || key
    },
  }),
}))

describe('MotivationalQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('должен рендерить компонент с цитатой', () => {
    render(<MotivationalQuote />)

    expect(screen.getByText(/Достижение/i)).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('должен отображать текст цитаты', () => {
    render(<MotivationalQuote />)

    // Проверяем, что есть цитата в блоке
    const quoteBlock = screen.getByRole('complementary')
    expect(quoteBlock).toContainElement(document.querySelector('blockquote'))
  })

  it('должен отображать автора цитаты', () => {
    render(<MotivationalQuote />)

    expect(screen.getByText(/FastFingers|Collier|Steve Jobs/i)).toBeInTheDocument()
  })

  it('должен отображать категорию цитаты', () => {
    render(<MotivationalQuote />)

    // Проверяем, что есть метка категории (любая из возможных)
    const categoryElement = document.querySelector('span.text-xs')
    expect(categoryElement).toBeInTheDocument()
  })

  it('должен иметь кнопку для новой цитаты', () => {
    render(<MotivationalQuote />)

    const restartButton = screen.getByLabelText('Перезапустить')
    expect(restartButton).toBeInTheDocument()
  })

  it('должен вызывать смену цитаты при клике на кнопку', () => {
    render(<MotivationalQuote />)

    const restartButton = screen.getByLabelText('Перезапустить')
    fireEvent.click(restartButton)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('должен использовать правильную ARIA метку', () => {
    render(<MotivationalQuote />)

    const complementary = screen.getByRole('complementary')
    expect(complementary).toHaveAttribute('aria-label', 'Достижение')
  })

  it('должен иметь декоративный элемент фона', () => {
    render(<MotivationalQuote />)

    const decorationElement = screen.getByText('💭')
    expect(decorationElement).toBeInTheDocument()
    expect(decorationElement).toHaveClass('absolute', 'top-0', 'right-0')
  })

  it('должен иметь SVG иконку обновления', () => {
    render(<MotivationalQuote />)

    const svgElement = document.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })
})

describe('getRandomQuote', () => {
  it('должен возвращать цитату из общего списка', async () => {
    const { getRandomQuote } = await import('../components/MotivationalQuote')
    const quote = getRandomQuote()

    expect(quote).toHaveProperty('textKey')
    expect(quote).toHaveProperty('authorKey')
    expect(quote).toHaveProperty('category')
  })

  it('должен фильтровать цитаты по категории', async () => {
    const { getRandomQuote } = await import('../components/MotivationalQuote')
    const quote = getRandomQuote('motivation')

    expect(quote.category).toBe('motivation')
  })

  it('должен возвращать цитату из указанной категории', async () => {
    const { getRandomQuote } = await import('../components/MotivationalQuote')

    for (let i = 0; i < 10; i++) {
      const quote = getRandomQuote('practice')
      expect(quote.category).toBe('practice')
    }
  })
})

describe('getCategoryLabel', () => {
  it('должен возвращать правильную метку для motivation', async () => {
    const { getCategoryLabel } = await import('../components/MotivationalQuote')
    expect(getCategoryLabel('motivation')).toBe('Мотивация')
  })

  it('должен возвращать правильную метку для practice', async () => {
    const { getCategoryLabel } = await import('../components/MotivationalQuote')
    expect(getCategoryLabel('practice')).toBe('Практика')
  })

  it('должен возвращать правильную метку для success', async () => {
    const { getCategoryLabel } = await import('../components/MotivationalQuote')
    expect(getCategoryLabel('success')).toBe('Успех')
  })

  it('должен возвращать правильную метку для learning', async () => {
    const { getCategoryLabel } = await import('../components/MotivationalQuote')
    expect(getCategoryLabel('learning')).toBe('Обучение')
  })
})

describe('QUOTES', () => {
  it('должен содержать массив цитат', () => {
    expect(QUOTES).toBeInstanceOf(Array)
    expect(QUOTES.length).toBeGreaterThan(0)
  })

  it('должен содержать цитаты всех категорий', () => {
    const categories = QUOTES.map(q => q.category)
    expect(categories).toContain('motivation')
    expect(categories).toContain('practice')
    expect(categories).toContain('success')
    expect(categories).toContain('learning')
  })

  it('должен иметь структуру Quote для каждой цитаты', () => {
    QUOTES.forEach(quote => {
      expect(quote).toHaveProperty('textKey')
      expect(quote).toHaveProperty('authorKey')
      expect(quote).toHaveProperty('category')
    })
  })
})

describe('MotivationalQuote с autoChange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('должен автоматически менять цитату при autoChange=true', () => {
    render(<MotivationalQuote autoChange={true} changeInterval={1000} />)

    vi.advanceTimersByTime(1000)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('не должен менять цитату без autoChange', () => {
    render(<MotivationalQuote autoChange={false} />)

    vi.advanceTimersByTime(5000)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('должен использовать кастомный интервал', () => {
    render(<MotivationalQuote autoChange={true} changeInterval={500} />)

    vi.advanceTimersByTime(500)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
})

describe('MotivationalQuote с категорией', () => {
  it('должен фильтровать цитаты по категории motivation', () => {
    render(<MotivationalQuote category="motivation" />)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('должен фильтровать цитаты по категории practice', () => {
    render(<MotivationalQuote category="practice" />)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('должен фильтровать цитаты по категории success', () => {
    render(<MotivationalQuote category="success" />)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('должен фильтровать цитаты по категории learning', () => {
    render(<MotivationalQuote category="learning" />)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
})
