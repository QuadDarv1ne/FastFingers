import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppTranslation } from '../i18n/config'
import i18n from 'i18next'

interface ClockWidgetProps {
  showSeconds?: boolean
  format24h?: boolean
}

function ClockWidget({ showSeconds = true, format24h = true }: ClockWidgetProps) {
  const { t } = useAppTranslation()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date): string => {
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    let period = ''

    if (!format24h) {
      period = hours >= 12 ? ' PM' : ' AM'
      hours = hours % 12 || 12
    }

    const hoursStr = hours.toString().padStart(2, '0')
    const minutesStr = minutes.toString().padStart(2, '0')
    const secondsStr = seconds.toString().padStart(2, '0')

    if (showSeconds) {
      return `${hoursStr}:${minutesStr}:${secondsStr}${period}`
    }
    return `${hoursStr}:${minutesStr}${period}`
  }

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }
    return date.toLocaleDateString(i18n.language, options)
  }

  const timeStr = formatTime(time)
  const sec = time.getSeconds()

  return (
    <div className="glass rounded-xl p-3.5 text-center" role="timer" aria-label={t('common.time')}>
      <div className="text-xl font-bold font-mono tracking-wider" aria-live="polite" aria-atomic="true">
        <span>{timeStr.split(':')[0]}</span>
        <span className="text-primary-400 mx-0.5" style={{ opacity: sec % 2 === 0 ? 1 : 0.3 }}>:</span>
        <span>{timeStr.split(':')[1]}</span>
        {showSeconds && (
          <>
            <span className="text-primary-400 mx-0.5" style={{ opacity: sec % 2 === 0 ? 1 : 0.3 }}>:</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={sec}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.08 }}
              >
                {timeStr.split(':')[2]}
              </motion.span>
            </AnimatePresence>
          </>
        )}
      </div>
      <div className="text-[10px] text-dark-500 font-medium mt-0.5">{formatDate(time)}</div>
    </div>
  )
}

export default memo(ClockWidget)
