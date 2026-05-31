import { memo } from 'react'

interface TypingCharProps {
  char: string
  status: 'correct' | 'incorrect' | 'current' | 'pending'
}

const STATUS_LABELS: Record<TypingCharProps['status'], string> = {
  correct: 'Правильно',
  incorrect: 'Ошибка',
  current: 'Текущий символ',
  pending: 'Ожидает',
}

export const TypingChar = memo(({ char, status }: TypingCharProps) => {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded border-2 transition-colors duration-75 ${
        status === 'correct' ? 'bg-success/20 text-success border-transparent' :
        status === 'incorrect' ? 'bg-error/20 text-error border-transparent' :
        status === 'current' ? 'bg-primary/30 text-primary border-primary typing-cursor' :
        'text-dark-400 border-transparent'
      }`}
      aria-label={`${STATUS_LABELS[status]}: ${char === ' ' ? 'пробел' : char}`}
      aria-current={status === 'current' ? 'true' : undefined}
    >
      {char}
    </span>
  )
}, (prev, next) => prev.status === next.status && prev.char === next.char)

TypingChar.displayName = 'TypingChar'
