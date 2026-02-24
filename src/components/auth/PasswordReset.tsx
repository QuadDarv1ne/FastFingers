import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@hooks/useAuth'

interface PasswordResetProps {
  onBack: () => void
}

const TOKEN_EXPIRY_SECONDS = 300 // 5 минут
const MIN_PASSWORD_LENGTH = 8
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PasswordReset({ onBack }: PasswordResetProps) {
  const { resetPassword, confirmPasswordReset, isLoading, error, clearError } = useAuth()

  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(TOKEN_EXPIRY_SECONDS)
  const [passwordError, setPasswordError] = useState('')
  const [emailError, setEmailError] = useState('')
  
  const emailInputRef = useRef<HTMLInputElement>(null)
  const tokenInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (step === 'confirm') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setStep('request')
            setTimeLeft(TOKEN_EXPIRY_SECONDS)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [step])

  useEffect(() => {
    if (step === 'request') {
      emailInputRef.current?.focus()
    } else if (step === 'confirm') {
      tokenInputRef.current?.focus()
    }
  }, [step])

  useEffect(() => {
    if (email && !EMAIL_REGEX.test(email)) {
      setEmailError('Неверный формат email')
    } else {
      setEmailError('')
    }
  }, [email])

  useEffect(() => {
    if (newPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Минимум ${MIN_PASSWORD_LENGTH} символов`)
    } else {
      setPasswordError('')
    }
  }, [newPassword])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Неверный формат email')
      return
    }
    
    clearError()
    setSuccessMessage('')
    
    try {
      await resetPassword({ email })
      setSuccessMessage('Инструкции по сбросу пароля отправлены на ваш email')
      setStep('confirm')
      setTimeLeft(TOKEN_EXPIRY_SECONDS)
    } catch {
      // Ошибка уже установлена в контексте
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Минимум ${MIN_PASSWORD_LENGTH} символов`)
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают')
      return
    }

    try {
      await confirmPasswordReset({ token, newPassword, confirmPassword })
      setSuccessMessage('Пароль успешно изменён!')
      setTimeout(() => onBack(), 2000)
    } catch {
      // Ошибка уже установлена в контексте
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'request' && email && !emailError) {
        handleRequestReset(e)
      } else if (step === 'confirm' && token && newPassword && confirmPassword && !passwordError && newPassword === confirmPassword) {
        handleConfirmReset(e)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass rounded-2xl p-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {step === 'request' ? 'Восстановление пароля' : 'Новый пароль'}
          </h1>
          <p className="text-dark-400">
            {step === 'request' 
              ? 'Введите email для сброса пароля' 
              : 'Введите код из письма и новый пароль'}
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 p-4 bg-error/20 border border-error/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-error font-medium">Ошибка</p>
              <p className="text-error/80 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Успех */}
        {successMessage && (
          <div className="mb-6 p-4 bg-success/20 border border-success/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-success">{successMessage}</p>
          </div>
        )}

        {/* Форма запроса */}
        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Email
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="your@email.com"
                required
                className={`w-full bg-dark-800 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                  emailError ? 'border-error/50 focus:ring-error' : 'border-dark-700'
                }`}
              />
              {emailError && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {emailError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || emailError}
              className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Отправка...
                </>
              ) : (
                'Отправить инструкции'
              )}
            </button>
          </form>
        )}

        {/* Форма подтверждения */}
        {step === 'confirm' && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Код из письма
              </label>
              <input
                ref={tokenInputRef}
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="ABC123"
                required
                maxLength={6}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-center text-lg tracking-wider uppercase"
              />
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className={`text-sm font-mono ${timeLeft < 60 ? 'text-error animate-pulse' : 'text-dark-400'}`}>
                  ⏳ {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Новый пароль
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                required
                minLength={8}
                className={`w-full bg-dark-800 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                  passwordError ? 'border-error/50 focus:ring-error' : 'border-dark-700'
                }`}
              />
              {passwordError && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {passwordError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Подтверждение пароля
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-success-600 hover:bg-success-500 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Сохранение...
                </>
              ) : (
                'Изменить пароль'
              )}
            </button>
          </form>
        )}

        {/* Кнопка назад */}
        <div className="mt-6">
          <button
            onClick={onBack}
            className="w-full py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </button>
        </div>

        {/* Подсказка */}
        {step === 'request' && (
          <div className="mt-6 p-4 bg-dark-800/50 rounded-lg">
            <p className="text-sm text-dark-400">
              <strong>💡 Совет:</strong> Введите email, который вы использовали при регистрации. 
              Мы отправим инструкции по сбросу пароля.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
