import { memo } from 'react'
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
    key,
    toggle,
    setGenre,
    setTempo,
    setVolume,
    setKey,
    availableGenres,
    availableKeys,
  } = useMusicGenerator()

  const currentGenreInfo = availableGenres.find(g => g.value === genre)

  return (
    <div className={`glass rounded-xl p-4 ${className}`}>
      {/* Заголовок и кнопка play/pause */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isPlaying ? 'bg-primary-500 animate-pulse' : 'bg-dark-800'
          }`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isPlaying ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              )}
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">{t('music.title')}</h3>
            <p className="text-xs text-dark-400">{currentGenreInfo?.description}</p>
          </div>
        </div>

        <button
          onClick={toggle}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isPlaying
              ? 'bg-error/20 text-error hover:bg-error/30'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {isPlaying ? t('action.stop') : t('action.start')}
        </button>
      </div>

      {/* Выбор жанра */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
          <span>🎵</span>
          {t('music.genre')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableGenres.map((g) => (
            <button
              key={g.value}
              onClick={() => setGenre(g.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                genre === g.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
              title={g.description}
            >
              <span className="text-lg">{g.icon}</span>
              <span className="block text-xs mt-1">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Настройки */}
      <div className="grid grid-cols-2 gap-4">
        {/* Темп */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            🎯 {t('music.tempo')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="flex-1 h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              disabled={!isPlaying}
            />
            <span className="text-sm font-bold text-primary-400 w-12 text-right">{tempo}</span>
          </div>
          <p className="text-xs text-dark-500 mt-1">BPM</p>
        </div>

        {/* Громкость */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            🔊 {t('music.volume')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="flex-1 h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <span className="text-sm font-bold text-primary-400 w-12 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Тональность */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">
          🎼 {t('music.key')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {availableKeys.map((k) => (
            <button
              key={k.value}
              onClick={() => setKey(k.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                key === k.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {/* Индикатор активности */}
      {isPlaying && (
        <div className="mt-4 flex items-center gap-2 text-xs text-success">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          {t('music.playing')}
        </div>
      )}
    </div>
  )
})
