# Руководство по разработке FastFingers

## Структура проекта

```
FastFingers/
├── public/              # Статические файлы
│   ├── favicon.svg      # Иконка приложения
│   └── manifest.webmanifest  # PWA манифест
├── src/
│   ├── components/      # React компоненты
│   │   ├── Header.tsx       # Шапка с уровнем и XP
│   │   ├── Stats.tsx        # Панель статистики
│   │   ├── Keyboard.tsx     # Виртуальная клавиатура
│   │   └── TypingTrainer.tsx # Основной тренажёр
│   ├── hooks/           # Кастомные хуки
│   ├── types/           # TypeScript типы
│   │   └── index.ts     # Основные типы и интерфейсы
│   ├── utils/           # Утилиты
│   │   ├── layouts.ts   # Раскладки клавиатуры
│   │   ├── exercises.ts # Упражнения и генерация текстов
│   │   └── stats.ts     # Расчёт статистики
│   ├── App.tsx          # Корневой компонент
│   ├── main.tsx         # Точка входа
│   └── index.css        # Глобальные стили
├── index.html           # HTML шаблон
├── package.json         # Зависимости и скрипты
├── tsconfig.json        # Конфигурация TypeScript
├── vite.config.ts       # Конфигурация Vite
├── tailwind.config.js   # Конфигурация Tailwind CSS
└── README.md            # Документация
```

## Основные возможности

### Типы упражнений

1. **Базовые** - отработка клавиш основного ряда
2. **Верхний ряд** - клавиши верхнего ряда
3. **Нижний ряд** - клавиши нижнего ряда
4. **Слова** - тренировка на словах
5. **Предложения** - сложные предложения
6. **Код** - примеры кода для программистов

### Система прогресса

- **XP** - опыт за каждую сессию
- **Уровни** - повышаются с набором XP
- **Достижения** - награды за определенные результаты
- **Статистика** - WPM, точность, ошибки

### Технологический стек

- **Frontend**: React 18 + TypeScript
- **Стили**: Tailwind CSS + Framer Motion
- **Сборка**: Vite
- **PWA**: vite-plugin-pwa (офлайн режим)

## Добавление новых упражнений

Откройте `src/utils/exercises.ts` и добавьте новое упражнение:

```typescript
{
  id: 'custom-1',
  title: 'Название упражнения',
  description: 'Описание',
  text: 'Текст для печати',
  difficulty: 5,  // 1-10
  category: 'words',  // basic, upper, lower, words, sentences, code
  focusKeys: ['а', 'б', 'в'],  // клавиши для отработки
}
```

## Сборка и деплой

### Локальная разработка

```bash
npm install
npm run dev
```

### Production сборка

```bash
npm run build
npm run preview  # предпросмотр
```

### Деплой на Vercel

```bash
npm install -g vercel
vercel
```

### Деплой на Netlify

```bash
npm run build
# Загрузите папку dist на Netlify
```

## Лицензия

MIT
