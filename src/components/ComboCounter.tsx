import { useEffect, useState } from 'react'

interface ComboCounterProps {
  combo: number
  maxCombo: number
  onComboBreak?: () => void
}

export function ComboCounter({ combo, maxCombo, onComboBreak }: ComboCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevCombo, setPrevCombo] = useState(combo)
  const [showBreak, setShowBreak] = useState(false)

  useEffect(() => {
    if (combo > prevCombo) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
    } else if (combo === 0 && prevCombo > 0) {
      setShowBreak(true)
      onComboBreak?.()
      setTimeout(() => setShowBreak(false), 2000)
    }
    setPrevCombo(combo)
  }, [combo, prevCombo, onComboBreak])

  if (combo === 0 && !showBreak) return null

  const getComboLevel = () => {
    if (combo >= 100) return { level: 'legendary', color: 'from-yellow-500 to-orange-500', label: 'ЛЕГЕНДА!' }
    if (combo >= 50) return { level: 'epic', color: 'from-purple-500 to-pink-500', label: 'ЭПИК!' }
    if (combo >= 25) return { level: 'great', color: 'from-blue-500 to-cyan-500', label: 'ОТЛИЧНО!' }
    if (combo >= 10) return { level: 'good', color: 'from-green-500 to-emerald-500', label: 'ХОРОШО!' }
    return { level: 'normal', color: 'from-gray-500 to-gray-600', label: 'КОМБО' }
  }

  const comboLevel = getComboLevel()
  const progress = Math.min((combo / 100) * 100, 100)

  return (
    <div className="fixed top-20 right-4 z-30">
      {showBreak ? (
        <div className="animate-bounce">
          <div className="card p-4 bg-red-500/20 border-2 border-red-500">
            <div className="text-center">
              <div className="text-3xl mb-2">💔</div>
              <p className="text-sm font-bold text-red-400">КОМБО ПРЕРВАНО!</p>
              <p className="text-xs text-dark-400 mt-1">
                Было: {prevCombo}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`card p-4 transition-all duration-300 ${
            isAnimating ? 'scale-110' : 'scale-100'
          }`}
        >
          {/* Combo number */}
          <div className="text-center mb-3">
            <div
              className={`text-4xl font-bold bg-gradient-to-r ${comboLevel.color} bg-clip-text text-transparent mb-1`}
            >
              {combo}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-dark-400">
                {comboLevel.label}
              </span>
              {combo >= 10 && <span className="text-lg">🔥</span>}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="w-32 h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 bg-gradient-to-r ${comboLevel.color}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Max combo */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-500">Макс:</span>
            <span className="font-semibold text-dark-400">{maxCombo}</span>
          </div>

          {/* Milestones */}
          {combo > 0 && (
            <div className="mt-3 pt-3 border-t border-dark-700">
              <div className="flex justify-between text-xs">
                <Milestone reached={combo >= 10} label="10" />
                <Milestone reached={combo >= 25} label="25" />
                <Milestone reached={combo >= 50} label="50" />
                <Milestone reached={combo >= 100} label="100" />
              </div>
            </div>
          )}

          {/* Particles effect for high combos */}
          {combo >= 50 && isAnimating && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Milestone({ reached, label }: { reached: boolean; label: string }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
        reached
          ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white scale-110'
          : 'bg-dark-800 text-dark-500'
      }`}
    >
      {label}
    </div>
  )
}
