import { useState } from 'react'
import { UserProgress } from '@/types'
import { useToast } from '@hooks/useToast'

interface ExportImportProps {
  progress?: UserProgress
  onImport?: (data: { progress: UserProgress }) => void
}

export function ExportImport({ progress: _progress, onImport: _onImport }: ExportImportProps) {
  const [importing, setImporting] = useState(false)
  const { success, error } = useToast()

  const handleExport = () => {
    try {
      const data: Record<string, string> = {}

      // Collect all FastFingers data from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('fastfingers_')) {
          const value = localStorage.getItem(key)
          if (value) {
            data[key] = value
          }
        }
      }

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fastfingers-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      success({ title: 'Данные успешно экспортированы' })
    } catch {
      error({ title: 'Ошибка при экспорте данных' })
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)

        if (!importData.version || !importData.data) {
          throw new Error('Invalid backup file format')
        }

        // Confirm before overwriting
        if (!confirm('Это действие перезапишет все текущие данные. Продолжить?')) {
          setImporting(false)
          return
        }

        // Import data
        Object.entries(importData.data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value)
          }
        })

        success({ title: 'Данные успешно импортированы' })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch {
        error({ title: 'Ошибка при импорте данных' })
        setImporting(false)
      }
    }

    reader.onerror = () => {
      error({ title: 'Ошибка при чтении файла' })
      setImporting(false)
    }

    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (!confirm('Вы уверены? Это действие удалит ВСЕ данные и не может быть отменено!')) {
      return
    }

    if (
      !confirm(
        'Последнее предупреждение! Все ваши достижения, статистика и настройки будут удалены. Продолжить?'
      )
    ) {
      return
    }

    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('fastfingers_')) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))

      success({ title: 'Все данные удалены' })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch {
      error({ title: 'Ошибка при удалении данных' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>💾</span>
            Экспорт и импорт данных
          </h2>
          <p className="text-dark-400 text-sm mt-1">Сохраните или восстановите свой прогресс</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Export section */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
              📤
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Экспорт данных</h3>
              <p className="text-dark-400 text-sm mb-4">
                Сохраните все ваши данные в файл. Включает статистику, достижения, настройки и
                прогресс.
              </p>
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Экспортировать данные
              </button>
            </div>
          </div>
        </div>

        {/* Import section */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
              📥
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Импорт данных</h3>
              <p className="text-dark-400 text-sm mb-4">
                Восстановите данные из ранее сохранённого файла. Текущие данные будут перезаписаны.
              </p>
              <label className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all flex items-center gap-2 cursor-pointer inline-flex">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                {importing ? 'Импортирование...' : 'Импортировать данные'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Clear data section */}
        <div className="card p-6 border border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-red-400">Опасная зона</h3>
              <p className="text-dark-400 text-sm mb-4">
                Удалить все данные приложения. Это действие необратимо!
              </p>
              <button
                onClick={handleClearData}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Удалить все данные
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-dark-800/30 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            Информация
          </h4>
          <ul className="text-xs text-dark-400 space-y-1">
            <li>• Экспортированные данные сохраняются в формате JSON</li>
            <li>• Рекомендуется регулярно создавать резервные копии</li>
            <li>• Импорт данных перезапишет все текущие настройки</li>
            <li>• Данные хранятся локально в вашем браузере</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
