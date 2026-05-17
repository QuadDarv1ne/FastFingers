import { memo } from 'react'

export const Footer = memo(function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-dark-700/50 py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-dark-500">
            &copy; {year} FastFingers. Дуплей Максим Игоревский. Все права защищены.
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="/privacy-policy.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-400 hover:text-primary-400 transition-colors"
            >
              Политика конфиденциальности
            </a>
            <a
              href="/terms-of-service.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-400 hover:text-primary-400 transition-colors"
            >
              Пользовательское соглашение
            </a>
            <a
              href="/cookie-policy.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-400 hover:text-primary-400 transition-colors"
            >
              Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
})
