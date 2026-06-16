import { memo } from 'react'
import { motion } from 'framer-motion'
import { useAppTranslation } from '../i18n/config'

interface TypingCharProps {
  char: string
  status: 'correct' | 'incorrect' | 'current' | 'pending'
}

const STATUS_KEY: Record<TypingCharProps['status'], string> = {
  correct: 'char.correct',
  incorrect: 'char.incorrect',
  current: 'char.current',
  pending: 'char.pending',
}

export const TypingChar = memo(({ char, status }: TypingCharProps) => {
  const { t } = useAppTranslation()

  return (
    <motion.span
      className={
        `char ${status === 'correct' ? 'correct' :
          status === 'incorrect' ? 'incorrect' :
          status === 'current' ? 'current' : 'pending'}`
      }
      aria-label={`${t(STATUS_KEY[status])}: ${char === ' ' ? t('char.space') : char}`}
      aria-current={status === 'current' ? 'true' : undefined}
      layout={status === 'current'}
      transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  )
}, (prev, next) => prev.status === next.status && prev.char === next.char)

TypingChar.displayName = 'TypingChar'
