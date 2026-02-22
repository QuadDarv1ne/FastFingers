import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Login } from './Login'
import { Register } from './Register'
import { PasswordReset } from './PasswordReset'

type AuthView = 'login' | 'register' | 'reset'

interface AuthWrapperProps {
  onSuccess: () => void
}

export function AuthWrapper({ onSuccess }: AuthWrapperProps) {
  const [view, setView] = useState<AuthView>('login')

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Фон с градиентом */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Контент */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PasswordReset onBack={() => setView('login')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Логотип */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gradient">FastFingers</span>
          </div>
          <p className="text-dark-400 text-sm">Тренажёр слепой печати</p>
        </div>
      </div>
    </div>
  )
}
