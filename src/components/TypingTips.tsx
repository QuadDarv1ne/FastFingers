import { useState } from 'react'
import { useAppTranslation } from '../i18n/config'

interface Tip {
  icon: string
  titleKey: string
  descriptionKey: string
  category: 'posture' | 'technique' | 'practice' | 'health'
}

const tips: Tip[] = [
  {
    icon: '🪑',
    titleKey: 'tip.posture',
    descriptionKey: 'tip.postureDesc',
    category: 'posture',
  },
  {
    icon: '👐',
    titleKey: 'tip.hands',
    descriptionKey: 'tip.handsDesc',
    category: 'posture',
  },
  {
    icon: '🎯',
    titleKey: 'tip.home',
    descriptionKey: 'tip.homeDesc',
    category: 'technique',
  },
  {
    icon: '👆',
    titleKey: 'tip.zones',
    descriptionKey: 'tip.zonesDesc',
    category: 'technique',
  },
  {
    icon: '👀',
    titleKey: 'tip.look',
    descriptionKey: 'tip.lookDesc',
    category: 'technique',
  },
  {
    icon: '🐢',
    titleKey: 'tip.accuracy',
    descriptionKey: 'tip.accuracyDesc',
    category: 'practice',
  },
  {
    icon: '⏰',
    titleKey: 'tip.regular',
    descriptionKey: 'tip.regularDesc',
    category: 'practice',
  },
  {
    icon: '🎮',
    titleKey: 'tip.games',
    descriptionKey: 'tip.gamesDesc',
    category: 'practice',
  },
  {
    icon: '🧘',
    titleKey: 'tip.breaks',
    descriptionKey: 'tip.breaksDesc',
    category: 'health',
  },
  {
    icon: '💪',
    titleKey: 'tip.exercise',
    descriptionKey: 'tip.exerciseDesc',
    category: 'health',
  },
  {
    icon: '👁️',
    titleKey: 'tip.eyes',
    descriptionKey: 'tip.eyesDesc',
    category: 'health',
  },
  {
    icon: '🎉',
    titleKey: 'tip.progress',
    descriptionKey: 'tip.progressDesc',
    category: 'health',
  },
]

const categories = [
  { id: 'all', label: 'Все', icon: '📚' },
  { id: 'posture', label: 'Осанка', icon: '🪑' },
  { id: 'technique', label: 'Техника', icon: '🎯' },
  { id: 'practice', label: 'Практика', icon: '⏰' },
  { id: 'health', label: 'Здоровье', icon: '🧘' },
]

export function TypingTips() {
  const { t } = useAppTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTips = selectedCategory === 'all'
    ? tips
    : tips.filter(tip => tip.category === selectedCategory)

  return (
    <div className="glass rounded-xl p-6" role="region" aria-label={t('nav.tips')}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">💡 {t('nav.tips')}</h2>
          <p className="text-sm text-dark-400">Правила и рекомендации для быстрого обучения</p>
        </div>
      </div>

      {/* Категории */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Категории советов">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
            aria-pressed={selectedCategory === cat.id}
          >
            <span aria-hidden="true">{cat.icon}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Советы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list">
        {filteredTips.map((tip, index) => (
          <div
            key={index}
            className="bg-dark-800/50 rounded-lg p-4 hover:bg-dark-800 transition-colors"
            role="listitem"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">{tip.icon}</span>
              <div>
                <h3 className="font-medium mb-1">{t(tip.titleKey)}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{t(tip.descriptionKey)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Подсказка */}
      <div className="mt-6 p-4 bg-primary-600/10 border border-primary-600/20 rounded-lg">
        <p className="text-sm text-primary-300">
          <strong>💡 {t('misc.about')}:</strong> {t('tip.regular')} {t('tip.regularDesc')}
        </p>
      </div>
    </div>
  )
}
