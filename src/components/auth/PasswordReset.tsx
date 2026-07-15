import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@hooks/useAuth'
import { logger } from '@utils/logger'
import { MIN_PASSWORD_LENGTH } from '../../services/authErrors'
import { useAppTranslation } from '../../i18n/config'

interface PasswordResetProps {
  onBack: () => void
}

const TOKEN_EXPIRY_SECONDS = 3600 // 1 hour — matches authService RESET_TOKEN_EXPIRY_MS
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PasswordReset({ onBack }: PasswordResetProps) {
  const { resetPassword, confirmPasswordReset, isLoading, error, clearError, lastResetToken } = useAuth()
  const { t } = useAppTranslation()

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const backTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (lastResetToken?.token) {
      setToken(lastResetToken.token)
      setStep('confirm')
      setTimeLeft(TOKEN_EXPIRY_SECONDS)
    }
  }, [lastResetToken])

  useEffect(() => {
    if (step !== 'confirm') {
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
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
  }, [step])

  useEffect(() => {
    if (step === 'request') {
      emailInputRef.current?.focus()
    } else if (step === 'confirm') {
      tokenInputRef.current?.focus()
    }
  }, [step])

  // Cleanup backTimer on unmount
  useEffect(() => {
    return () => {
      if (backTimerRef.current) clearTimeout(backTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (email && !EMAIL_REGEX.test(email)) {
      setEmailError(t('auth.error.invalidEmail', 'Invalid email format'))
    } else {
      setEmailError('')
    }
  }, [email, t])

  useEffect(() => {
    if (newPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t('auth.error.passwordLength', `Minimum {{min}} characters`, { min: MIN_PASSWORD_LENGTH }))
    } else {
      setPasswordError('')
    }
  }, [newPassword, t])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!EMAIL_REGEX.test(email)) {
      setEmailError(t('auth.error.invalidEmail', 'Invalid email format'))
      return
    }

    clearError()
    setSuccessMessage('')

    try {
      await resetPassword({ email })
      // Токен будет обработан через useEffect от lastResetToken
    } catch (err) {
      logger.warn('Password reset request failed:', err)
      // Ошибка уже установлена в контексте
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t('auth.error.passwordLength', 'Minimum {{min}} characters', { min: MIN_PASSWORD_LENGTH }))
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t('auth.error.passwordsMismatch', 'Passwords do not match'))
      return
    }

    try {
      await confirmPasswordReset({ token, newPassword, confirmPassword })
      setSuccessMessage(t('auth.passwordChanged', 'Password changed successfully!'))
      if (backTimerRef.current) clearTimeout(backTimerRef.current)
      backTimerRef.current = setTimeout(() => onBack(), 2000)
    } catch (err) {
      logger.warn('Password confirm reset failed:', err)
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
      className="w-full max-w-sm"
    >
      <div className="bg-dark-800/80 border border-dark-700/50 rounded-lg p-6">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-dark-100 mb-1">
            {step === 'request' ? t('auth.resetPassword') : t('auth.resetPasswordNew', 'New password')}
          </h1>
          <p className="text-dark-400 text-sm">
            {step === 'request'
              ? t('auth.enterEmailForReset', 'Enter your email to reset password')
              : t('auth.enterCodeAndPassword', 'Enter the code and set a new password')}
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-5 p-3 bg-error/10 border border-error/30 rounded-md flex items-start gap-2.5">
            <svg className="w-4 h-4 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-error text-sm font-medium">{t('auth.error.title', 'Error')}</p>
              <p className="text-error/70 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Успех */}
        {successMessage && (
          <div className="mb-5 p-3 bg-success/10 border border-success/30 rounded-md flex items-start gap-2.5">
            <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-success text-sm">{successMessage}</p>
          </div>
        )}

        {/* Сообщение с кодом */}
        {step === 'confirm' && (
          <div className="mb-5 p-3 bg-success/10 border border-success/30 rounded-md">
            <p className="text-sm font-medium text-success mb-1">{t('auth.codeSent', 'Code generated')}</p>
            <p className="text-xs text-dark-400">
              {t('auth.enterCodeHint', 'Enter the code above and set a new password')}
            </p>
          </div>
        )}

        {/* Форма запроса */}
        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-3.5">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-medium text-dark-400 mb-1.5 uppercase tracking-wider">
                {t('auth.email')}
              </label>
              <input
                id="reset-email"
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="your@email.com"
                required
                className={`w-full bg-dark-900/50 border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  emailError ? 'border-error/50 focus:ring-error' : 'border-dark-600'
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
              disabled={isLoading || !email || !!emailError}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.sending', 'Sending...')}
                </>
              ) : (
                t('auth.sendInstructions', 'Send instructions')
              )}
            </button>
          </form>
        )}

        {/* Форма подтверждения */}
        {step === 'confirm' && (
          <form onSubmit={handleConfirmReset} className="space-y-3.5">
            <div>
              <label htmlFor="reset-token" className="block text-xs font-medium text-dark-400 mb-1.5 uppercase tracking-wider">
                {t('auth.codeLabel', 'Code from email')}
              </label>
              <input
                id="reset-token"
                ref={tokenInputRef}
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="ABC123"
                required
                readOnly={!!lastResetToken?.token}
                className="w-full bg-dark-900/50 border border-dark-600 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors text-center tracking-wider uppercase"
              />
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className={`text-xs font-mono ${timeLeft < 60 ? 'text-error animate-pulse' : 'text-dark-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="reset-new-password" className="block text-xs font-medium text-dark-400 mb-1.5 uppercase tracking-wider">
                {t('auth.newPassword', 'New password')}
              </label>
              <input
                id="reset-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                required
                minLength={8}
                className={`w-full bg-dark-900/50 border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  passwordError ? 'border-error/50 focus:ring-error' : 'border-dark-600'
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
              <label htmlFor="reset-confirm-password" className="block text-xs font-medium text-dark-400 mb-1.5 uppercase tracking-wider">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-dark-900/50 border border-dark-600 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-success-600 hover:bg-success-500 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.saving', 'Saving...')}
                </>
              ) : (
                t('auth.changePassword')
              )}
            </button>
          </form>
        )}

        {/* Кнопка назад */}
        <div className="mt-5 pt-4 border-t border-dark-700/50">
          <button
            onClick={onBack}
            className="w-full py-2.5 bg-dark-900/50 hover:bg-dark-700 border border-dark-600 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('action.back')}
          </button>
        </div>

        {/* Подсказка */}
        {step === 'request' && (
          <div className="mt-4 p-3 bg-dark-900/30 border border-dark-700/30 rounded-md">
            <p className="text-xs text-dark-500">
              {t('auth.resetHintText', 'Enter the email address associated with your account.')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
