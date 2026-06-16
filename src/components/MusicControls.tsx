import { memo } from 'react'
import { motion } from 'framer-motion'
import { useMusicGenerator } from '@hooks/useMusicGenerator'
import { useAppTranslation } from '../i18n/config'

interface MusicControlsProps {
  className?: string
}

export const MusicControls = memo(function MusicControls({ className = '' }: MusicControlsProps) {
  const { t } = useAppTranslation()
  const {
    isPlaying,
    genre,
    tempo,
    volume,
    toggle,
    setGenre,
    setTempo,
    setVolume,
    availableGenres,
  } = useMusicGenerator()

  const currentGenreInfo = availableGenres.find(g => g.value === genre) ?? availableGenres[0]

  return (
    <div className={`glass rounded-xl p-3.5 ${className}`}>
      {/* Header with play/pause */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isPlaying ? 'bg-primary-500 shadow-sm shadow-primary-500/30' : 'bg-dark-800/60 hover:bg-dark-700/60'
            }`}
            aria-label={isPlaying ? t('action.stop') : t('action.start')}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>
          <div>
            <h3 className="text-xs font-semibold text-dark-200">{t('music.title')}</h3>
            <p className="text-[9px] text-dark-500 font-medium">{currentGenreInfo?.description || '—'}</p>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[9px] text-green-400 font-medium">{t('music.playing')}</span>
          </div>
        )}
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {availableGenres.map((g) => (
          <button
            key={g.value}
            onClick={() => setGenre(g.value)}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              genre === g.value
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'bg-dark-800/40 text-dark-400 hover:bg-dark-700/40 border border-transparent'
            }`}
            title={g.description}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      {/* Tempo + Volume sliders */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-dark-500 w-8">🎯 BPM</span>
          <input
            type="range"
            min="60"
            max="180"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="flex-1 h-1.5 bg-dark-800/60 rounded-full appearance-none cursor-pointer accent-primary-500"
          />
          <span className="text-[10px] font-bold text-primary-400 w-8 text-right font-mono">{tempo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-dark-500 w-8">🔊 Vol</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="flex-1 h-1.5 bg-dark-800/60 rounded-full appearance-none cursor-pointer accent-primary-500"
          />
          <span className="text-[10px] font-bold text-primary-400 w-8 text-right font-mono">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  )
})
