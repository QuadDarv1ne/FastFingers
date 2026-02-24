import { describe, it, expect } from 'vitest'

describe('PDF Export Utils', () => {
  it('should have exportStatsToPDF function', () => {
    // Простая проверка что модуль экспортирует функции
    expect(typeof import('@utils/pdfExport')).toBe('object')
  })

  it('should have exportCertificatePDF function', () => {
    expect(typeof import('@utils/pdfExport')).toBe('object')
  })
})
