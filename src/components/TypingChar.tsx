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
      className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded ${
        status === 'correct' ? 'bg-success/20 text-success' :
        status === 'incorrect' ? 'bg-error/20 text-error' :
        status === 'current' ? 'bg-primary/30 text-primary border-2 border-primary animate-pulse' :
        'text-dark-400'
      }`}
      aria-label={`${STATUS_LABELS[status]}: ${char === ' ' ? 'пробел' : char}`}
      aria-current={status === 'current' ? 'true' : undefined}
    >
      {char}
    </span>
  )
}, (prev, next) => prev.status === next.status && prev.char === next.char)

TypingChar.displayName = 'TypingChar'
