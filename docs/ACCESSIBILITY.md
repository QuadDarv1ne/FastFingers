# Accessibility (A11y) в FastFingers

## Реализованные функции

### 1. Skip Links

Компонент `SkipLink` позволяет пользователям клавиатуры пропускать навигацию и переходить сразу к основному содержимому.

**Использование:**

- Нажмите `Tab` при загрузке страницы
- Появится кнопка "Перейти к основному содержимому"
- Нажмите `Enter` для активации

### 2. ARIA Announcer

Компонент `AriaAnnouncer` объявляет изменения для screen readers.

**Использование в коде:**

```typescript
import { useAccessibility } from '@hooks/useAccessibility'

function Component() {
  const { announce } = useAccessibility()

  const handleComplete = () => {
    announce('Упражнение завершено! Скорость: 60 WPM', 'assertive')
  }
}
```

### 3. Хук useAccessibility

Предоставляет утилиты для управления доступностью:

```typescript
import { useAccessibility } from '@hooks/useAccessibility'

function Component() {
  const { focusElement, announce } = useAccessibility({
    enabled: true,
    onEscape: () => closeModal(),
    onEnter: () => handleSubmit(),
  })

  // Фокус на элемент по id
  focusElement('input-field')

  // Объявление для screen readers
  announce('Новое сообщение')
}
```

### 4. Keyboard Navigation

- `Tab` / `Shift+Tab` — навигация между элементами
- `Enter` — активация кнопок и ссылок
- `Escape` — закрытие модальных окон
- `Arrow Keys` — навигация в списках (где применимо)

### 5. ARIA Landmarks

- `<main id="main-content" role="main">` — основное содержимое
- `<nav aria-label="...">` — навигация
- `role="button"` — кастомные кнопки
- `role="dialog"` — модальные окна
- `aria-live` — динамические обновления

## Рекомендации для разработчиков

### Добавление новых компонентов

1. **Добавьте aria-label:**

```tsx
<button aria-label="Закрыть панель">
  <CloseIcon />
</button>
```

2. **Используйте семантические элементы:**

```tsx
// ✅ Хорошо
<nav>...</nav>
<main>...</main>
<article>...</article>

// ❌ Избегайте
<div class="nav">...</div>
<div class="main">...</div>
```

3. **Добавьте focus states:**

```css
.button:focus {
  outline: 3px solid #7c3aed;
  outline-offset: 2px;
}
```

4. **Поддерживайте keyboard navigation:**

```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Кнопка
</div>
```

### Тестирование accessibility

1. **Клавиатура:**
   - Попробуйте navegar по приложению только с клавиатуры
   - Убедитесь что виден focus indicator

2. **Screen Readers:**
   - NVDA (Windows, бесплатно)
   - VoiceOver (macOS, встроенный)
   - JAWS (Windows, платный)

3. **Инструменты:**
   - Lighthouse Accessibility Score
   - axe DevTools
   - WAVE Evaluation Tool

## Чеклист перед релизом

- [ ] Все интерактивные элементы доступны с клавиатуры
- [ ] Focus виден на всех элементах
- [ ] Skip link работает
- [ ] ARIA labels добавлены к иконкам
- [ ] Контрастность цветов соответствует WCAG 2.1 AA
- [ ] Screen reader читает весь контент
- [ ] Формы имеют label
- [ ] Ошибки валидации объявляются

## Ресурсы

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
