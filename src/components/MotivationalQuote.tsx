import { useState, useEffect, useCallback } from 'react'

interface Quote {
  text: string
  author: string
  category: 'motivation' | 'typing' | 'success'
}

const quotes: Quote[] = [
  { text: 'Скорость — это ничто без точности.', author: 'Айртон Сенна', category: 'typing' },
  { text: 'Практика приводит к совершенству.', author: 'Народная мудрость', category: 'typing' },
  { text: 'Успех — это сумма небольших усилий, повторяющихся изо дня в день.', author: 'Роберт Кольер', category: 'success' },
  { text: 'Не бойтесь медленного прогресса, бойтесь бездействия.', author: 'Конфуций', category: 'motivation' },
  { text: 'Мастерство приходит к тем, кто практикуется.', author: 'Древняя пословица', category: 'typing' },
  { text: 'Каждый эксперт когда-то был новичком.', author: 'Хелен Хейс', category: 'motivation' },
  { text: 'Печатайте быстро, думайте быстрее.', author: 'Неизвестный', category: 'typing' },
  { text: 'Препятствия — это то, что вы видите, когда отводите взгляд от цели.', author: 'Генри Форд', category: 'success' },
  { text: 'Лучший способ предсказать будущее — создать его.', author: 'Питер Друкер', category: 'motivation' },
  { text: 'Усердная работа побеждает талант, когда талант не работает усердно.', author: 'Тим Нотке', category: 'success' },
  { text: 'Десять пальцев — десять друзей.', author: 'Инструктор по печати', category: 'typing' },
  { text: 'Сегодня лучше, чем вчера. Завтра лучше, чем сегодня.', author: 'Японская пословица', category: 'motivation' },
  { text: 'Точность важнее скорости.', author: 'Правило слепой печати', category: 'typing' },
  { text: 'Успех — это не ключ к счастью. Счастье — это ключ к успеху.', author: 'Альберт Швейцер', category: 'success' },
  { text: 'Не останавливайтесь, когда устали. Останавливайтесь, когда закончили.', author: 'Мэрилин Монро', category: 'motivation' },
]

interface MotivationalQuoteProps {
  onQuoteChange?: (quote: Quote) => void
}

export function MotivationalQuote({ onQuoteChange }: MotivationalQuoteProps) {
  const [currentQuote, setCurrentQuote] = useState<Quote>(quotes[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getRandomQuote = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length)
      const newQuote = quotes[randomIndex]
      setCurrentQuote(newQuote)
      onQuoteChange?.(newQuote)
      setIsRefreshing(false)
    }, 300)
  }, [onQuoteChange])

  useEffect(() => {
    getRandomQuote()
  }, [getRandomQuote])

  const categoryColors = {
    motivation: 'from-blue-600 to-cyan-500',
    typing: 'from-purple-600 to-pink-500',
    success: 'from-yellow-600 to-orange-500',
  }

  const categoryIcons = {
    motivation: '💪',
    typing: '⌨️',
    success: '🏆',
  }

  return (
    <div className="card relative overflow-hidden">
      {/* Градиентный фон */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${categoryColors[currentQuote.category]}`} />
      
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{categoryIcons[currentQuote.category]}</span>
          <span className="text-xs px-2.5 py-1 bg-dark-800/50 rounded-full text-dark-400 capitalize font-medium border border-dark-700/50">
            {currentQuote.category === 'typing' ? '📝 Печать' : 
             currentQuote.category === 'motivation' ? '🔥 Мотивация' : '✨ Успех'}
          </span>
        </div>
        <button
          onClick={getRandomQuote}
          disabled={isRefreshing}
          className="p-2 hover:bg-dark-800/50 rounded-lg transition-all text-dark-400 hover:text-white disabled:opacity-50"
          title="Другая цитата"
        >
          <svg 
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <blockquote className="mb-4">
        <svg className="w-8 h-8 text-primary-500/20 mb-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-lg font-medium leading-relaxed text-dark-100">
          {currentQuote.text}
        </p>
      </blockquote>
      
      <footer className="flex items-center justify-between pt-3 border-t border-dark-700/50">
        <cite className="text-sm text-dark-400 not-italic font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {currentQuote.author}
        </cite>
      </footer>
    </div>
  )
}

// Компонент для отображения случайной цитаты в компактном виде
export function QuoteOfTheDay() {
  const [quote, setQuote] = useState<Quote>(quotes[0])

  useEffect(() => {
    // Используем дату как seed для одинаковой цитаты на весь день
    const today = new Date().toDateString()
    let hash = 0
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i)
      hash = hash & hash
    }
    const index = Math.abs(hash) % quotes.length
    setQuote(quotes[index])
  }, [])

  return (
    <div className="text-center p-4 bg-dark-800/30 rounded-lg">
      <p className="text-sm text-dark-300 mb-2">{quote.text}</p>
      <p className="text-xs text-dark-500">— {quote.author}</p>
    </div>
  )
}
