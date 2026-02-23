import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx'
import { Providers } from './contexts/Providers.tsx'
import { initSentry } from './utils/sentry'
import './index.css'

// Инициализация Sentry
initSentry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Providers>
        <App />
      </Providers>
    </AppErrorBoundary>
  </React.StrictMode>,
)
