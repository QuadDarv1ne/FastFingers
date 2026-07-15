import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@hooks/useAuth'
import { useAppTranslation } from '../../i18n/config'
import { logger } from '@utils/logger'
import { MIN_PASSWORD_LENGTH } from '../../services/authErrors'

interface LoginProps {
  onSwitchToRegister: () => void
  onSwitchToReset: () => void
  onLoginSuccess: () => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Login({ onSwitchToRegister, onSwitchToReset, onLoginSuccess }: LoginProps) {
  const { t } = useAppTranslation()
  const { login, isLoading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (email && !EMAIL_REGEX.test(email)) {
      setEmailError(t('auth.error.invalidEmail', 'Invalid email format'))
    } else {
      setEmailError('')
    }
  }, [email, t])

  useEffect(() => {
    if (password && password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t('auth.error.passwordLength', `Password must be at least {{min}} characters`, { min: MIN_PASSWORD_LENGTH }))
    } else {
      setPasswordError('')
    }
  }, [password, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!EMAIL_REGEX.test(email)) {
      setEmailError(t('auth.error.invalidEmail', 'Invalid email format'))
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t('auth.error.passwordLength', `Password must be at least {{min}} characters`, { min: MIN_PASSWORD_LENGTH }))
      return
    }
    
    clearError()

    try {
      await login({ email, password, rememberMe })
      onLoginSuccess()
    } catch (err) {
      logger.error('[Login] Login failed', err)
      // Ошибка уже установлена в контексте auth
    }
  }

  const isFormValid = email && password && !emailError && !passwordError

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      handleSubmit(e)
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
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-dark-100 mb-1">{t('auth.welcomeBackFull', 'Welcome back')}</h1>
          <p className="text-dark-400 text-sm">{t('auth.loginSubtitle', 'Log in to continue training')}</p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-5 p-3 bg-error/10 border border-error/30 rounded-md flex items-start gap-2.5">
            <svg className="w-4 h-4 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-error text-sm font-medium">{t('auth.error.loginError', 'Login error')}</p>
              <p className="text-error/70 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-dark-400 mb-1.5 uppercase tracking-wider">
              {t('auth.email')}
            </label>
            <input
              id="login-email"
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

          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-dark-400 mb-1.5 uppercase tracking-wider">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                required
                className="w-full bg-dark-900/50 border border-dark-600 rounded-md px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {passwordError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-dark-900 border-dark-600 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-dark-400">{t('auth.rememberMe')}</span>
            </label>
            <button
              type="button"
              onClick={onSwitchToReset}
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              {t('auth.forgotPassword')}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('auth.loggingIn', 'Logging in...')}
              </>
            ) : (
              t('auth.login')
            )}
          </button>
        </form>

        {/* Переключатель */}
        <div className="mt-5 pt-4 border-t border-dark-700/50 text-center">
          <p className="text-dark-400 text-sm">
            {t('auth.noAccount')}{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {t('auth.register')}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
