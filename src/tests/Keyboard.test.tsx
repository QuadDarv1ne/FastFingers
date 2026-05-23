import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Keyboard } from '../components/Keyboard'

// Mock i18n to return the key itself as translation
vi.mock('../i18n/config', () => ({
  useAppTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru' },
  }),
}))

describe('Keyboard', () => {
  it('должен рендерить клавиатуру', () => {
    render(<Keyboard layout="jcuken" />)
    expect(screen.getByText('misc.keyboard')).toBeInTheDocument()
  })

  it('должен показывать название раскладки', () => {
    render(<Keyboard layout="jcuken" />)
    // Layout name comes from layouts data, not i18n
    expect(screen.getByText('ЙЦУКЕН')).toBeInTheDocument()
  })

  it('должен рендерить QWERTY раскладку', () => {
    render(<Keyboard layout="qwerty" />)
    expect(screen.getByText('QWERTY')).toBeInTheDocument()
  })

  it('должен рендерить Dvorak раскладку', () => {
    render(<Keyboard layout="dvorak" />)
    expect(screen.getByText('Dvorak')).toBeInTheDocument()
  })

  it('не должен рендерить невалидную раскладку', () => {
    const { container } = render(<Keyboard layout={'invalid' as any} />)
    expect(container.firstChild).toBeNull()
  })
})
