import { memo } from 'react'

export const Footer = memo(function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-dark-700/50 py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-dark-500">
            &copy; {year} FastFingers. Дуплей Максим Игоревич. Все права защищены.
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-dark-500 cursor-default">
              Политика конфиденциальности
            </span>
            <span className="text-dark-600">|</span>
            <span className="text-dark-500 cursor-default">
              Пользовательское соглашение
            </span>
            <span className="text-dark-600">|</span>
            <span className="text-dark-500 cursor-default">
              Cookie
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
})
