# Archive — Архив конфигураций деплоя

Эта папка содержит конфигурационные файлы для деплоя на различные платформы.

## 📁 Структура

```
archive/
└── deploy-configs/
    ├── github-pages.yml          # GitHub Actions для GitHub Pages
    ├── cloudflare-pages-github.yml  # GitHub Actions для Cloudflare Pages
    ├── vercel.json               # Vercel конфигурация
    ├── netlify.toml              # Netlify конфигурация
    ├── _routes.json              # Cloudflare Pages роутинг
    ├── wrangler.toml             # Wrangler (Cloudflare) CLI
    ├── firebase.json             # Firebase Hosting
    ├── render.yaml               # Render Static Sites
    ├── railway.toml              # Railway деплой
    ├── surge.txt                 # Surge инструкции
    ├── netlify-function.js       # Пример Netlify функции
    ├── vercel-api.js             # Пример Vercel API
    └── DEPLOY_GUIDE.md           # Полное руководство по деплою
```

## 🚀 Быстрый старт

### Cloudflare Pages (рекомендуется)
1. Используйте `wrangler.toml` в корне проекта
2. Деплой через панель Cloudflare Pages или CLI:
   ```bash
   wrangler pages deploy dist --project-name=fastfingers
   ```

### Vercel
1. Скопируйте `vercel.json` в корень проекта
2. Задеплойте через панель Vercel

### Netlify
1. Скопируйте `netlify.toml` в корень проекта
2. Задеплойте через панель Netlify

## 📚 Полная документация

См. [`DEPLOY_GUIDE.md`](./deploy-configs/DEPLOY_GUIDE.md) для подробного руководства по всем платформам.
