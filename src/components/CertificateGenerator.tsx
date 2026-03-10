import { memo, useState, useMemo, useRef, useEffect } from 'react'
import { User } from '../types/auth'
import { generateCertificate, calculateRank, CertificateData } from '../utils/certificate'
import { useFocusTrap } from '@hooks/useFocusTrap'

interface CertificateGeneratorProps {
  user: User
  wpm: number
  accuracy: number
  cpm: number
  testType: '15s' | '30s' | '60s' | '120s' | 'sprint' | 'hardcore'
  level?: number
  streak?: number
  onClose: () => void
}

type CertificateTheme = 'classic' | 'modern' | 'neon'
type CertificateLanguage = 'ru' | 'en'

export const CertificateGenerator = memo<CertificateGeneratorProps>(function CertificateGenerator({
  user,
  wpm,
  accuracy,
  cpm,
  testType,
  level,
  streak,
  onClose,
}: CertificateGeneratorProps) {
  const [theme, setTheme] = useState<CertificateTheme>('classic')
  const [language, setLanguage] = useState<CertificateLanguage>('ru')
  const [isGenerating, setIsGenerating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useFocusTrap(containerRef, true)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const rank = useMemo(() => calculateRank(wpm, accuracy), [wpm, accuracy])

  const certificateData: CertificateData = {
    user,
    testType,
    wpm,
    accuracy,
    cpm,
    date: new Date().toISOString(),
    rank,
    level,
    streak,
  }

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      await generateCertificate(certificateData, {
        language,
        download: true,
        theme,
      })
    } catch {
      // Error handled silently
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    try {
      const blob = await generateCertificate(certificateData, {
        language,
        download: false,
        theme,
      })

      const file = new File([blob], 'certificate.pdf', { type: 'application/pdf' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Сертификат FastFingers',
          text: `Мой результат: ${wpm} WPM с точностью ${accuracy}%!`,
          files: [file],
        })
      } else {
        // Fallback - скачивание
        await handleDownload()
      }
    } catch {
      await handleDownload()
    }
  }

  const rankColors = {
    Bronze: 'from-amber-700 to-amber-900',
    Silver: 'from-gray-400 to-gray-600',
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-slate-300 to-slate-500',
    Diamond: 'from-cyan-300 to-cyan-500',
    Master: 'from-purple-600 to-purple-800',
  }

  const rankIcons = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '💎',
    Master: '👑',
  }

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-title"
      aria-describedby="certificate-description"
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div className="glass rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 id="certificate-title" className="text-2xl font-bold flex items-center gap-2">
              <span>📜</span>
              Сертификат достижения
            </h2>
            <p id="certificate-description" className="text-dark-400 text-sm mt-1">
              Ваш результат: <span className="text-primary-400 font-semibold">{wpm} WPM</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Предпросмотр */}
          <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-8 border border-dark-700">
            <div className="text-center space-y-4">
              {/* Ранг */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${rankColors[rank]}`}>
                <span className="text-2xl">{rankIcons[rank]}</span>
                <span className="font-bold text-white">{rank}</span>
              </div>

              {/* Имя */}
              <div>
                <p className="text-dark-400 text-sm">Сертификат выдан</p>
                <h3 className="text-3xl font-bold text-gradient">{user.name}</h3>
              </div>

              {/* Результат */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <StatCard label="Скорость" value={`${wpm} WPM`} icon="⚡" />
                <StatCard label="Точность" value={`${accuracy}%`} icon="🎯" />
                <StatCard label="Символы" value={`${cpm} CPM`} icon="📝" />
                <StatCard label="Ранг" value={rank} icon={rankIcons[rank]} />
              </div>

              {/* Дополнительно */}
              {(level || streak) && (
                <div className="flex items-center justify-center gap-4 text-sm text-dark-400">
                  {level && <span>📊 Уровень {level}</span>}
                  {streak && <span>🔥 Серия {streak} дн.</span>}
                </div>
              )}
            </div>
          </div>

          {/* Настройки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cert-theme" className="block text-sm text-dark-400 mb-2">
                Тема сертификата
              </label>
              <select
                id="cert-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as CertificateTheme)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Тема сертификата"
                aria-describedby="cert-theme-description"
              >
                <option value="classic">📜 Классическая</option>
                <option value="modern">✨ Современная</option>
                <option value="neon">🌟 Неон</option>
              </select>
              <span id="cert-theme-description" className="sr-only">
                Выберите визуальную тему для сертификата
              </span>
            </div>

            <div>
              <label htmlFor="cert-lang" className="block text-sm text-dark-400 mb-2">
                Язык
              </label>
              <select
                id="cert-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value as CertificateLanguage)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Язык сертификата"
                aria-describedby="cert-lang-description"
              >
                <option value="ru">🇷🇺 Русский</option>
                <option value="en">🇬🇧 English</option>
              </select>
              <span id="cert-lang-description" className="sr-only">
                Выберите язык для сертификата
              </span>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-4" role="group" aria-label="Действия с сертификатом">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              aria-busy={isGenerating}
              className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isGenerating ? 'Генерация...' : 'Скачать PDF'}
            </button>

            <button
              onClick={handleShare}
              disabled={isGenerating}
              aria-busy={isGenerating}
              className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Поделиться
            </button>
          </div>

          {/* Информация о рангах */}
          <div className="card p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🏆</span>
              Система рангов
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <RankInfo rank="Bronze" requirement="< 30 WPM" color="text-amber-700" />
              <RankInfo rank="Silver" requirement="30-44 WPM" color="text-gray-500" />
              <RankInfo rank="Gold" requirement="45-59 WPM" color="text-yellow-600" />
              <RankInfo rank="Platinum" requirement="60-79 WPM" color="text-slate-500" />
              <RankInfo rank="Diamond" requirement="80-99 WPM" color="text-cyan-500" />
              <RankInfo rank="Master" requirement="≥ 100 WPM" color="text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.wpm === nextProps.wpm &&
    prevProps.accuracy === nextProps.accuracy &&
    prevProps.cpm === nextProps.cpm &&
    prevProps.testType === nextProps.testType &&
    prevProps.onClose === nextProps.onClose
  )
})

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-dark-900/50 rounded-lg p-3 border border-dark-700">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-dark-400">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  )
}

function RankInfo({ rank, requirement, color }: { rank: string; requirement: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`font-semibold ${color}`}>{rank}</div>
      <div className="text-dark-400 text-xs">{requirement}</div>
    </div>
  )
}
