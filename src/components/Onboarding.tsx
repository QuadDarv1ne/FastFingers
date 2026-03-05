import { useState } from 'react'
import { motion } from 'framer-motion'

interface OnboardingProps {
  onComplete: () => void
}

const steps = [
  {
    title: 'Добро пожаловать в FastFingers! 🎉',
    description: 'Научитесь печатать быстрее и точнее с помощью нашего современного тренажёра слепой печати.',
    icon: '⌨️',
  },
  {
    title: 'Выберите раскладку',
    description: 'Поддерживаем ЙЦУКЕН, QWERTY и Dvorak. Выберите удобную раскладку в настройках.',
    icon: '🔤',
  },
  {
    title: 'Следите за подсказками',
    description: 'Виртуальная клавиатура покажет, каким пальцем нажимать каждую клавишу. Зелёный — правильно, красный — ошибка.',
    icon: '👆',
  },
  {
    title: 'Выполняйте челленджи',
    description: 'Ежедневные задания помогут развить навык. Поддерживайте серию дней для бонусов!',
    icon: '🏆',
  },
  {
    title: 'Отслеживайте прогресс',
    description: 'Графики и статистика покажут ваш рост. Соревнуйтесь с собой и ставьте рекорды!',
    icon: '📊',
  },
  {
    title: 'Готовы начать?',
    description: 'Нажмите «Начать тренировку» и сделайте первый шаг к скоростной печати!',
    icon: '🚀',
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]!
  const progress = ((currentStep + 1) / steps.length) * 100

  if (!step) return null

  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        <div className="glass rounded-2xl p-8 relative overflow-hidden">
          {/* Прогресс бар */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-dark-800">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Иконка */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="text-7xl text-center mb-6"
          >
            {step.icon}
          </motion.div>

          {/* Контент */}
          <motion.div
            key={`content-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-dark-400 mb-8">{step.description}</p>
          </motion.div>

          {/* Индикаторы шагов */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary-500'
                    : index < currentStep
                    ? 'bg-primary-500/50'
                    : 'bg-dark-700'
                }`}
                aria-label={`Перейти к шагу ${index + 1}`}
              />
            ))}
          </div>

          {/* Кнопки навигации */}
          <div className="flex gap-3">
            {currentStep > 0 ? (
              <button
                onClick={prevStep}
                className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
              >
                Назад
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
              >
                Пропустить
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Начать тренировку' : 'Далее'}
            </button>
          </div>
        </div>

        {/* Подсказка */}
        <p className="text-center text-dark-500 text-sm mt-4">
          Шаг {currentStep + 1} из {steps.length}
        </p>
      </motion.div>
    </div>
  )
}
