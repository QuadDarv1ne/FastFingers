import { useState } from 'react'

interface Tip {
  icon: string
  title: string
  description: string
  category: 'posture' | 'technique' | 'practice' | 'health'
}

const tips: Tip[] = [
  {
    icon: '🪑',
    title: 'Правильная осанка',
    description: 'Сидите прямо, спина прижата к спинке стула. Расстояние от глаз до монитора — 50-70 см.',
    category: 'posture',
  },
  {
    icon: '👐',
    title: 'Положение рук',
    description: 'Локти под углом 90°, запястья не провисают. Используйте подставку для запястий при необходимости.',
    category: 'posture',
  },
  {
    icon: '🎯',
    title: 'Домашняя позиция',
    description: 'Левая рука: мизинец на А, безымянный на В, средний на Ы, указательный на Ф. Правая: указательный на О, средний на Р, безымянный на Л, мизинец на Д.',
    category: 'technique',
  },
  {
    icon: '👆',
    title: 'Зоны пальцев',
    description: 'Каждый палец отвечает за определённые клавиши. Указательные пальцы — самые активные, обслуживают по 4 клавиши.',
    category: 'technique',
  },
  {
    icon: '👀',
    title: 'Не смотрите на клавиатуру',
    description: 'Главное правило слепой печати! Если нужно — накройте руки лёгкой тканью.',
    category: 'technique',
  },
  {
    icon: '🐢',
    title: 'Сначала точность, потом скорость',
    description: 'Не гонитесь за скоростью. Сосредоточьтесь на правильной технике и отсутствии ошибок. Скорость придёт сама.',
    category: 'practice',
  },
  {
    icon: '⏰',
    title: 'Регулярные занятия',
    description: 'Лучше 15 минут каждый день, чем 2 часа раз в неделю. Поддерживайте серию дней!',
    category: 'practice',
  },
  {
    icon: '🎮',
    title: 'Играйте в игры',
    description: 'Используйте режим спринта и челленджи для разнообразия тренировки.',
    category: 'practice',
  },
  {
    icon: '🧘',
    title: 'Делайте перерывы',
    description: 'Каждые 25-30 минут делайте 5-минутный перерыв. Встаньте, потянитесь, разомните кисти.',
    category: 'health',
  },
  {
    icon: '💪',
    title: 'Упражнения для кистей',
    description: 'Вращайте кистями, сжимайте-разжимайте кулаки. Это предотвратит туннельный синдром.',
    category: 'health',
  },
  {
    icon: '👁️',
    title: 'Гимнастика для глаз',
    description: 'Каждые 20 минут смотрите на объект в 6 метрах в течение 20 секунд. Это правило 20-20-20.',
    category: 'health',
  },
  {
    icon: '🎉',
    title: 'Отмечайте прогресс',
    description: 'Радуйтесь каждому достижению! Даже небольшой прогресс — это шаг к мастерству.',
    category: 'practice',
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
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory)

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">💡 Советы по печати</h2>
          <p className="text-sm text-dark-400">Правила и рекомендации для быстрого обучения</p>
        </div>
      </div>

      {/* Категории */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Советы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.map((tip, index) => (
          <div
            key={index}
            className="bg-dark-800/50 rounded-lg p-4 hover:bg-dark-800 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <h3 className="font-medium mb-1">{tip.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Подсказка */}
      <div className="mt-6 p-4 bg-primary-600/10 border border-primary-600/20 rounded-lg">
        <p className="text-sm text-primary-300">
          <strong>💡 Помните:</strong> Регулярность важнее длительности тренировок. 
          15 минут ежедневной практики дадут лучший результат, чем часы раз в неделю!
        </p>
      </div>
    </div>
  )
}
