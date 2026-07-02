import { useState, useRef, useEffect, memo } from 'react'
import { useToast } from '@contexts/ToastContext'
import { setToStorageWithQuotaHandling } from '@utils/storage'
import { useAppTranslation } from '../i18n/config'
import { logger } from '../utils/logger'
import { downloadBlob } from '../utils/export'

const CURRENT_VERSION = '1.0'

interface BackupData {
  version: string
  exportedAt: string
  data: Record<string, string>
}

function validateBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.version === 'string' &&
    typeof obj.exportedAt === 'string' &&
    typeof obj.data === 'object' &&
    obj.data !== null
  )
}

function ExportImport() {
  const { t } = useAppTranslation()
  const [importing, setImporting] = useState(false)
  const { showToast } = useToast()
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current)
    }
  }, [])

  const handleExport = () => {
    try {
      const data: Record<string, string> = {}

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('fastfingers_')) {
          const value = localStorage.getItem(key)
          if (value) {
            data[key] = value
          }
        }
      }

      const exportData: BackupData = {
        version: CURRENT_VERSION,
        exportedAt: new Date().toISOString(),
        data,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      downloadBlob(blob, `fastfingers-backup-${new Date().toISOString().split('T')[0]}.json`)

      showToast(t('exportImport.exportSuccess'), 'success')
    } catch (err) {
      logger.error('Export failed', err)
      showToast(t('exportImport.exportError'), 'error')
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      if (!mountedRef.current) return
      try {
        const content = e.target?.result
        if (typeof content !== 'string') {
          setImporting(false)
          showToast(t('exportImport.importError'), 'error')
          return
        }
        const importData = JSON.parse(content)

        if (!validateBackupData(importData)) {
          throw new Error(t('exportImport.invalidFormat'))
        }

        if (importData.version !== CURRENT_VERSION) {
          const confirmed = confirm(
            t('exportImport.versionMismatch', { version: importData.version, current: CURRENT_VERSION })
          )
          if (!confirmed) {
            setImporting(false)
            return
          }
        }

        if (!confirm(t('exportImport.confirmOverwrite'))) {
          setImporting(false)
          return
        }

        const entries = Object.entries(importData.data)
          .filter(([key]) => typeof key === 'string' && key.startsWith('fastfingers_'))
        let importedCount = 0
        let quotaExceeded = false

        for (let i = 0; i < entries.length; i++) {
          const [key, value] = entries[i] as [string, string]
          if (typeof value === 'string') {
            const result = setToStorageWithQuotaHandling(key, value)
            if (!result.success) {
              if (result.quotaExceeded) {
                quotaExceeded = true
                break
              }
            } else {
              importedCount++
            }
          }
        }

        if (quotaExceeded) {
          showToast(
            t('exportImport.quotaExceeded', { count: importedCount, total: entries.length }),
            'error'
          )
        } else {
          showToast(t('exportImport.importSuccess'), 'success')
        }
        if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current)
        reloadTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return
          window.location.reload()
        }, 1000)
      } catch (err) {
        logger.error('Import failed', err)
        showToast(t('exportImport.importError'), 'error')
        setImporting(false)
      }
    }

    reader.onerror = () => {
      if (!mountedRef.current) return
      showToast(t('exportImport.readError'), 'error')
      setImporting(false)
    }

    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (!confirm(t('exportImport.confirmClear1'))) {
      return
    }

    if (!confirm(t('exportImport.confirmClear2'))) {
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

      showToast(t('exportImport.clearSuccess'), 'success')
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current)
      reloadTimerRef.current = setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      logger.error('Clear data failed', err)
      showToast(t('exportImport.clearError'), 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>💾</span>
            {t('exportImport.title')}
          </h2>
          <p className="text-dark-400 text-sm mt-1">{t('exportImport.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
              📤
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{t('exportImport.exportSection')}</h3>
              <p className="text-dark-400 text-sm mb-4">
                {t('exportImport.exportDesc')}
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
                {t('exportImport.exportBtn')}
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
              📥
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{t('exportImport.importSection')}</h3>
              <p className="text-dark-400 text-sm mb-4">
                {t('exportImport.importDesc')}
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
                {importing ? t('exportImport.importing') : t('exportImport.importBtn')}
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

        <div className="card p-6 border border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-red-400">{t('exportImport.dangerZone')}</h3>
              <p className="text-dark-400 text-sm mb-4">
                {t('exportImport.clearDataDesc')}
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
                {t('exportImport.clearDataBtn')}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-dark-800/30 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            {t('exportImport.infoTitle')}
          </h4>
          <ul className="text-xs text-dark-400 space-y-1">
            <li>• {t('exportImport.infoJson')}</li>
            <li>• {t('exportImport.infoBackup')}</li>
            <li>• {t('exportImport.infoOverwrite')}</li>
            <li>• {t('exportImport.infoLocal')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default memo(ExportImport)
