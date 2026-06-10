/**
 * FastFingers — Тренажёр слепой печати
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 * @license MIT
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { Providers } from './contexts/Providers.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { initSentry } from './utils/sentry'
import './i18n/config'
import './index.css'

initSentry()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Providers>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Providers>
    </ErrorBoundary>
  </React.StrictMode>,
)
