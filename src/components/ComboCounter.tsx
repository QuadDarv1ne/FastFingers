import { motion, AnimatePresence } from 'framer-motion'

interface ComboCounterProps {
  combo: number
  maxCombo: number
}

export function ComboCounter({ combo, maxCombo }: ComboCounterProps) {
  const getComboLevel = (combo: number) => {
    if (combo >= 50) return { level: 'legendary', color: 'from-purple-600 to-pink-600', emoji: '🔥', text: 'ЛЕГЕНДА!' }
    if (combo >= 30) return { level: 'epic', color: 'from-orange-600 to-red-600', emoji: '⚡', text: 'ЭПИК!' }
    if (combo >= 20) return { level: 'great', color: 'from-yellow-600 to-orange-600', emoji: '✨', text: 'ОТЛИЧНО!' }
    if (combo >= 10) return { level: 'good', color: 'from-blue-600 to-cyan-600', emoji: '👍', text: 'ХОРОШО!' }
    return { level: 'normal', color: 'from-gray-600 to-gray-500', emoji: '💪', text: 'КОМБО' }
  }

  if (combo < 5) return null

  const { color, emoji, text } = getComboLevel(combo)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: 'spring', damping: 15 }}
        className="fixed top-32 right-6 z-40"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className={`
            relative px-6 py-4 rounded-2xl
            bg-gradient-to-r ${color}
            shadow-2xl border-2 border-white/20
            backdrop-blur-xl
          `}
        >
          {/* Эффект свечения */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-50 blur-xl`} />
          
          <div className="relative">
            <div className="flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-4xl"
              >
                {emoji}
              </motion.span>
              <div>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{text}</p>
                <motion.p
                  key={combo}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-black text-white"
                >
                  {combo}x
                </motion.p>
              </div>
            </div>
            
            {/* Прогресс до следующего уровня */}
            {combo < 50 && (
              <div className="mt-2">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((combo % 10) / 10) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Частицы */}
          {combo >= 20 && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 100],
                    y: [0, -100],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Рекорд */}
        {maxCombo > combo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-center"
          >
            <p className="text-xs text-dark-400 font-medium">
              🏆 Рекорд: <span className="text-primary-400 font-bold">{maxCombo}x</span>
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
