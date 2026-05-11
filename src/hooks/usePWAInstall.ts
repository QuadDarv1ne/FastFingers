/**
 * usePWAInstall — Хук для управления установкой PWA
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useEffect, useCallback } from 'react'
import { logger } from '../utils/logger'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallState {
  isSupported: boolean
  isReady: boolean
  isInstalled: boolean
  promptEvent: BeforeInstallPromptEvent | null
}

export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallState>({
    isSupported: false,
    isReady: false,
    isInstalled: false,
    promptEvent: null,
  })

  // Check if app is already installed
  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    setState(prev => ({ ...prev, isInstalled }))
  }, [])

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent

      setState(prev => ({
        ...prev,
        isSupported: true,
        isReady: true,
        promptEvent,
      }))
    }

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isReady: false,
        promptEvent: null,
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!state.promptEvent) return { outcome: 'dismissed' as const }

    try {
      state.promptEvent.prompt()
      const { outcome } = await state.promptEvent.userChoice

      if (outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          isReady: false,
          promptEvent: null,
        }))
      }

      return { outcome }
    } catch (error) {
      logger.error('Error prompting install:', error)
      return { outcome: 'dismissed' as const }
    }
  }, [state.promptEvent])

  const dismissPrompt = useCallback(() => {
    setState(prev => ({
      ...prev,
      isReady: false,
      promptEvent: null,
    }))
  }, [])

  return {
    ...state,
    promptInstall,
    dismissPrompt,
  }
}
