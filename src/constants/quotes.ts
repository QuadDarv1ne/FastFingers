export interface Quote {
  textKey: string
  authorKey: string
  category: 'motivation' | 'practice' | 'success' | 'learning'
}

export const QUOTES: Quote[] = [
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

export function getRandomQuote(category?: Quote['category']): Quote {
  const filtered = category
    ? QUOTES.filter(q => q.category === category)
    : QUOTES

  const quotes = filtered.length > 0 ? filtered : QUOTES
  const firstQuote = quotes[0] ?? QUOTES[0]
  if (!firstQuote) throw new Error('No quotes available')
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex] ?? firstQuote
}

export function getCategoryLabel(category: Quote['category']): string {
  const labels: Record<Quote['category'], string> = {
    motivation: 'Мотивация',
    practice: 'Практика',
    success: 'Успех',
    learning: 'Обучение',
  }
  return labels[category]
}