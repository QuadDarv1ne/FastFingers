import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ClockWidgetProps {
  compact?: boolean
}

export function ClockWidget({ compact = false }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }
  const dateString = time.toLocaleDateString('ru-RU', dateOptions)

  if (compact) {
    return (
      <div className="text-center">
        <p className="text-2xl font-mono font-bold text-primary-400">
          {hours}:{minutes}
        </p>
        <p className="text-xs text-dark-500">
          {time.getDate()}.{(time.getMonth() + 1).toString().padStart(2, '0')}
        </p>
      </div>
    )
  }

  return (
    <div className="card text-center">
      <div className="mb-4">
        <div className="flex items-center justify-center gap-1">
          <motion.span 
            key={hours}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-mono font-bold text-gradient"
          >
            {hours}
          </motion.span>
          <span className="text-5xl font-mono font-bold text-gradient animate-pulse">:</span>
          <motion.span 
            key={minutes}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-mono font-bold text-gradient"
          >
            {minutes}
          </motion.span>
          <motion.span 
            key={seconds}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-mono font-bold text-dark-400 ml-2"
          >
            {seconds}
          </motion.span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-dark-300 capitalize font-medium">
          {dateString}
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <span className="px-3 py-1.5 bg-dark-800/50 rounded-lg text-xs text-dark-400 font-medium border border-dark-700/50">
          📅 Неделя {Math.ceil(time.getDate() / 7)}
        </span>
        <span className="px-3 py-1.5 bg-dark-800/50 rounded-lg text-xs text-dark-400 font-medium border border-dark-700/50">
          🌍 День {Math.floor((time.getTime() - new Date(time.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)}
        </span>
      </div>
    </div>
  )
}
