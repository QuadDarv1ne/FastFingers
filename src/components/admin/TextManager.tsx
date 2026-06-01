import { useState, useEffect, useRef, useMemo } from 'react'
import type { PracticeText, TextCategory } from '../../data/practiceTexts'
import { useToast } from '@contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useTextUsageStats } from '@hooks/useTextUsage'
import { getFromStorageAsArray } from '../../utils/storage'

const STORAGE_KEY = 'fastfingers_admin_texts'

const CATEGORIES: TextCategory[] = [
  'literature', 'code', 'quotes', 'proverbs', 'science', 'technology',
  'movies', 'news', 'philosophy', 'business', 'scipop', 'history', 'art', 'sports', 'travel',
]

const CATEGORY_LABELS: Record<TextCategory, string> = {
  literature: 'Литература', code: 'Код', quotes: 'Цитаты', proverbs: 'Пословицы',
  science: 'Наука', technology: 'Технологии', movies: 'Фильмы', news: 'Новости',
  philosophy: 'Философия', business: 'Бизнес', scipop: 'Научпоп', history: 'История',
  art: 'Искусство', sports: 'Спорт', travel: 'Путешествия',
}

function loadTexts(): PracticeText[] {
  return getFromStorageAsArray(STORAGE_KEY)
}

function saveTexts(texts: PracticeText[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(texts))
}

function generateId(): string {
  return 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6)
}

function validatePracticeText(obj: unknown): obj is PracticeText {
  if (!obj || typeof obj !== 'object') return false
  const item = obj as Record<string, unknown>
  if (typeof item.id !== 'string') return false
  if (typeof item.title !== 'string' || !item.title.trim()) return false
  if (typeof item.text !== 'string' || !item.text.trim()) return false
  if (typeof item.difficulty !== 'number' || item.difficulty < 1 || item.difficulty > 9) return false
  if (typeof item.category !== 'string' || !CATEGORIES.includes(item.category as TextCategory)) return false
  if (item.source !== undefined && typeof item.source !== 'string') return false
  return true
}

