/**
 * FastFingers — Тренажёр слепой печати
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 * @license MIT
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx'
import { Providers } from './contexts/Providers.tsx'
import { initSentry } from './utils/sentry'
import { useCloudSyncCleanup } from './services/cloudSyncService'
import './i18n/config'
import './index.css'

initSentry()

// Ensure cloud sync service event listeners are cleaned up on unmount
function CloudSyncCleanup() {
  useCloudSyncCleanup()
  return null
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Providers>
        <CloudSyncCleanup />
        <App />
      </Providers>
    </AppErrorBoundary>
  </React.StrictMode>,
)
