import { useState, useCallback } from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys'

export interface ModalState {
  showAchievements: boolean
  showSessionSummary: boolean
  showStreakRewards: boolean
  showProfile: boolean
  showGoals: boolean
  showOnboarding: boolean
  activeChallenge: string | null
  lastSessionXp: number
}

export interface ModalActions {
  setShowAchievements: (show: boolean) => void
  setShowSessionSummary: (show: boolean) => void
  setShowStreakRewards: (show: boolean) => void
  setShowProfile: (show: boolean) => void
  setShowGoals: (show: boolean) => void
  setShowOnboarding: (show: boolean) => void
  setActiveChallenge: (challengeId: string | null) => void
  setLastSessionXp: (xp: number) => void
  handleOnboardingComplete: () => void
  closeAllModals: () => void
}

export interface UseModalsReturn extends ModalState, ModalActions {}

export function useModals(): UseModalsReturn {
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [showStreakRewards, setShowStreakRewards] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEYS.ONBOARDING)
      return !seen
    } catch {
      return true
    }
  })
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)
  const [lastSessionXp, setLastSessionXp] = useState(0)

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true')
    setShowOnboarding(false)
  }, [])

  const closeAllModals = useCallback(() => {
    setShowAchievements(false)
    setShowSessionSummary(false)
    setShowStreakRewards(false)
    setShowProfile(false)
    setShowGoals(false)
    setShowOnboarding(false)
    setActiveChallenge(null)
  }, [])

  return {
    showAchievements,
    showSessionSummary,
    showStreakRewards,
    showProfile,
    showGoals,
    showOnboarding,
    activeChallenge,
    lastSessionXp,
    setShowAchievements,
    setShowSessionSummary,
    setShowStreakRewards,
    setShowProfile,
    setShowGoals,
    setShowOnboarding,
    setActiveChallenge,
    setLastSessionXp,
    handleOnboardingComplete,
    closeAllModals,
  }
}