function exportTexts(texts: PracticeText[]): void {
  const json = JSON.stringify(texts, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fastfingers-texts-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getExistingIds(texts: PracticeText[]): Set<string> {
  return new Set(texts.map(t => t.id))
}

export function TextManager() {
  const { showToast } = useToast()
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const { i18n } = useTranslation()
  const [texts, setTexts] = useState<PracticeText[]>([])
  const [editing, setEditing] = useState<PracticeText | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<PracticeText>>({})
  const { stats: usageStats, clearStats: clearUsageStats } = useTextUsageStats()

  const usageMap = useMemo(() => {
    const map = new Map<string, { count: number; avgWpm: number; avgAccuracy: number; lastUsed: string }>()
    for (const s of usageStats) {
      map.set(s.textId, { count: s.usageCount, avgWpm: s.avgWpm, avgAccuracy: s.avgAccuracy, lastUsed: s.lastUsed })
    }
    return map
  }, [usageStats])

  useEffect(() => {
    setTexts(loadTexts())
  }, [])

  function handleSave() {
    if (!formData.title?.trim() || !formData.text?.trim()) return
    const updated: PracticeText = {
      id: editing?.id || generateId(),
      title: formData.title.trim(),
      text: formData.text.trim(),
      category: formData.category || 'literature',
      difficulty: formData.difficulty || 3,
      source: formData.source?.trim() || undefined,
    }
    const next = editing
      ? texts.map(t => t.id === editing.id ? updated : t)
      : [...texts, updated]
    saveTexts(next)
    setTexts(next)
    setShowForm(false)
    setEditing(null)
    setFormData({})
  }

  function handleEdit(text: PracticeText) {
    setEditing(text)
    setFormData({ ...text })
    setShowForm(true)
  }

  function handleDelete(id: string) {
    const next = texts.filter(t => t.id !== id)
    saveTexts(next)
    setTexts(next)
  }

  function handleNew() {
    setEditing(null)
    setFormData({ category: 'literature', difficulty: 3 })
    setShowForm(true)
  }

  function handleExport() {
    if (texts.length === 0) {
      showToast(t('admin.exportEmpty', 'Нет текстов для экспорта'), 'error')
      return
    }
    exportTexts(texts)
    showToast(t('admin.exportSuccess', `Экспортировано ${texts.length} текстов`), 'success')
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (!Array.isArray(parsed)) {
          showToast(t('admin.importInvalid', 'Файл должен содержать массив текстов'), 'error')
          setImporting(false)
          return
        }

        const valid = parsed.filter(validatePracticeText)
        if (valid.length === 0) {
          showToast(t('admin.importNoValid', 'Не найдено валидных текстов'), 'error')
          setImporting(false)
          return
        }

        const existingIds = getExistingIds(texts)
        const newTexts: PracticeText[] = []
        let skipped = 0
        for (const item of valid) {
          if (existingIds.has(item.id)) {
            skipped++
          } else {
            newTexts.push(item)
          }
        }

        const merged = [...texts, ...newTexts]
        saveTexts(merged)
        setTexts(merged)

        if (skipped > 0) {
          showToast(t('admin.importSuccessSkip', `Импортировано ${newTexts.length} текстов (пропущено ${skipped} дубликатов)`), 'success')
        } else {
          showToast(t('admin.importSuccess', `Импортировано ${newTexts.length} текстов`), 'success')
        }
      } catch {
        showToast(t('admin.importError', 'Ошибка при чтении файла'), 'error')
      }
      setImporting(false)
    }

    reader.onerror = () => {
      showToast(t('admin.importError', 'Ошибка при чтении файла'), 'error')
      setImporting(false)
    }

    reader.readAsText(file)
    if (event.target) event.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-dark-400">{texts.length} пользовательских текстов</p>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleExport}
            disabled={texts.length === 0}
            className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('action.export', 'Экспорт')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <label
            aria-label={t('action.import', 'Импорт')}
            className={`px-3 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg text-sm transition-colors cursor-pointer ${
              importing ? 'opacity-50 pointer-events-none' : ''
            }`}
            title={t('action.import', 'Импорт')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l4 4m-4-4v12" />
            </svg>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              disabled={importing}
              className="hidden"
            />
          </label>
          <button onClick={handleNew} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm transition-colors">
            + Добавить текст
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-4 space-y-3">
          <h3 className="text-lg font-semibold text-white">
            {editing ? 'Редактировать текст' : 'Новый текст'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-dark-400 mb-1">
                Название
                <input
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-dark-800 text-white rounded-lg px-3 py-2 text-sm border border-dark-600 focus:border-accent-500 outline-none mt-1"
                  placeholder="Название текста"
                />
              </label>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">
                Источник
                <input
                  value={formData.source || ''}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-dark-800 text-white rounded-lg px-3 py-2 text-sm border border-dark-600 focus:border-accent-500 outline-none mt-1"
                  placeholder="Необязательно"
                />
              </label>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">
                Категория
                <select
                  value={formData.category || 'literature'}
                  onChange={e => setFormData({ ...formData, category: e.target.value as TextCategory })}
                  className="w-full bg-dark-800 text-white rounded-lg px-3 py-2 text-sm border border-dark-600 focus:border-accent-500 outline-none mt-1"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">
                Сложность (1-9)
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={formData.difficulty || 3}
                  onChange={e => setFormData({ ...formData, difficulty: Math.min(9, Math.max(1, Number(e.target.value))) })}
                  className="w-full bg-dark-800 text-white rounded-lg px-3 py-2 text-sm border border-dark-600 focus:border-accent-500 outline-none mt-1"
                />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">
              Текст
              <textarea
                value={formData.text || ''}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
                rows={4}
                className="w-full bg-dark-800 text-white rounded-lg px-3 py-2 text-sm border border-dark-600 focus:border-accent-500 outline-none resize-vertical mt-1"
                placeholder="Текст для печати"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm transition-colors">
              {editing ? 'Сохранить' : 'Создать'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors">
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {texts.length === 0 && !showForm && (
          <p className="text-center text-dark-500 py-8 text-sm">
            Нет пользовательских текстов. Нажмите «+ Добавить текст», чтобы создать первый.
          </p>
        )}
        {texts.map(text => {
          const usage = usageMap.get(text.id)
          return (
          <div key={text.id} className="glass rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white truncate">{text.title}</span>
                <span className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded shrink-0">
                  {CATEGORY_LABELS[text.category] || text.category}
                </span>
                <span className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded shrink-0">
                  Сложность {text.difficulty}
                </span>
                {usage && usage.count > 0 && (
                  <span className="text-xs bg-primary-600/20 text-primary-300 px-2 py-0.5 rounded shrink-0">
                    {usage.count} исп.
                  </span>
                )}
              </div>
              <p className="text-sm text-dark-400 line-clamp-2">{text.text}</p>
              {text.source && (
                <p className="text-xs text-dark-500 mt-1">Источник: {text.source}</p>
              )}
              {usage && usage.count > 0 && (
                <div className="flex gap-4 mt-2 text-xs text-dark-500">
                  <span>WPM: <span className="text-primary-400 font-medium">{usage.avgWpm}</span></span>
                  <span>Точность: <span className="text-green-400 font-medium">{usage.avgAccuracy}%</span></span>
                  <span>Последнее: <span className="text-dark-400">{new Date(usage.lastUsed).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}</span></span>
                </div>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => handleEdit(text)} className="p-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg transition-colors" title="Редактировать">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => handleDelete(text.id)} className="p-2 bg-dark-700 hover:bg-red-500/20 text-dark-300 hover:text-red-400 rounded-lg transition-colors" title="Удалить">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          )
        })}
      </div>

      {/* Usage statistics summary */}
      {usageStats.length > 0 && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📊</span>
              Статистика использования
            </h3>
            <button
              onClick={clearUsageStats}
              className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg text-xs transition-colors"
            >
              Сбросить статистику
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-2 px-3 text-dark-400 font-medium">Текст</th>
                  <th className="text-center py-2 px-3 text-dark-400 font-medium">Использований</th>
                  <th className="text-center py-2 px-3 text-dark-400 font-medium">Средний WPM</th>
                  <th className="text-center py-2 px-3 text-dark-400 font-medium">Средняя точность</th>
                  <th className="text-right py-2 px-3 text-dark-400 font-medium">Последнее</th>
                </tr>
              </thead>
              <tbody>
                {usageStats
                  .sort((a, b) => b.usageCount - a.usageCount)
                  .slice(0, 20)
                  .map(s => {
                    const text = texts.find(t => t.id === s.textId)
                    return (
                      <tr key={s.textId} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                        <td className="py-2 px-3 text-white truncate max-w-[200px]">
                          {text?.title || s.textId}
                        </td>
                        <td className="text-center py-2 px-3 text-primary-400 font-bold">{s.usageCount}</td>
                        <td className="text-center py-2 px-3 text-success">{s.avgWpm}</td>
                        <td className="text-center py-2 px-3 text-blue-400">{s.avgAccuracy}%</td>
                        <td className="text-right py-2 px-3 text-dark-400">
                          {new Date(s.lastUsed).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
