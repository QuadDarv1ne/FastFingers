import { useEffect, useCallback } from 'react'

interface HotkeyOptions {
  enabled?: boolean
  ignoreInputFocus?: boolean
}

export function useHotkeys(
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
  options: HotkeyOptions = {}
) {
  const { enabled = true, ignoreInputFocus = true } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Игнорируем если фокус на input/textarea
    if (ignoreInputFocus) {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }
    }

    // Создаём комбинацию клавиш
    const parts = []
    if (event.ctrlKey || event.metaKey) parts.push('ctrl')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')
    parts.push(event.key.toLowerCase())

    const combination = parts.join('+')

    // Ищем совпадение
    const handler = shortcuts[combination]
    if (handler) {
      event.preventDefault()
      handler(event)
    }
  }, [enabled, ignoreInputFocus, shortcuts])

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}

// Предустановленные горячие клавиши для приложения
export function useAppHotkeys(actions: {
  practice?: () => void
  sprint?: () => void
  test?: () => void
  statistics?: () => void
  learning?: () => void
  tips?: () => void
  profile?: () => void
  newExercise?: () => void
  toggleKeyboard?: () => void
  toggleSound?: () => void
}) {
  useHotkeys({
    'ctrl+1': () => actions.practice?.(),
    'ctrl+2': () => actions.sprint?.(),
    'ctrl+3': () => actions.statistics?.(),
    'ctrl+4': () => actions.learning?.(),
    'ctrl+5': () => actions.tips?.(),
    'ctrl+p': () => actions.profile?.(),
    'ctrl+n': () => actions.newExercise?.(),
    'ctrl+k': () => actions.toggleKeyboard?.(),
    'ctrl+s': (e) => {
      e.preventDefault() // Предотвращаем сохранение страницы
      actions.toggleSound?.()
    },
    '?': () => {
      // Показ справки по горячим клавишам
      console.log(`
        ╔═══════════════════════════════════════╗
        ║     ГОРЯЧИЕ КЛАВИШИ FastFingers      ║
        ╠═══════════════════════════════════════╣
        ║  Ctrl+1  →  Практика                  ║
        ║  Ctrl+2  →  Спринт                    ║
        ║  Ctrl+3  →  Статистика                ║
        ║  Ctrl+4  →  Обучение                  ║
        ║  Ctrl+5  →  Советы                    ║
        ║  Ctrl+P  →  Профиль                   ║
        ║  Ctrl+N  →  Новое упражнение          ║
        ║  Ctrl+K  →  Вкл/Выкл клавиатуру       ║
        ║  Ctrl+S  →  Вкл/Выкл звук             ║
        ║  ?       →  Справка (это окно)        ║
        ╚═══════════════════════════════════════╝
      `)
    },
  })
}
