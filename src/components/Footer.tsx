import { memo } from 'react'
import { useAppTranslation } from '../i18n/config'

export const Footer = memo(function Footer() {
  const { t } = useAppTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-dark-700/20 py-5 mt-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-dark-500 font-medium">
            &copy; {year} FastFingers
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-dark-500 font-medium" role="link" aria-disabled="true">
              {t('misc.privacy')}
            </span>
            <span className="text-dark-600/50" aria-hidden="true">·</span>
            <span className="text-dark-500 font-medium" role="link" aria-disabled="true">
              {t('misc.terms')}
            </span>
            <span className="text-dark-600/50" aria-hidden="true">·</span>
            <span className="text-dark-500 font-medium" role="link" aria-disabled="true">
              {t('cookie.title')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
})
