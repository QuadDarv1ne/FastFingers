import { useState, useEffect } from 'react'

interface Quote {
  text: string
  author: string
  category: 'motivation' | 'practice' | 'success' | 'learning'
}

const QUOTES: Quote[] = [
  {
    text: 'Практика делает совершенным. Каждое нажатие клавиши приближает вас к мастерству.',
    author: 'FastFingers',
    category: 'practice',
  },
  {
    text: 'Скорость приходит с точностью. Сначала научитесь печатать правильно.',
    author: 'FastFingers',
    category: 'learning',
  },
  {
    text: 'Не сравнивайте себя с другими. Сравнивайте себя с собой вчерашним.',
    author: 'FastFingers',
    category: 'motivation',
  },
  {
    text: 'Каждая ошибка - это возможность научиться чему-то новому.',
    author: 'FastFingers',
    category: 'learning',
  },
  {
    text: 'Постоянство важнее интенсивности. 10 минут каждый день лучше, чем час раз в неделю.',
    author: 'FastFingers',
    category: 'practice',
  },
  {
    text: 'Успех - это сумма маленьких усилий, повторяемых день за днём.',
    author: 'Роберт Кольер',
    category: 'success',
  },
  {
    text: 'Единственный способ делать великую работу - любить то, что вы делаете.',
    author: 'Стив Джобс',
    category: 'motivation',
  },
  {
    text: 'Мастерство - это не пункт назначения, это путешествие.',
    author: 'FastFingers',
    category: 'learning',
  },
  {
    text: 'Ваши пальцы знают больше, чем вы думаете. Доверьтесь мышечной памяти.',
    author: 'FastFingers',
    category: 'practice',
  },
  {
    text: 'Не бойтесь ошибаться. Бойтесь не пробовать.',
    author: 'FastFingers',
    category: 'motivation',
  },
  {
    text: 'Скорость без точности - это просто быстрые ошибки.',
    author: 'FastFingers',
    category: 'learning',
  },
  {
    text: 'Каждый эксперт когда-то был новичком. Продолжайте практиковаться.',
    author: 'FastFingers',
    category: 'motivation',
  },
  {
    text: 'Ритм важнее скорости. Найдите свой темп и придерживайтесь его.',
    author: 'FastFingers',
    category: 'practice',
  },
  {
    text: 'Прогресс может быть медленным, но он всегда заметен при постоянстве.',
    author: 'FastFingers',
    category: 'success',
  },
  {
    text: 'Не смотрите на клавиатуру. Доверьтесь своим пальцам.',
    author: 'FastFingers',
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
    <div className="card p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-6xl opacity-10 select-none">
        💭
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide">
            Мотивация дня
          </h3>
          <button
            onClick={handleNewQuote}
            className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 transition-all flex items-center justify-center group"
            title="Новая цитата"
          >
            <svg
              className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            &ldquo;{currentQuote.text}&rdquo;
          </p>
        </blockquote>

        <div className="flex items-center justify-between">
          <cite className="text-sm text-dark-400 not-italic">
            — {currentQuote.author}
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
  return quotes[Math.floor(Math.random() * quotes.length)]!
}

function getCategoryLabel(category: Quote['category']): string {
  const labels = {
    motivation: 'Мотивация',
    practice: 'Практика',
    success: 'Успех',
    learning: 'Обучение',
  }
  return labels[category]
}

export { QUOTES }
