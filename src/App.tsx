import { useState, useEffect } from 'react'
import { TypingTrainer } from './components/TypingTrainer'
import { Header } from './components/Header'
import { Stats } from './components/Stats'
import { Keyboard } from './components/Keyboard'
import { SprintMode } from './components/SprintMode'
import { SpeedTest } from './components/SpeedTest'
import { TrainingHistory } from './components/TrainingHistory'
import { DailyChallengeCard } from './components/DailyChallengeCard'
import { CustomExerciseEditor } from './components/CustomExerciseEditor'
import { ExportImport } from './components/ExportImport'
import { ThemeToggle } from './components/ThemeToggle'
import { TypingTips } from './components/TypingTips'
import { Onboarding } from './components/Onboarding'
import { AchievementsPanel } from './components/AchievementsPanel'
import { UserProgress, UserSettings, TypingStats as TypingStatsType, KeyHeatmapData } from './types'
import { useTypingSound } from './hooks/useTypingSound'
import { useTypingHistory } from './hooks/useTypingHistory'
import { useDailyChallenges } from './hooks/useDailyChallenges'
import { useTheme } from './hooks/useTheme'
import { calculateSessionXp } from './utils/stats'
import { Exercise } from './types'

type GameMode = 'practice' | 'sprint' | 'challenge' | 'speedtest'
type View = 'main' | 'history' | 'custom-exercise' | 'tips'
type SpeedTestDuration = 15 | 30 | 60

