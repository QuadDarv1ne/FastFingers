import { useEffect, useState } from 'react'
import './AriaAnnouncer.css'

interface AriaAnnouncerProps {
  message?: string
  priority?: 'polite' | 'assertive'
}

/**
 * Компонент для объявления изменений screen reader'ам
 * Используется для динамических обновлений
 */
export function AriaAnnouncer({ message = '', priority = 'polite' }: AriaAnnouncerProps) {
  const [text, setText] = useState(message)

  useEffect(() => {
    if (message) {
      setText(message)
      const timer = setTimeout(() => setText(''), 1000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!text) return null

  return (
    <div
      id="aria-announcer"
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="aria-announcer"
    >
      {text}
    </div>
  )
}
