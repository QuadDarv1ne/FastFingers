/**
 * TypingTextDisplay — Shared character-by-character typing visualization
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

interface TypingTextDisplayProps {
  text: string
  currentIndex: number
  inputResults: Array<{ isCorrect: boolean }>
  isActive: boolean
  /** Use enhanced visual style with backgrounds and animations (default: false) */
  enhanced?: boolean
}

export function TypingTextDisplay({ text, currentIndex, inputResults, isActive, enhanced = false }: TypingTextDisplayProps) {
  return (
    <div className={`font-mono leading-relaxed break-words ${enhanced ? 'text-lg' : 'text-sm'}`}>
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
            className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded border-2 transition-colors duration-75 ${
              enhanced
                ? status === 'correct'
                  ? 'bg-green-500/20 text-green-500 border-transparent'
                  : status === 'incorrect'
                    ? 'bg-red-500/20 text-red-500 border-transparent'
                    : status === 'current'
                      ? 'bg-violet-500/30 text-violet-500 border-violet-500 typing-cursor'
                      : 'text-dark-500 border-transparent'
                : status === 'correct'
                  ? 'text-green-400 border-transparent'
                  : status === 'incorrect'
                    ? 'text-red-400 border-transparent'
                    : status === 'current'
                      ? 'text-violet-400 border-violet-500 typing-cursor'
                      : 'text-dark-500 border-transparent'
            }`}
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}