function App() {
  const [settings, setSettings] = useState<UserSettings>({
    layout: 'jcuken',
    soundEnabled: true,
    soundVolume: 0.5,
    fontSize: 'medium',
    theme: 'dark',
    showKeyboard: true,
    showStats: true,
  })

  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatmap, setHeatmap] = useState<KeyHeatmapData>({})
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [view, setView] = useState<View>('main')
  const [customExercises, setCustomExercises] = useState<Exercise[]>([])
  const [speedTestDuration, setSpeedTestDuration] = useState<SpeedTestDuration>(30)
  const [showAchievements, setShowAchievements] = useState(false)

  const [progress, setProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalWordsTyped: 0,
    totalPracticeTime: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    streak: 0,
    lastPracticeDate: null,
  })

  const [currentStats, setCurrentStats] = useState<TypingStatsType | null>(null)
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)

  // Онбординг для новых пользователей
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const seen = localStorage.getItem('fastfingers_onboarding_seen')
      return !seen
    } catch {
      return true
    }
  })

  const handleOnboardingComplete = () => {
    localStorage.setItem('fastfingers_onboarding_seen', 'true')
    setShowOnboarding(false)
  }

  // Хуки
  const sound = useTypingSound({ enabled: settings.soundEnabled, volume: settings.soundVolume })
  const { addSession } = useTypingHistory()
  const { todayChallenge, streak, stats: challengeStats, completeChallenge } = useDailyChallenges()
  const { theme, resolvedTheme, setTheme } = useTheme()

  // Обработка начала челленджа
  useEffect(() => {
    const handleStartChallenge = (e: Event) => {
      const customEvent = e as CustomEvent<{ challenge: { id: string } }>
      setActiveChallenge(customEvent.detail.challenge.id)
      setGameMode('challenge')
    }

    window.addEventListener('startChallenge', handleStartChallenge as EventListener)
    return () => window.removeEventListener('startChallenge', handleStartChallenge as EventListener)
  }, [])

  const handleSessionComplete = (stats: TypingStatsType) => {
    setCurrentStats(stats)
    sound.playComplete()
    
    const xp = calculateSessionXp(stats)
    
    addSession(stats, xp)
    
    // Завершение челленджа если активен
    if (activeChallenge && todayChallenge) {
      completeChallenge(activeChallenge, stats.wpm, stats.accuracy)
      setActiveChallenge(null)
    }
    
    // Обновление прогресса
    setProgress(prev => {
      const newXp = prev.xp + xp
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1
      
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: Math.pow(newLevel + 1, 2) * 100,
        totalWordsTyped: prev.totalWordsTyped + Math.floor(stats.correctChars / 5),
        bestWpm: Math.max(prev.bestWpm, stats.wpm),
        bestAccuracy: Math.max(prev.bestAccuracy, stats.accuracy),
      }
    })
  }

  const handleKeyInput = (key: string, isCorrect: boolean) => {
    setHeatmap(prev => {
      const newHeatmap = { ...prev }
      if (!newHeatmap[key]) {
        newHeatmap[key] = { errors: 0, total: 0, accuracy: 100 }
      }
      newHeatmap[key].total++
      if (!isCorrect) {
        newHeatmap[key].errors++
      }
      newHeatmap[key].accuracy = Math.round(
        ((newHeatmap[key].total - newHeatmap[key].errors) / newHeatmap[key].total) * 100
      )
      return newHeatmap
    })
  }

  const handleSaveCustomExercise = (exercise: Exercise) => {
    setCustomExercises(prev => [...prev, exercise])
    setView('main')
    setGameMode('practice')
  }

  const handleImportProgress = (data: { progress: UserProgress }) => {
    setProgress(data.progress)
  }

  return (
    <div className="min-h-screen bg-dark-900 transition-colors duration-300">
      <Header
        level={progress.level}
        xp={progress.xp}
        xpToNextLevel={progress.xpToNextLevel}
      />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Верхняя панель */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Переключатель режимов */}
          <div className="glass rounded-xl p-1 inline-flex flex-wrap">
            <button
              onClick={() => { setGameMode('practice'); setView('main') }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                gameMode === 'practice' && view === 'main'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              📝 Практика
            </button>
            <button
              onClick={() => { setGameMode('sprint'); setView('main') }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                gameMode === 'sprint'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              ⚡ Спринт
            </button>
            <div className="relative group">
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  gameMode === 'speedtest'
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
                onClick={() => setGameMode('speedtest')}
              >
                🕐 Тест
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Выпадающее меню */}
              <div className="absolute top-full left-0 mt-1 glass rounded-lg p-1 hidden group-hover:block z-10">
                <button
                  onClick={() => { setSpeedTestDuration(15); setGameMode('speedtest') }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-dark-800 rounded transition-colors"
                >
                  15 секунд
                </button>
                <button
                  onClick={() => { setSpeedTestDuration(30); setGameMode('speedtest') }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-dark-800 rounded transition-colors"
                >
                  30 секунд
                </button>
                <button
                  onClick={() => { setSpeedTestDuration(60); setGameMode('speedtest') }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-dark-800 rounded transition-colors"
                >
                  60 секунд
                </button>
              </div>
            </div>
            <button
              onClick={() => setView('custom-exercise')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'custom-exercise'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              ✏️ Своё
            </button>
            <button
              onClick={() => setView('tips')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'tips'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              💡 Советы
            </button>
          </div>

          {/* Тема */}
          <ThemeToggle theme={theme} resolvedTheme={resolvedTheme} onThemeChange={setTheme} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная зона */}
          <div className="lg:col-span-2 space-y-6">
            {view === 'history' ? (
              <TrainingHistory onBack={() => setView('main')} />
            ) : view === 'custom-exercise' ? (
              <CustomExerciseEditor
                onSave={handleSaveCustomExercise}
                onCancel={() => setView('main')}
              />
            ) : view === 'tips' ? (
              <TypingTips />
            ) : gameMode === 'sprint' ? (
              <SprintMode
                onExit={() => setGameMode('practice')}
                onComplete={handleSessionComplete}
                sound={sound}
              />
            ) : gameMode === 'speedtest' ? (
              <SpeedTest
                duration={speedTestDuration}
                onExit={() => setGameMode('practice')}
                onComplete={handleSessionComplete}
                sound={sound}
              />
            ) : (
              <>
                {/* Карточка ежедневного челленджа */}
                {todayChallenge && gameMode !== 'challenge' && (
                  <DailyChallengeCard
                    challenge={todayChallenge}
                    streak={streak}
                    onComplete={completeChallenge}
                  />
                )}

                <TypingTrainer
                  layout={settings.layout}
                  fontSize={settings.fontSize}
                  onSessionComplete={handleSessionComplete}
                  onKeyInput={handleKeyInput}
                  sound={sound}
                  customExercises={customExercises}
                  isChallenge={gameMode === 'challenge'}
                  challengeText={gameMode === 'challenge' && todayChallenge ? todayChallenge.text : undefined}
                />

                {settings.showKeyboard && (
                  <Keyboard
                    layout={settings.layout}
                    highlightKey={null}
                    heatmap={heatmap}
                    showHeatmap={showHeatmap}
                    onToggleHeatmap={setShowHeatmap}
                  />
                )}
              </>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {settings.showStats && (
              <Stats
                progress={progress}
                currentStats={currentStats}
                onViewHistory={() => setView('history')}
                onViewAchievements={() => setShowAchievements(true)}
                challengeStats={challengeStats}
              />
            )}

            {/* Настройки */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Настройки</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">
                    Раскладка
                  </label>
                  <select
                    value={settings.layout}
                    onChange={(e) => setSettings({ ...settings, layout: e.target.value as 'qwerty' | 'jcuken' | 'dvorak' })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="jcuken">ЙЦУКЕН</option>
                    <option value="qwerty">QWERTY</option>
                    <option value="dvorak">Dvorak</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-400">Звук</span>
                  <button
                    onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-primary-600' : 'bg-dark-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-400">Клавиатура</span>
                  <button
                    onClick={() => setSettings({ ...settings, showKeyboard: !settings.showKeyboard })}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.showKeyboard ? 'bg-primary-600' : 'bg-dark-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.showKeyboard ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Экспорт/Импорт */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Данные</h3>
              <ExportImport progress={progress} onImport={handleImportProgress} />
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-dark-400 text-sm">
        <p>FastFingers © 2026 — Тренажёр слепой печати</p>
      </footer>

      {/* Онбординг для новых пользователей */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Панель достижений */}
      {showAchievements && (
        <AchievementsPanel
          progress={progress}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  )
}

export default App
