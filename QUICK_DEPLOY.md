# 🚀 Быстрый деплой FastFingers

## Вариант 1: Cloudflare Pages ⭐ (Рекомендуется)

### Через веб-интерфейс:

1. Зайдите на https://dash.cloudflare.com/?to=/:account/workers-and-pages
2. Нажмите **"Create application"** → **"Pages"**
3. **"Connect to Git"** → выберите репозиторий `FastFingers`
4. Настройте параметры:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `20`
5. Нажмите **"Save and Deploy"**

✅ Сайт будет доступен по адресу `https://fastfingers.<random-subdomain>.pages.dev`

### Через CLI:

```bash
npm i -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name=fastfingers
```

---

## Вариант 2: GitHub Pages

### Шаг 1: Включите GitHub Pages

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings → Pages**
3. В разделе **Source** выберите **GitHub Actions**
4. Сохраните

### Шаг 2: Задеплойте

```bash
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

GitHub Actions автоматически соберёт и задеплоит проект.

✅ Сайт будет доступен по адресу: `https://<username>.github.io/FastFingers/`

⚠️ **Важно:** Для GitHub Pages приложение будет доступно в подпапке `/FastFingers/`.
Если имя репозитория другое, обновите workflow файл.

---

## Вариант 3: Vercel

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

✅ Сайт будет доступен по адресу `https://fastfingers.vercel.app`

---

## Вариант 4: Netlify (уже настроен)

### Через CLI:

```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Через веб-интерфейс:

1. Зайдите на https://netlify.com
2. **"Add new site → Import an existing project"**
3. Выберите репозиторий
4. Параметры:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

---

## Проверка после деплоя

- [ ] Главная страница загружается
- [ ] Тренажёр печати работает
- [ ] Статистика сохраняется
- [ ] PWA устанавливается
- [ ] Нет ошибок в консоли

---

## Переменные окружения (опционально)

Если используете API или Sentry, добавьте переменные в настройках платформы:

```env
VITE_API_URL=https://your-api.com
VITE_SENTRY_DSN=your-sentry-dsn
```

---

## Устранение проблем

### Белый экран после деплоя

Проверьте консоль браузера (F12). Если ошибка связана с путями к файлам:

**Для GitHub Pages** убедитесь, что в workflow правильно указано имя репозитория.

### 404 при обновлении страницы

Убедитесь, что файл `netlify.toml` (для Netlify) или настройки редиректов (для других платформ) настроены корректно.

---

## Полезные команды

```bash
# Локальный предпросмотр production версии
npm run preview

# Сборка проекта
npm run build

# Анализ размера bundle
# После build откройте dist/stats.html
```
