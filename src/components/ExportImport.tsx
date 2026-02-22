import { useState } from 'react'
import { UserProgress } from '../types'

interface ExportImportProps {
  progress: UserProgress
  onImport: (data: ExportData) => void
}

export interface ExportData {
  version: string
  exportedAt: string
  progress: UserProgress
  history?: unknown[]
  settings?: unknown
}

export function ExportImport({ progress, onImport }: ExportImportProps) {
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Экспорт прогресса
  const handleExport = () => {
    const data: ExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      progress,
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `fastfingers-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Импорт прогресса
  const handleImport = () => {
    try {
      const data = JSON.parse(importText) as ExportData
      
      if (!data.version || !data.progress) {
        throw new Error('Неверный формат файла')
      }
      
      if (data.version !== '1.0') {
        throw new Error(`Несовместимая версия: ${data.version}`)
      }
      
      onImport(data)
      setSuccess(true)
      setError('')
      setImportText('')
      
      setTimeout(() => {
        setSuccess(false)
        setShowImport(false)
      }, 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка импорта')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        setImportText(text)
      } catch {
        setError('Не удалось прочитать файл')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Экспорт
        </button>
        
        <button
          onClick={() => setShowImport(!showImport)}
          className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Импорт
        </button>
      </div>

      {showImport && (
        <div className="glass rounded-xl p-4 space-y-3">
          <h4 className="font-medium">Импорт прогресса</h4>
          
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Вставьте JSON данные или загрузите файл..."
            rows={5}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono resize-none"
          />
          
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-center text-sm cursor-pointer transition-colors">
                📁 Загрузить файл
              </div>
            </label>
            
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              Импорт
            </button>
          </div>

          {error && (
            <p className="text-error text-sm">{error}</p>
          )}
          
          {success && (
            <p className="text-success text-sm">✓ Прогресс успешно импортирован!</p>
          )}
        </div>
      )}

      <p className="text-xs text-dark-500 text-center">
        Экспортируйте свой прогресс для резервного копирования или переноса на другое устройство
      </p>
    </div>
  )
}
