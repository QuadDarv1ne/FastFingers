import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppTranslation } from '../i18n/config'

interface OnboardingProps {
  onComplete: () => void
}

const STEP_KEYS = [
  { title: 'onboarding.welcome', desc: 'onboarding.welcomeDesc', icon: '⌨️' },
  { title: 'onboarding.layout', desc: 'onboarding.layoutDesc', icon: '🔤' },
  { title: 'onboarding.hints', desc: 'onboarding.hintsDesc', icon: '👆' },
  { title: 'onboarding.challenges', desc: 'onboarding.challengesDesc', icon: '🏆' },
  { title: 'onboarding.progress', desc: 'onboarding.progressDesc', icon: '📊' },
  { title: 'onboarding.ready', desc: 'onboarding.readyDesc', icon: '🚀' },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useAppTranslation()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = useMemo(() => STEP_KEYS.map(s => ({
    title: t(s.title), description: t(s.desc), icon: s.icon,
  })), [t])

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

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  if (!step) return null

  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
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
            <h2 id="onboarding-title" className="text-2xl font-bold mb-3">{step.title}</h2>
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
                aria-label={t('onboarding.goToStep', 'Go to step {{step}}', { step: index + 1 })}
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
                {t('action.back')}
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
              >
                {t('onboarding.skip', 'Skip')}
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
            >
              {currentStep === steps.length - 1 ? t('onboarding.startTraining', 'Start training') : t('onboarding.next', 'Next')}
            </button>
          </div>
        </div>

        {/* Подсказка */}
        <p className="text-center text-dark-500 text-sm mt-4">
          {t('onboarding.stepCounter', 'Step {{current}} of {{total}}', { current: currentStep + 1, total: steps.length })}
        </p>
      </motion.div>
    </div>
  )
}
