/**
 * TypingDisplay — Shared character-by-character typing visualization
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

interface TypingDisplayProps {
  text: string
  currentIndex: number
  inputResults: Array<{ isCorrect: boolean }>
  isActive: boolean
}

export function TypingDisplay({ text, currentIndex, inputResults, isActive }: TypingDisplayProps) {
  return (
    <div className="font-mono text-sm leading-relaxed break-words">
      {text.split('').map((char, index) => {
        let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
        if (index < currentIndex) {
          status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
        } else if (index === currentIndex && isActive) {
          status = 'current'
        }
        return (
          <span
            key={index}
            className={`inline-block min-w-[0.6em] rounded ${
              status === 'correct'
                ? 'text-green-400'
                : status === 'incorrect'
                ? 'text-red-400'
                : status === 'current'
                ? 'text-violet-400 border-b-2 border-violet-500'
                : 'text-dark-500'
            }`}
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}
