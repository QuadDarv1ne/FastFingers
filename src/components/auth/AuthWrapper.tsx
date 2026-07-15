import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Login } from './Login'
import { Register } from './Register'
import { PasswordReset } from './PasswordReset'
import { ThemeToggle } from '../ThemeToggle'
import { useThemeContext } from '@hooks/useThemeContext'
import { useAppTranslation } from '../../i18n/config'

type AuthView = 'login' | 'register' | 'reset'

interface AuthWrapperProps {
  onSuccess: () => void
}

export function AuthWrapper({ onSuccess }: AuthWrapperProps) {
  const { t } = useAppTranslation()
  const [view, setView] = useState<AuthView>('login')
  const { theme, themeOption, setTheme, setThemeOption } = useThemeContext()

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Subtle grid pattern background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Переключатель темы — positioned above toasts */}
      <div className="fixed top-4 right-4 z-[110]">
        <ThemeToggle
          theme={theme}
          themeOption={themeOption}
          onThemeChange={setTheme}
          onThemeOptionChange={setThemeOption}
        />
      </div>

      {/* Контент */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Login
                onSwitchToRegister={() => setView('register')}
                onSwitchToReset={() => setView('reset')}
                onLoginSuccess={onSuccess}
              />
            </motion.div>
          )}

          {view === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Register
                onSwitchToLogin={() => setView('login')}
                onRegisterSuccess={onSuccess}
              />
            </motion.div>
          )}

          {view === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PasswordReset onBack={() => setView('login')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Логотип */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2.5 mb-1.5">
            <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-dark-200">FastFingers</span>
          </div>
          <p className="text-dark-500 text-xs tracking-wide uppercase">{t('misc.footer', 'Touch typing trainer')}</p>
        </div>
      </div>
    </div>
  )
}
