import { useState, useEffect, memo } from 'react'
import { useAppTranslation } from '../i18n/config'
import { Quote, getRandomQuote, getCategoryLabel } from '../constants/quotes'

interface MotivationalQuoteProps {
  category?: Quote['category']
  autoChange?: boolean
  changeInterval?: number
}

export const MotivationalQuote = memo(function MotivationalQuote({
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
    <div className="glass rounded-xl p-4 relative overflow-hidden" role="complementary" aria-label={t('quote.motivational')}>
      <div className="absolute top-0 right-0 text-5xl opacity-5 select-none" aria-hidden="true">💭</div>

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-[10px] font-semibold text-dark-500 uppercase tracking-wider">
            💡 {t('notification.achievement')}
          </h3>
          <button
            onClick={handleNewQuote}
            className="w-6 h-6 rounded-md bg-dark-800/50 hover:bg-dark-700/50 transition-all flex items-center justify-center"
            title={t('action.restart')}
            aria-label={t('action.restart')}
          >
            <svg
              className="w-3 h-3 text-dark-400 hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <blockquote className="mb-3">
          <p className="text-sm leading-relaxed italic text-dark-200">
            &ldquo;{t(currentQuote.textKey)}&rdquo;
          </p>
        </blockquote>

        <div className="flex items-center justify-between gap-2">
          <cite className="text-[10px] text-dark-500 not-italic font-medium truncate">
            — {t(currentQuote.authorKey)}
          </cite>
          <span className="text-[9px] px-2 py-0.5 bg-dark-800/50 rounded-full text-dark-500 font-medium flex-shrink-0">
            {getCategoryLabel(currentQuote.category, t)}
          </span>
        </div>
      </div>
    </div>
  )
})
