import { useState, useEffect } from 'react'

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
    <div className="glass rounded-xl p-4 text-center">
      <div className="mb-3">
        <p className="text-4xl font-mono font-bold text-gradient">
          {hours}:{minutes}
          <span className="text-lg text-dark-400 ml-1">{seconds}</span>
        </p>
      </div>
      <p className="text-sm text-dark-400 capitalize">
        {dateString}
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <span className="px-2 py-1 bg-dark-800 rounded text-xs text-dark-400">
          Неделя {Math.ceil(time.getDate() / 7)}
        </span>
        <span className="px-2 py-1 bg-dark-800 rounded text-xs text-dark-400">
          {Math.floor((time.getTime() - new Date(time.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)} день года
        </span>
      </div>
    </div>
  )
}
