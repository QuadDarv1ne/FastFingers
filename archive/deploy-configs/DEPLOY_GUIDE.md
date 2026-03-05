# Руководство по деплою FastFingers

## Обзор платформ

### 🟢 Рекомендуемые

#### Cloudflare Pages
- **Бесплатно**: ✅ Да, без ограничений
- **Автоматический деплой**: ✅ Через Git интеграцию
- **Custom домен**: ✅ Бесплатно
- **SSL**: ✅ Бесплатно
- **CDN**: ✅ Глобальная сеть Cloudflare

**Настройка:**
1. Зайдите на https://pages.cloudflare.com/
2. Create a project → Connect to Git
3. Выберите репозиторий `FastFingers`
4. Build command: `npm run build`
5. Build output directory: `dist`
6. Save and Deploy

---

#### Vercel
- **Бесплатно**: ✅ Да (с ограничениями)
- **Автоматический деплой**: ✅ Через Git интеграцию
- **Custom домен**: ✅ Бесплатно
- **SSL**: ✅ Бесплатно
- **CDN**: ✅ Глобальная сеть Vercel

**Настройка:**
1. Зайдите на https://vercel.com/
2. Import Project → Выберите GitHub репозиторий
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy

---

#### Netlify
- **Бесплатно**: ✅ Да (100GB bandwidth/month)
- **Автоматический деплой**: ✅ Через Git интеграцию
- **Custom домен**: ✅ Бесплатно
- **SSL**: ✅ Бесплатно
- **CDN**: ✅ Глобальная сеть Netlify

**Настройка:**
1. Зайдите на https://app.netlify.com/
2. Add new site → Import an existing project
3. Выберите GitHub репозиторий
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy site

---

### 🟡 Альтернативные

#### GitHub Pages
- **Бесплатно**: ✅ Да
- **Автоматический деплой**: ✅ Через GitHub Actions
- **Custom домен**: ✅ Бесплатно
- **SSL**: ✅ Бесплатно
- **CDN**: ✅ Через GitHub CDN

**Настройка:**
1. Settings → Pages
2. Source: GitHub Actions
3. Workflow автоматически запустится при пуше

⚠️ **Внимание**: Требуется подтверждённый аккаунт GitHub (может требовать привязки карты)

---

#### Firebase Hosting
- **Бесплатно**: ✅ Да (10GB storage, 360MB/day bandwidth)
- **Автоматический деплой**: ✅ Через GitHub Actions
- **Custom домен**: ✅ Бесплатно
- **SSL**: ✅ Бесплатно
- **CDN**: ✅ Глобальная сеть Google

**Настройка:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

#### Render
- **Бесплатно**: ✅ Да (с ограничениями)
- **Автоматический деплой**: ✅ Через Git интеграцию
- **Custom домен**: ✅ Бесплатно
- **SSL**: ✅ Бесплатно
- **CDN**: ✅ Глобальная сеть Render

**Настройка:**
1. Зайдите на https://render.com/
2. New → Static Site
3. Connect репозиторий
4. Build command: `npm run build`
5. Publish directory: `dist`

---

#### Railway
- **Бесплатно**: ⚠️ $5 кредит в месяц
- **Автоматический деплой**: ✅ Через Git интеграцию
- **Custom домен**: ✅ Бесплатно
- **SSL**: ✅ Бесплатно
- **CDN**: ✅ Глобальная сеть Railway

**Настройка:**
1. Зайдите на https://railway.app/
2. New Project → Deploy from GitHub
3. Выберите репозиторий
4. Variables: NODE_VERSION=20
5. Deploy

---

#### Surge
- **Бесплатно**: ✅ Да (базовый тариф)
- **Автоматический деплой**: ❌ Только CLI
- **Custom домен**: ✅ Платно для custom домена
- **SSL**: ✅ Бесплатно
- **CDN**: ✅ Глобальная сеть Surge

**Настройка:**
```bash
npm install -g surge
surge ./dist fastfingers.surge.sh
```

---

## Сравнение платформ

| Платформа | Бесплатно | Авто-деплой | Custom домен | CDN | Примечания |
|-----------|-----------|-------------|--------------|-----|------------|
| Cloudflare Pages | ✅ | ✅ | ✅ | ✅ | Лучший выбор |
| Vercel | ✅ | ✅ | ✅ | ✅ | Отлично для Vite |
| Netlify | ✅ | ✅ | ✅ | ✅ | Много функций |
| GitHub Pages | ✅ | ✅ | ✅ | ✅ | Требует верификации |
| Firebase | ✅ | ✅ | ✅ | ✅ | Экосистема Google |
| Render | ✅ | ✅ | ✅ | ✅ | Простая настройка |
| Railway | ⚠️ $5 | ✅ | ✅ | ✅ | Платный кредит |
| Surge | ✅ | ❌ | ⚠️ Платно | ✅ | Только CLI |

---

## Переменные окружения

Для всех платформ добавьте следующие переменные окружения при необходимости:

```env
VITE_API_URL=https://api.fastfingers.app
VITE_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
```

---

## Рекомендации

1. **Для начала**: Cloudflare Pages или Vercel
2. **Для production**: Cloudflare Pages (лучшая производительность)
3. **Для тестирования**: Vercel (быстрый preview деплой)
4. **Для full-stack**: Netlify (функции + хостинг)

---

## Troubleshooting

### Белый экран после деплоя
- Проверьте консоль браузера (F12)
- Убедитесь, что `base` путь настроен правильно
- Проверьте `_routes.json` для SPA роутинга

### Ошибки сборки
- Очистите кеш: `npm ci`
- Проверьте версии Node.js: `node --version`
- Локальная сборка: `npm run build`

### Проблемы с роутингом
- Добавьте конфигурацию для SPA роутинга
- Проверьте redirects в конфигурации платформы
