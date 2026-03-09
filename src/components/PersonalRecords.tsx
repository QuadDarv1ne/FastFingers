import { memo } from 'react'
import { useAdvancedStats } from '@hooks/useAdvancedStats'
import { useAppTranslation } from '../i18n/config'
import { formatDurationLong } from '../utils/format'

interface PersonalRecordsProps {
  className?: string
}

export const PersonalRecords = memo(function PersonalRecords({ className = '' }: PersonalRecordsProps) {
  const { t } = useAppTranslation()
  const { personalRecords } = useAdvancedStats()

  const records = [
    {
      label: t('stats.bestWpm'),
      value: personalRecords.bestWpm.toString(),
      icon: '⚡',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      label: t('stats.bestAccuracy'),
      value: `${personalRecords.bestAccuracy}%`,
      icon: '🎯',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: t('stats.bestCpm'),
      value: personalRecords.bestCpm.toString(),
      icon: '📝',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: t('stats.totalSessions'),
      value: personalRecords.totalSessions.toString(),
      icon: '📊',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: t('stats.totalTime'),
      value: formatDurationLong(personalRecords.totalTime),
      icon: '⏱️',
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
    {
      label: t('stats.longestStreak'),
      value: personalRecords.longestStreak.toString(),
      icon: '🔥',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
  ]

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {records.map(record => (
        <div
          key={record.label}
          className={`${record.bg} rounded-xl p-4 text-center hover:scale-105 transition-transform`}
        >
          <div className={`text-2xl mb-2 ${record.color}`}>{record.icon}</div>
          <div className="text-2xl font-bold text-white">{record.value}</div>
          <div className="text-xs text-dark-400 mt-1">{record.label}</div>
        </div>
      ))}
    </div>
  )
})
