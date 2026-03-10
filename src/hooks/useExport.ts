import { useState, useCallback } from 'react'
import { downloadCSV, statsToExportData, ExportData } from '../utils/export'
import { TypingStats } from '../types'
import { createScopedLogger } from '../utils/logger'

const logger = createScopedLogger('useExport')

interface UseExportOptions {
  filename?: string
}

interface UseExportReturn {
  exportToCSV: (stats: TypingStats[], dates?: string[]) => void
  exportDataToCSV: (data: ExportData[], filename?: string) => void
  isExporting: boolean
}

export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const { filename } = options
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = useCallback((stats: TypingStats[], dates?: string[]) => {
    setIsExporting(true)
    try {
      const data = statsToExportData(stats, dates)
      downloadCSV(data, filename)
    } catch (error) {
      logger.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [filename])

  const exportDataToCSV = useCallback((data: ExportData[], customFilename?: string) => {
    setIsExporting(true)
    try {
      downloadCSV(data, customFilename ?? filename)
    } catch (error) {
      logger.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [filename])

  return {
    exportToCSV,
    exportDataToCSV,
    isExporting,
  }
}

export default useExport
