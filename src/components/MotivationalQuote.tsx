import { useState, useEffect } from 'react'
import { useAppTranslation } from '../i18n/config'

interface Quote {
  textKey: string
  authorKey: string
  category: 'motivation' | 'practice' | 'success' | 'learning'
}

const QUOTES: Quote[] = [
  {
    textKey: 'quote.practice1',
    authorKey: 'quote.fastfingers',
    category: 'practice',
  },
  {
    textKey: 'quote.learning1',
    authorKey: 'quote.fastfingers',
    category: 'learning',
  },
  {
    textKey: 'quote.motivation1',
    authorKey: 'quote.fastfingers',
    category: 'motivation',
  },
  {
    textKey: 'quote.learning2',
    authorKey: 'quote.fastfingers',
    category: 'learning',
  },
  {
    textKey: 'quote.practice2',
    authorKey: 'quote.fastfingers',
    category: 'practice',
  },
  {
    textKey: 'quote.success1',
    authorKey: 'quote.collier',
    category: 'success',
  },
  {
    textKey: 'quote.motivation2',
    authorKey: 'quote.jobs',
    category: 'motivation',
  },
  {
    textKey: 'quote.learning3',
    authorKey: 'quote.fastfingers',
    category: 'learning',
  },
  {
    textKey: 'quote.practice3',
    authorKey: 'quote.fastfingers',
    category: 'practice',
  },
  {
    textKey: 'quote.motivation3',
    authorKey: 'quote.fastfingers',
    category: 'motivation',
  },
  {
    textKey: 'quote.learning4',
    authorKey: 'quote.fastfingers',
    category: 'learning',
  },
  {
    textKey: 'quote.motivation4',
    authorKey: 'quote.fastfingers',
    category: 'motivation',
  },
  {
    textKey: 'quote.practice4',
    authorKey: 'quote.fastfingers',
    category: 'practice',
  },
  {
    textKey: 'quote.success2',
    authorKey: 'quote.fastfingers',
    category: 'success',
  },
  {
    textKey: 'quote.learning5',
    authorKey: 'quote.fastfingers',
    category: 'learning',
  },
]

interface MotivationalQuoteProps {
  category?: Quote['category']
  autoChange?: boolean
  changeInterval?: number
}

export function MotivationalQuote({
  category,
  autoChange = false,
  changeInterval = 30000,
}: MotivationalQuoteProps) {
  const { t } = useAppTranslation()
  const [currentQuote, setCurrentQuote] = useState<Quote>(() => getRandomQuote(category))

  useEffect(() => {
    if (!autoChange) return

    const interval = setInterval(() => {
      setCurrentQuote(getRandomQuote(category))
    }, changeInterval)

    return () => clearInterval(interval)
  }, [autoChange, changeInterval, category])

  const handleNewQuote = () => {
    setCurrentQuote(getRandomQuote(category))
  }

  return (
    <div className="card p-6 relative overflow-hidden" role="complementary" aria-label={t('notification.achievement')}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-6xl opacity-10 select-none" aria-hidden="true">
        💭
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide">
            {t('notification.achievement')}
          </h3>
          <button
            onClick={handleNewQuote}
            className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 transition-all flex items-center justify-center group"
            title={t('action.restart')}
            aria-label={t('action.restart')}
          >
            <svg
              className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <blockquote className="mb-4">
          <p className="text-lg leading-relaxed italic text-white">
            &ldquo;{t(currentQuote.textKey)}&rdquo;
          </p>
        </blockquote>

        <div className="flex items-center justify-between">
          <cite className="text-sm text-dark-400 not-italic">
            — {t(currentQuote.authorKey)}
          </cite>
          <span className="text-xs px-3 py-1 bg-dark-800 rounded-full text-dark-400">
            {getCategoryLabel(currentQuote.category)}
          </span>
        </div>
      </div>
    </div>
  )
}

function getRandomQuote(category?: Quote['category']): Quote {
  const filtered = category
    ? QUOTES.filter(q => q.category === category)
    : QUOTES

  const quotes = filtered.length > 0 ? filtered : QUOTES
  const firstQuote = quotes[0] ?? QUOTES[0]
  if (!firstQuote) throw new Error('No quotes available')
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex] ?? firstQuote
}

function getCategoryLabel(category: Quote['category']): string {
  const labels: Record<Quote['category'], string> = {
    motivation: 'Мотивация',
    practice: 'Практика',
    success: 'Успех',
    learning: 'Обучение',
  }
  return labels[category]
}

export { QUOTES }
