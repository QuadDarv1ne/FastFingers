import { useEffect, useRef, RefObject } from 'react'

/**
 * Хук для создания фокус-ловушки в модальных окнах и диалогах
 * Удерживает фокус внутри элемента, пока он активен
 *
 * @param ref - Ref на элемент-контейнер
 * @param isActive - Флаг активности ловушки
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, isActive: boolean): void {
  const previousActiveElement = useRef<Element | null>(null)
  const previousOverflow = useRef<string | null>(null)

  useEffect(() => {
    if (!isActive || !ref.current) return

    // Сохраняем предыдущий активный элемент
    previousActiveElement.current = document.activeElement

    // Сохраняем состояние прокрутки body
    previousOverflow.current = document.body.style.overflow

    // Блокируем прокрутку body пока модальное окно открыто
    document.body.style.overflow = 'hidden'

    // Находим все фокусируемые элементы внутри контейнера
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
    ].join(', ')

    const container = ref.current
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => {
      // Проверяем, что элемент видим и не скрыт
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })

    if (focusableElements.length === 0) {
      // Если нет фокусируемых элементов, фокусируемся на контейнере
      container.setAttribute('tabindex', '-1')
      container.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Фокусируемся на первом элементе
    firstElement?.focus()

    // Обработчик переключения фокуса
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      // Если Shift+Tab на первом элементе -> переходим к последнему
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
      // Если Tab на последнем элементе -> переходим к первому
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // Возвращаем фокус предыдущему элементу при размонтировании
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      
      // Восстанавливаем прокрутку
      if (previousOverflow.current !== null) {
        document.body.style.overflow = previousOverflow.current
      } else {
        document.body.style.overflow = ''
      }
      
      // Возвращаем фокус предыдущему элементу
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive, ref])
}

/**
 * Хук для управления фокусом (возврат фокуса после действия)
 * 
 * @example
 * const focusRef = useReturnFocus()
 * <button ref={focusRef}>Click me</button>
 */
export function useReturnFocus<T extends HTMLElement = HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const previousActiveElement = document.activeElement

    return () => {
      // Возвращаем фокус предыдущему элементу при размонтировании
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus()
      }
    }
  }, [])

  return ref
}
