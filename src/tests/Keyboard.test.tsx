import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Keyboard } from '../components/Keyboard'

describe('Keyboard', () => {
  it('должен рендерить клавиатуру', () => {
    render(<Keyboard layout="jcuken" />)
    expect(screen.getByText('Виртуальная клавиатура')).toBeInTheDocument()
  })

  it('должен показывать название раскладки', () => {
    render(<Keyboard layout="jcuken" />)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { container } = render(<Keyboard layout={'invalid' as any} />)
    expect(container.firstChild).toBeNull()
  })
})
