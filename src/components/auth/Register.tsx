import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@hooks/useAuth'

interface RegisterProps {
  onSwitchToLogin: () => void
  onRegisterSuccess: () => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export function Register({ onSwitchToLogin, onRegisterSuccess }: RegisterProps) {
  const { register, isLoading, error, clearError } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (email && !EMAIL_REGEX.test(email)) {
      setEmailError('Неверный формат email')
    } else {
      setEmailError('')
    }
  }, [email])

  useEffect(() => {
    if (password && password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Минимум ${MIN_PASSWORD_LENGTH} символов`)
    } else {
      setPasswordError('')
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Неверный формат email')
      return
    }
    
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Минимум ${MIN_PASSWORD_LENGTH} символов`)
      return
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают')
      return
    }
    
    if (!agreeToTerms) {
      return
    }
    
    clearError()

    try {
      await register({ email, password, confirmPassword, name, agreeToTerms })
      onRegisterSuccess()
    } catch {
      // Ошибка уже установлена в контексте
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      handleSubmit(e)
    }
  }

  const passwordStrength = (() => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return strength
  })()

  const isFormValid = 
    name.trim() && 
    email && 
    !emailError && 
    password && 
    !passwordError && 
    confirmPassword && 
    password === confirmPassword && 
    agreeToTerms

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass rounded-2xl p-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Создать аккаунт</h1>
          <p className="text-dark-400">Присоединяйтесь к FastFingers</p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 p-4 bg-error/20 border border-error/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-error font-medium">Ошибка регистрации</p>
              <p className="text-error/80 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Имя
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Иван Иванов"
              required
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Email
            </label>
            <input
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

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                required
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Индикатор сложности пароля */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= passwordStrength
                          ? passwordStrength <= 2
                            ? 'bg-error'
                            : passwordStrength <= 4
                            ? 'bg-yellow-400'
                            : 'bg-success'
                          : 'bg-dark-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-dark-500">
                  {passwordStrength <= 2 ? 'Слабый пароль' :
                   passwordStrength <= 4 ? 'Хороший пароль' :
                   'Отличный пароль'}
                </p>
                {passwordError && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordError}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Подтверждение пароля
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              required
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-error mt-1">Пароли не совпадают</p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 rounded bg-dark-800 border-dark-700 text-primary-600 focus:ring-primary-500 mt-0.5"
              />
              <span className="text-sm text-dark-400">
                Я принимаю{' '}
                <a href="#" className="text-primary-400 hover:underline">
                  условия использования
                </a>{' '}
                и{' '}
                <a href="#" className="text-primary-400 hover:underline">
                  политику конфиденциальности
                </a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full py-3 bg-success-600 hover:bg-success-500 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Регистрация...
              </>
            ) : (
              'Создать аккаунт'
            )}
          </button>
        </form>

        {/* Переключатель */}
        <div className="mt-6 text-center">
          <p className="text-dark-400">
            Уже есть аккаунт?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
