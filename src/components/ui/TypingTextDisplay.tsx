/**
 * TypingTextDisplay — Shared character-by-character typing visualization
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { memo, useMemo } from 'react'

interface TypingTextDisplayProps {
  text: string
  currentIndex: number
  inputResults: Array<{ isCorrect: boolean }>
  isActive: boolean
  /** Use enhanced visual style with backgrounds and animations (default: false) */
  enhanced?: boolean
}

const STATUS_CLASSES = {
  enhanced: {
    correct: 'bg-green-500/20 text-green-500 border-transparent',
    incorrect: 'bg-red-500/20 text-red-500 border-transparent',
    current: 'bg-violet-500/30 text-violet-500 border-violet-500 typing-cursor',
    pending: 'text-dark-500 border-transparent',
  },
  normal: {
    correct: 'text-green-400 border-transparent',
    incorrect: 'text-red-400 border-transparent',
    current: 'text-violet-400 border-violet-500 typing-cursor',
    pending: 'text-dark-500 border-transparent',
  },
} as const

export const TypingTextDisplay = memo(function TypingTextDisplay({ text, currentIndex, inputResults, isActive, enhanced = false }: TypingTextDisplayProps) {
  const chars = useMemo(() => text.split(''), [text])
  const classes = enhanced ? STATUS_CLASSES.enhanced : STATUS_CLASSES.normal

  return (
    <div className={`font-mono leading-relaxed break-words ${enhanced ? 'text-lg' : 'text-sm'}`}>
      {chars.map((char, index) => {
        let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
        if (index < currentIndex) {
          status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
        } else if (index === currentIndex && isActive) {
          status = 'current'
        }
        return (
          <span
            key={index}
            className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded border-2 transition-colors duration-75 ${classes[status]}`}
          >
            {char}
          </span>
        )
      })}
    </div>
  )
})
