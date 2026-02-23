import './SkipLink.css'

export function SkipLink() {
  return (
    <nav className="skip-link" aria-label="Пропустить навигацию">
      <a href="#main-content" className="skip-link__button">
        Перейти к основному содержимому
      </a>
      <a href="#keyboard" className="skip-link__button">
        Перейти к клавиатуре
      </a>
      <a href="#settings" className="skip-link__button">
        Перейти к настройкам
      </a>
    </nav>
  )
}
