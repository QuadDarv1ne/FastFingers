import { useAppTranslation } from '../i18n/config'
import './SkipLink.css'

export function SkipLink() {
  const { t } = useAppTranslation()
  return (
    <nav className="skip-link" aria-label={t('skip.nav')}>
      <a href="#main-content" className="skip-link__button">
        {t('skip.content')}
      </a>
      <a href="#keyboard" className="skip-link__button">
        {t('skip.keyboard')}
      </a>
      <a href="#settings" className="skip-link__button">
        {t('skip.settings')}
      </a>
    </nav>
  )
}
