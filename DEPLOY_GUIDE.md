# 🚀 Полное руководство по деплою FastFingers

> Пошаговая инструкция по развертыванию проекта на различных платформах

---

## 📋 Оглавление

1. [Подготовка к деплою](#-подготовка-к-деплою)
2. [Cloudflare Pages — рекомендуемый вариант](#-cloudflare-pages-рекомендуемый-вариант)
3. [GitHub Pages](#-github-pages)
4. [Vercel](#-vercel)
5. [Netlify](#-netlify)
6. [Проверка после деплоя](#-проверка-после-деплоя)
7. [Устранение проблем](#-устранение-проблем)

---

## 🛠 Подготовка к деплою

### Шаг 1: Проверка проекта

Перед деплоем убедитесь, что проект собирается без ошибок:

```bash
# Установите зависимости (если ещё не установлены)
npm install

# Запустите тесты
npm run test:run

# Проверьте линтер
npm run lint

# Соберите проект
npm run build
```

✅ Если сборка прошла успешно — переходите дальше.

### Шаг 2: Проверьте переменные окружения

Если вы используете внешние сервисы (API, Sentry и т.д.), создайте файл `.env.production`:

```env
VITE_API_URL=https://your-api.com
VITE_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
```

> ⚠️ **Важно:** Не коммитьте `.env.production` в Git! Он уже добавлен в `.gitignore`.

### Шаг 3: Закоммитьте изменения

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## ☁️ Cloudflare Pages (Рекомендуемый вариант)

### Почему Cloudflare Pages?

| Преимущество  | Описание                                     |
| ------------- | -------------------------------------------- |
| 🚀 Скорость   | CDN по всему миру с 300+ точками присутствия |
| 💰 Бесплатно  | Неограниченная пропускная способность        |
| 🔒 SSL        | Автоматический HTTPS                         |
| 🔄 Автодеплой | При каждом push в репозиторий                |
| 📊 Аналитика  | Встроенная Web Analytics                     |

---

### Способ 1: Через веб-интерфейс (рекомендуется)

#### Шаг 1: Войдите в Cloudflare Dashboard

Перейдите по ссылке: https://dash.cloudflare.com

> Если у вас нет аккаунта — зарегистрируйтесь (бесплатно).

#### Шаг 2: Создайте проект

1. В левом меню выберите **Workers & Pages**
2. Нажмите кнопку **"Create application"**
3. Выберите вкладку **"Pages"**
4. Нажмите **"Connect to Git"**

![Connect to Git](https://i.imgur.com/example1.png)

#### Шаг 3: Выберите репозиторий

1. Выберите ваш GitHub аккаунт (если потребуется)
2. Найдите репозиторий `FastFingers`
3. Нажмите **"Begin setup"**

![Select repository](https://i.imgur.com/example2.png)

#### Шаг 4: Настройте параметры сборки

Заполните поля:

| Поле                       | Значение        |
| -------------------------- | --------------- |
| **Production branch**      | `main`          |
| **Build command**          | `npm run build` |
| **Build output directory** | `dist`          |
| **Node version**           | `20`            |

> ⚠️ Оставьте остальные поля пустыми (по умолчанию).

![Build settings](https://i.imgur.com/example3.png)

#### Шаг 5: Сохраните и запустите

1. Нажмите **"Save and Deploy"**
2. Дождитесь завершения сборки (2-5 минут)
3. Нажмите **"Visit site"** чтобы открыть сайт

#### Шаг 6: Настройте кастомный домен (опционально)

1. В проекте перейдите в **Settings** → **Domains**
2. Нажмите **"Add custom domain"**
3. Введите ваш домен (например, `fastfingers.com`)
4. Cloudflare автоматически настроит DNS

---

### Способ 2: Через Wrangler CLI

#### Шаг 1: Установите Wrangler

```bash
npm install -g wrangler
```

#### Шаг 2: Войдите в аккаунт

```bash
wrangler login
```

Откроется браузер — подтвердите вход.

#### Шаг 3: Соберите проект

```bash
npm run build
```

#### Шаг 4: Задеплойте

```bash
wrangler pages deploy dist --project-name=fastfingers
```

> 🎉 Готово! Сайт доступен по адресу `https://fastfingers.<random-subdomain>.pages.dev`

---

### Настройка переменных окружения в Cloudflare

1. Откройте проект в **Workers & Pages**
2. Перейдите в **Settings** → **Environment variables**
3. Нажмите **"Add variable"**
4. Добавьте переменные:
   - `VITE_API_URL`
   - `VITE_SENTRY_DSN`
5. Нажмите **"Save"**
6. Пересоберите проект: **Deployments** → **Retry deployment**

---

## 🐙 GitHub Pages

### Почему GitHub Pages?

| Преимущество           | Описание                             |
| ---------------------- | ------------------------------------ |
| 🆓 Полностью бесплатно | Без ограничений по трафику           |
| 🔗 Интеграция с GitHub | Автоматический деплой из репозитория |
| 🛡 Надёжность          | Инфраструктура GitHub                |

---

### Пошаговая инструкция

#### Шаг 1: Включите GitHub Pages

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings** (шестерёнка сверху)
3. В левом меню выберите **Pages**
4. В разделе **Build and deployment** → **Source** выберите **GitHub Actions**

![GitHub Pages Settings](https://i.imgur.com/github-pages-settings.png)

#### Шаг 2: Проверьте workflow

Файл `.github/workflows/deploy-github-pages.yml` уже создан!

Он автоматически:

- Собирает проект при push в `main`
- Размещает файлы на GitHub Pages

#### Шаг 3: Закоммитьте и отправьте изменения

```bash
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

#### Шаг 4: Дождитесь деплоя

1. Перейдите во вкладку **Actions** в репозитории
2. Выберите workflow **"Deploy to GitHub Pages"**
3. Дождитесь завершения (зелёная галочка ✅)

![GitHub Actions](https://i.imgur.com/github-actions.png)

#### Шаг 5: Откройте сайт

После успешного деплоя сайт будет доступен по адресу:

```
https://<username>.github.io/FastFingers/
```

> Например: `https://quaddarv1ne.github.io/FastFingers/`

---

### Настройка кастомного домена

1. В **Settings** → **Pages** → **Custom domain**
2. Введите ваш домен (например, `fastfingers.com`)
3. Нажмите **Save**
4. В настройках DNS вашего домена добавьте:

```
Type: CNAME
Name: www
Value: <username>.github.io
```

---

## ⚡ Vercel

### Почему Vercel?

| Преимущество         | Описание                        |
| -------------------- | ------------------------------- |
| 🚀 Мгновенный деплой | Site доступен через 30 секунд   |
| 🎯 Оптимизация       | Автоматическая оптимизация Vite |
| 👀 Preview           | Предпросмотр для каждого PR     |

---

### Способ 1: Через веб-интерфейс

#### Шаг 1: Войдите в Vercel

Перейдите: https://vercel.com

> Войдите через GitHub (рекомендуется).

#### Шаг 2: Импортируйте проект

1. Нажмите **"Add New Project"**
2. Выберите **"Import Git Repository"**
3. Найдите репозиторий `FastFingers`
4. Нажмите **"Import"**

#### Шаг 3: Настройте проект

Vercel автоматически определит настройки:

| Поле                 | Значение        |
| -------------------- | --------------- |
| **Framework Preset** | Vite            |
| **Build Command**    | `npm run build` |
| **Output Directory** | `dist`          |
| **Install Command**  | `npm install`   |

> ⚠️ Ничего не меняйте, нажмите **"Deploy"**

#### Шаг 4: Готово!

Сайт доступен по адресу: `https://fastfingers.vercel.app`

---

### Способ 2: Через Vercel CLI

#### Шаг 1: Установите CLI

```bash
npm install -g vercel
```

#### Шаг 2: Войдите

```bash
vercel login
```

#### Шаг 3: Задеплойте

```bash
# Деплой в staging (preview)
vercel

# Деплой в production
vercel --prod
```

---

### Настройка переменных окружения в Vercel

1. Откройте проект в Vercel Dashboard
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте переменные:
   - `VITE_API_URL`
   - `VITE_SENTRY_DSN`
4. Пересоберите: **Deployments** → **Redeploy**

---

## 🌐 Netlify

### Почему Netlify?

| Преимущество     | Описание                  |
| ---------------- | ------------------------- |
| 🎨 Простота      | Интуитивный интерфейс     |
| 📝 Формы         | Встроенная обработка форм |
| 🔀 Split testing | A/B тестирование          |

---

### Способ 1: Через веб-интерфейс

#### Шаг 1: Войдите в Netlify

Перейдите: https://netlify.com

> Войдите через GitHub.

#### Шаг 2: Добавьте сайт

1. Нажмите **"Add new site"**
2. Выберите **"Import an existing project"**
3. Подключитесь к GitHub
4. Выберите репозиторий `FastFingers`

#### Шаг 3: Настройте сборку

| Поле                  | Значение        |
| --------------------- | --------------- |
| **Branch to deploy**  | `main`          |
| **Build command**     | `npm run build` |
| **Publish directory** | `dist`          |

> Файл `netlify.toml` уже настроен!

#### Шаг 4: Задеплойте

Нажмите **"Deploy site"**

Сайт доступен по адресу: `https://fastfingers-<random>.netlify.app`

---

### Способ 2: Через Netlify CLI

#### Шаг 1: Установите CLI

```bash
npm install -g netlify-cli
```

#### Шаг 2: Войдите

```bash
netlify login
```

#### Шаг 3: Соберите и задеплойте

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

### Настройка переменных окружения в Netlify

1. В Dashboard откройте **Site settings**
2. Перейдите в **Environment variables**
3. Добавьте переменные:
   - `VITE_API_URL`
   - `VITE_SENTRY_DSN`
4. Пересоберите: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

## ✅ Проверка после деплоя

После развертывания проверьте следующие пункты:

### 1. Основная функциональность

- [ ] Главная страница загружается
- [ ] Тренажёр печати работает
- [ ] Виртуальная клавиатура отображается
- [ ] Звуковые эффекты воспроизводятся
- [ ] Статистика сохраняется

### 2. PWA функциональность

- [ ] Manifest загружается (откройте `https://your-site.com/manifest.webmanifest`)
- [ ] Service Worker регистрируется (DevTools → Application → Service Workers)
- [ ] Приложение можно установить на устройство
- [ ] Офлайн режим работает (отключите интернет и обновите страницу)

### 3. Производительность

Откройте Chrome DevTools (F12) → вкладка **Lighthouse**:

- [ ] Performance Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s

### 4. Кроссбраузерность

Проверьте в браузерах:

- [ ] Chrome/Edge (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Mac/iOS)
- [ ] Chrome (Android)

### 5. Консоль разработчика

Откройте DevTools (F12) → вкладка **Console**:

- [ ] Нет ошибок (красных сообщений)
- [ ] Нет предупреждений о missing variables

---

## 🐛 Устранение проблем

### Проблема 1: Белый экран после деплоя

**Симптомы:** Страница загружается, но показывает белый экран.

**Причина:** Неправильный `base path` в Vite.

**Решение:**

1. Откройте `vite.config.ts`
2. Убедитесь, что есть строка:
   ```typescript
   base: process.env.VITE_BASE_PATH || '/',
   ```
3. Для GitHub Pages добавьте в workflow:
   ```yaml
   env:
     VITE_BASE_PATH: /FastFingers/
   ```
4. Пересоберите и задеплойте заново.

---

### Проблема 2: 404 при обновлении страницы

**Симптомы:** Главная работает, но при обновлении — 404.

**Причина:** Сервер не настроен на SPA роутинг.

**Решение для разных платформ:**

| Платформа        | Решение                           |
| ---------------- | --------------------------------- |
| **Netlify**      | Файл `netlify.toml` уже создан ✅ |
| **Vercel**       | Автоматически ✅                  |
| **Cloudflare**   | Автоматически ✅                  |
| **GitHub Pages** | Не требуется (статичный URL)      |
| **Свой сервер**  | Настройте `try_files` в Nginx     |

---

### Проблема 3: Большой размер bundle

**Симптомы:** Медленная загрузка, Lighthouse < 90.

**Решение:**

1. Проанализируйте bundle:

   ```bash
   npm run build
   # Откройте dist/stats.html в браузере
   ```

2. Оптимизируйте импорты:

   ```typescript
   // ❌ Плохо
   import _ from 'lodash'

   // ✅ Хорошо
   import debounce from 'lodash/debounce'
   ```

3. Включите сжатие на сервере (gzip/brotli).

---

### Проблема 4: Service Worker не обновляется

**Симптомы:** Старая версия сайта после деплоя.

**Решение:**

1. Очистите кэш браузера:
   - DevTools → Application → Clear storage → **Clear site data**
2. Или используйте Hard Reload:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. В production отключите кэширование при разработке.

---

### Проблема 5: Переменные окружения не работают

**Симптомы:** Ошибки API, Sentry не отправляет данные.

**Решение:**

1. Проверьте, что переменные начинаются с `VITE_`:

   ```env
   VITE_API_URL=https://api.example.com ✅
   API_URL=https://api.example.com ❌
   ```

2. Пересоберите проект после добавления переменных:

   ```bash
   npm run build
   ```

3. В настройках платформы убедитесь, что переменные добавлены.

---

## 📊 Сравнение платформ

| Платформа            | Скорость   | Бесплатно | SSL | CDN | Сложность   |
| -------------------- | ---------- | --------- | --- | --- | ----------- |
| **Cloudflare Pages** | ⭐⭐⭐⭐⭐ | ✅        | ✅  | ✅  | ⭐ Легко    |
| **Vercel**           | ⭐⭐⭐⭐⭐ | ✅        | ✅  | ✅  | ⭐ Легко    |
| **Netlify**          | ⭐⭐⭐⭐   | ✅        | ✅  | ✅  | ⭐ Легко    |
| **GitHub Pages**     | ⭐⭐⭐     | ✅        | ✅  | ✅  | ⭐⭐ Средне |

---

## 🏆 Наша рекомендация

**Используйте Cloudflare Pages** — это лучший выбор для FastFingers:

- ✅ Максимальная скорость загрузки
- ✅ Неограниченная пропускная способность
- ✅ Простая настройка (5 минут)
- ✅ Встроенная аналитика
- ✅ Автоматический HTTPS

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте [DEPLOYMENT.md](./DEPLOYMENT.md) — подробное руководство
2. Посмотрите [Issues на GitHub](https://github.com/QuadDarv1ne/FastFingers/issues)
3. Создайте новый Issue с описанием проблемы

---

**Удачного деплоя! 🚀**

_Последнее обновление: Март 2026_
