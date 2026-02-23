import { memo } from 'react'

interface TypingCharProps {
  char: string
  status: 'correct' | 'incorrect' | 'current' | 'pending'
}

export const TypingChar = memo(({ char, status }: TypingCharProps) => {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded transition-all duration-100 ${
        status === 'correct' ? 'bg-success/20 text-success' :
        status === 'incorrect' ? 'bg-error/20 text-error' :
        status === 'current' ? 'bg-primary/30 text-primary border-2 border-primary animate-pulse' :
        'text-dark-400'
      }`}
    >
      {char}
    </span>
  )
})

TypingChar.displayName = 'TypingChar'
