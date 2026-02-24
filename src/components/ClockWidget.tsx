import { useState, useEffect } from 'react'

interface ClockWidgetProps {
  showSeconds?: boolean
  format24h?: boolean
}

export function ClockWidget({ showSeconds = true, format24h = true }: ClockWidgetProps) {
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
    return date.toLocaleDateString('ru-RU', options)
  }

  return (
    <div className="card p-4">
      <div className="text-center">
        <div className="text-3xl font-bold font-mono mb-1">{formatTime(time)}</div>
        <div className="text-sm text-dark-400">{formatDate(time)}</div>
      </div>
    </div>
  )
}
