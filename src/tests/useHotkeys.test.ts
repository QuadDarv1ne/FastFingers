import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHotkeys, useHotkey } from '../hooks/useHotkeys'

function createKeyboardEvent(options: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

function dispatchEvent(event: KeyboardEvent) {
  window.dispatchEvent(event)
}

describe('useHotkeys', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('должен вызывать обработчик при нажатии горячей клавиши', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('должен вызывать обработчик для простой клавиши без модификаторов', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ escape: handler }))

    dispatchEvent(createKeyboardEvent({ key: 'escape' }))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('должен вызывать обработчик для ctrl+shift комбинации', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+shift+z': handler }))

    dispatchEvent(createKeyboardEvent({ key: 'z', ctrlKey: true, shiftKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('должен вызывать обработчик для alt комбинации', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'alt+f': handler }))

    dispatchEvent(createKeyboardEvent({ key: 'f', altKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('должен вызывать обработчик для meta (Cmd) на Mac как ctrl+s', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    dispatchEvent(createKeyboardEvent({ key: 's', metaKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('не должен вызывать обработчик когда enabled=false', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }, { enabled: false }))

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))

    expect(handler).not.toHaveBeenCalled()
  })

  it('должен вызывать preventDefault по умолчанию', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    vi.spyOn(event, 'preventDefault')
    dispatchEvent(event)

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('не должен вызывать preventDefault когда preventDefault=false', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }, { preventDefault: false }))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    vi.spyOn(event, 'preventDefault')
    dispatchEvent(event)

    expect(handler).toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('должен вызывать stopPropagation когда stopPropagation=true', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }, { stopPropagation: true }))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    vi.spyOn(event, 'stopPropagation')
    dispatchEvent(event)

    expect(event.stopPropagation).toHaveBeenCalled()
  })

  it('не должен вызывать обработчик в input элементах когда ignoreInputFocus=true (по умолчанию)', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    Object.defineProperty(event, 'target', {
      value: document.createElement('input'),
    })
    dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('должен вызывать обработчик в input элементах когда ignoreInputFocus=false', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }, { ignoreInputFocus: false }))

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    Object.defineProperty(event, 'target', { value: input })
    dispatchEvent(event)

    expect(handler).toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('не должен вызывать обработчик в textarea элементах', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    Object.defineProperty(event, 'target', {
      value: document.createElement('textarea'),
    })
    dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('не должен вызывать обработчик в contentEditable элементах', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    const div = document.createElement('div')
    div.contentEditable = 'true'

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    Object.defineProperty(event, 'target', { value: div })
    dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('должен обновлять обработчики при изменении объекта shortcuts', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    const { rerender } = renderHook(
      ({ shortcuts }) => useHotkeys(shortcuts),
      { initialProps: { shortcuts: { 'ctrl+s': handler1 } } }
    )

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).not.toHaveBeenCalled()

    rerender({ shortcuts: { 'ctrl+s': handler2 } })

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('должен удалять обработчик при размонтировании', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(handler).toHaveBeenCalledTimes(1)

    handler.mockClear()
    unmount()

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('должен регистрировать несколько горячих клавиш одновременно', () => {
    const saveHandler = vi.fn()
    const undoHandler = vi.fn()
    const redoHandler = vi.fn()

    renderHook(() => useHotkeys({
      'ctrl+s': saveHandler,
      'ctrl+z': undoHandler,
      'ctrl+shift+z': redoHandler,
    }))

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(saveHandler).toHaveBeenCalledTimes(1)

    dispatchEvent(createKeyboardEvent({ key: 'z', ctrlKey: true }))
    expect(undoHandler).toHaveBeenCalledTimes(1)

    dispatchEvent(createKeyboardEvent({ key: 'z', ctrlKey: true, shiftKey: true }))
    expect(redoHandler).toHaveBeenCalledTimes(1)
  })

  it('должен передавать KeyboardEvent обработчику', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    dispatchEvent(event)

    expect(handler).toHaveBeenCalledWith(event)
  })

  it('не должен вызывать обработчик для несовпадающей комбинации', () => {
    const handler = vi.fn()
    renderHook(() => useHotkeys({ 'ctrl+s': handler }))

    dispatchEvent(createKeyboardEvent({ key: 's', shiftKey: true }))
    dispatchEvent(createKeyboardEvent({ key: 'a', ctrlKey: true }))

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('useHotkey', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('должен вызывать обработчик при нажатии горячей клавиши', () => {
    const handler = vi.fn()
    renderHook(() => useHotkey('ctrl+s', handler))

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('должен вызывать preventDefault по умолчанию', () => {
    const handler = vi.fn()
    renderHook(() => useHotkey('ctrl+s', handler))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    vi.spyOn(event, 'preventDefault')
    dispatchEvent(event)

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('не должен вызывать preventDefault когда preventDefault=false', () => {
    const handler = vi.fn()
    renderHook(() => useHotkey('ctrl+s', handler, { preventDefault: false }))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    vi.spyOn(event, 'preventDefault')
    dispatchEvent(event)

    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('не должен вызывать обработчик когда enabled=false', () => {
    const handler = vi.fn()
    renderHook(() => useHotkey('ctrl+s', handler, { enabled: false }))

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))

    expect(handler).not.toHaveBeenCalled()
  })

  it('должен вызывать stopPropagation когда stopPropagation=true', () => {
    const handler = vi.fn()
    renderHook(() => useHotkey('ctrl+s', handler, { stopPropagation: true }))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    vi.spyOn(event, 'stopPropagation')
    dispatchEvent(event)

    expect(event.stopPropagation).toHaveBeenCalled()
  })

  it('должен удалять обработчик при размонтировании', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useHotkey('ctrl+s', handler))

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(handler).toHaveBeenCalledTimes(1)

    handler.mockClear()
    unmount()

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('должен обновлять обработчик при изменении', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    const { rerender } = renderHook(
      ({ handler }) => useHotkey('ctrl+s', handler),
      { initialProps: { handler: handler1 } }
    )

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).not.toHaveBeenCalled()

    rerender({ handler: handler2 })

    dispatchEvent(createKeyboardEvent({ key: 's', ctrlKey: true }))
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('должен поддерживать ignoreInputFocus=false (по умолчанию блокирует в input)', () => {
    const handler = vi.fn()
    renderHook(() => useHotkey('ctrl+s', handler))

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    Object.defineProperty(event, 'target', { value: input })
    dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('должен поддерживать ignoreInputFocus=true (игнорирует focus check)', () => {
    const handler = vi.fn()
    renderHook(() => useHotkey('ctrl+s', handler, { ignoreInputFocus: true }))

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    Object.defineProperty(event, 'target', { value: input })
    dispatchEvent(event)

    expect(handler).toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('должен передавать KeyboardEvent обработчику', () => {
    const handler = vi.fn()
    renderHook(() => useHotkey('ctrl+s', handler))

    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    dispatchEvent(event)

    expect(handler).toHaveBeenCalledWith(event)
  })
})
