# 🚀 Руководство по развертыванию FastFingers

Полное руководство по развертыванию проекта FastFingers на различных хостинг-платформах.

## 📋 Содержание

- [Подготовка к развертыванию](#подготовка-к-развертыванию)
- [Vercel (Рекомендуется)](#vercel-рекомендуется)
- [Netlify](#netlify)
- [GitHub Pages](#github-pages)
- [Cloudflare Pages](#cloudflare-pages)
- [Обычный хостинг (cPanel/VPS)](#обычный-хостинг-cpanelvps)
- [Docker](#docker)
- [Проверка развертывания](#проверка-развертывания)
- [Устранение проблем](#устранение-проблем)

---

## Подготовка к развертыванию

### 1. Проверка проекта

Убедитесь, что проект собирается без ошибок:

```bash
# Установите зависимости
npm install

# Запустите тесты
npm run test:run

# Проверьте линтер
npm run lint

# Соберите проект
npm run build
```

### 2. Переменные окружения

Если у вас есть переменные окружения, создайте файл `.env.production`:

```env
VITE_API_URL=https://your-api.com
VITE_SENTRY_DSN=your-sentry-dsn
```

⚠️ **Важно:** Не коммитьте `.env.production` в Git! Добавьте его в `.gitignore`.

---

## Vercel (Рекомендуется)

### Преимущества

- ✅ Автоматическое развертывание при push
- ✅ Бесплатный SSL сертификат
- ✅ CDN по всему миру
- ✅ Автоматическая оптимизация
- ✅ Preview для каждого PR

### Способ 1: Через веб-интерфейс (Самый простой)

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Импортируйте репозиторий `QuadDarv1ne/FastFingers`
4. Vercel автоматически определит настройки:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Нажмите **"Deploy"**

✅ Готово! Ваш сайт будет доступен по адресу `https://fastfingers.vercel.app`

### Способ 2: Через CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Разверните проект
vercel

# Для production развертывания
vercel --prod
```

### Настройка переменных окружения в Vercel

1. Откройте проект в Vercel Dashboard
2. Перейдите в **Settings → Environment Variables**
3. Добавьте переменные:
   - `VITE_API_URL`
   - `VITE_SENTRY_DSN`
4. Пересоберите проект

### Настройка кастомного домена

1. В Vercel Dashboard откройте **Settings → Domains**
2. Добавьте ваш домен
3. Настройте DNS записи у вашего регистратора:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## Netlify

### Преимущества

- ✅ Простая настройка
- ✅ Бесплатный SSL
- ✅ Формы и функции
- ✅ Split testing

### Способ 1: Через веб-интерфейс

1. Зайдите на [netlify.com](https://netlify.com)
2. Нажмите **"Add new site → Import an existing project"**
3. Выберите GitHub и репозиторий `QuadDarv1ne/FastFingers`
4. Настройте параметры сборки:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Нажмите **"Deploy site"**

### Способ 2: Через CLI

```bash
# Установите Netlify CLI
npm i -g netlify-cli

# Войдите в аккаунт
netlify login

# Соберите проект
npm run build

# Разверните
netlify deploy --prod --dir=dist
```

### Создание файла конфигурации

Создайте `netlify.toml` в корне проекта:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Настройка переменных окружения

1. В Netlify Dashboard откройте **Site settings → Environment variables**
2. Добавьте переменные
3. Пересоберите сайт

---

## GitHub Pages

### Преимущества

- ✅ Бесплатный хостинг от GitHub
- ✅ Интеграция с репозиторием
- ✅ Автоматическое развертывание через Actions

### Шаг 1: Настройка Vite

Добавьте в `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/FastFingers/', // имя вашего репозитория
  // ... остальная конфигурация
})
```

### Шаг 2: Создание GitHub Action

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Шаг 3: Включение GitHub Pages

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings → Pages**
3. В разделе **Source** выберите **GitHub Actions**
4. Сохраните изменения

### Шаг 4: Развертывание

```bash
# Закоммитьте изменения
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

Сайт будет доступен по адресу: `https://quaddarv1ne.github.io/FastFingers/`

---

## Cloudflare Pages

### Преимущества

- ✅ Быстрый CDN
- ✅ Неограниченная пропускная способность
- ✅ Бесплатный SSL
- ✅ Web Analytics

### Через веб-интерфейс

1. Зайдите на [pages.cloudflare.com](https://pages.cloudflare.com)
2. Нажмите **"Create a project"**
3. Подключите GitHub репозиторий
4. Настройте параметры:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `18`
5. Нажмите **"Save and Deploy"**

### Через Wrangler CLI

```bash
# Установите Wrangler
npm i -g wrangler

# Войдите в аккаунт
wrangler login

# Соберите проект
npm run build

# Разверните
wrangler pages deploy dist --project-name=fastfingers
```

---

## Обычный хостинг (cPanel/VPS)

### Для shared хостинга с cPanel

#### Шаг 1: Сборка проекта локально

```bash
# Соберите проект
npm run build
```

Это создаст папку `dist/` со всеми файлами.

#### Шаг 2: Загрузка на хостинг

**Через FTP/SFTP:**

1. Подключитесь к хостингу через FileZilla или WinSCP
2. Загрузите содержимое папки `dist/` в `public_html/` (или `www/`)
3. Убедитесь, что файл `index.html` находится в корне

**Через cPanel File Manager:**

1. Зайдите в cPanel → File Manager
2. Перейдите в `public_html/`
3. Загрузите все файлы из папки `dist/`

#### Шаг 3: Настройка .htaccess

Создайте файл `.htaccess` в `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Кэширование статических файлов
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
</IfModule>

# Сжатие
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### Для VPS (Ubuntu/Debian)

#### Установка Nginx

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Nginx
sudo apt install nginx -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

#### Развертывание проекта

```bash
# Клонируйте репозиторий
cd /var/www
sudo git clone https://github.com/QuadDarv1ne/FastFingers.git
cd FastFingers

# Установите зависимости и соберите
sudo npm install
sudo npm run build

# Переместите файлы
sudo mkdir -p /var/www/html/fastfingers
sudo cp -r dist/* /var/www/html/fastfingers/
```

#### Настройка Nginx

Создайте файл `/etc/nginx/sites-available/fastfingers`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/html/fastfingers;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/fastfingers /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Установка SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Docker

### Создание Dockerfile

Создайте `Dockerfile` в корне проекта:

```dockerfile
# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Этап production
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Создание nginx.conf

Создайте `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### Создание docker-compose.yml

```yaml
version: '3.8'

services:
  fastfingers:
    build: .
    ports:
      - '80:80'
    restart: unless-stopped
```

### Запуск

```bash
# Сборка образа
docker build -t fastfingers .

# Запуск контейнера
docker run -d -p 80:80 --name fastfingers fastfingers

# Или через docker-compose
docker-compose up -d
```

---

## Проверка развертывания

После развертывания проверьте:

### 1. Основные функции

- ✅ Главная страница загружается
- ✅ Тренажёр печати работает
- ✅ Виртуальная клавиатура отображается
- ✅ Статистика сохраняется
- ✅ Звуковые эффекты работают

### 2. PWA функциональность

- ✅ Manifest загружается (`/manifest.webmanifest`)
- ✅ Service Worker регистрируется
- ✅ Приложение можно установить
- ✅ Офлайн режим работает

### 3. Производительность

Проверьте через Chrome DevTools:

- Lighthouse Score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s

### 4. Тестирование на устройствах

- 💻 Desktop (Chrome, Firefox, Safari, Edge)
- 📱 Mobile (iOS Safari, Android Chrome)
- 📱 Tablet

---

## Устранение проблем

### Проблема: Белый экран после развертывания

**Причина:** Неправильный base path в Vite

**Решение:**

```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // для корневого домена
  // или
  base: '/FastFingers/', // для поддиректории
})
```

### Проблема: 404 при обновлении страницы

**Причина:** Сервер не настроен на SPA

**Решение для Netlify:** Создайте `public/_redirects`:

```
/*    /index.html   200
```

**Решение для Vercel:** Создайте `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Проблема: Большой размер bundle

**Решение:**

```bash
# Анализируйте bundle
npm run build

# Откройте dist/stats.html для анализа
```

Оптимизируйте импорты:

```typescript
// Плохо
import _ from 'lodash'

// Хорошо
import debounce from 'lodash/debounce'
```

### Проблема: Медленная загрузка

**Решение:**

1. Включите сжатие (gzip/brotli)
2. Настройте кэширование
3. Используйте CDN
4. Оптимизируйте изображения

### Проблема: Service Worker не обновляется

**Решение:**

```bash
# Очистите кэш браузера
# Или используйте Hard Reload (Ctrl+Shift+R)

# Проверьте версию в vite.config.ts
```

---

## Автоматизация развертывания

### GitHub Actions для множественного развертывания

Создайте `.github/workflows/deploy-multi.yml`:

```yaml
name: Deploy to Multiple Platforms

on:
  push:
    branches: [main]

jobs:
  deploy-vercel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-netlify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## Мониторинг и аналитика

### Sentry (Отслеживание ошибок)

Уже настроен в проекте! Добавьте DSN:

```env
VITE_SENTRY_DSN=your-sentry-dsn
```

### Google Analytics

Добавьте в `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || []
  function gtag() {
    dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', 'G-XXXXXXXXXX')
</script>
```

---

## Рекомендации по выбору хостинга

| Хостинг              | Лучше для                         | Цена      | Сложность     |
| -------------------- | --------------------------------- | --------- | ------------- |
| **Vercel**           | Быстрое развертывание, автодеплой | Бесплатно | ⭐ Легко      |
| **Netlify**          | Формы, функции, A/B тесты         | Бесплатно | ⭐ Легко      |
| **GitHub Pages**     | Open source проекты               | Бесплатно | ⭐⭐ Средне   |
| **Cloudflare Pages** | Максимальная скорость             | Бесплатно | ⭐ Легко      |
| **VPS**              | Полный контроль                   | От $5/мес | ⭐⭐⭐ Сложно |

### Наша рекомендация для FastFingers:

**🏆 Vercel** — идеальный выбор для этого проекта:

- Нулевая настройка
- Автоматическое развертывание
- Отличная производительность
- Бесплатный план более чем достаточен

---

## Чек-лист перед развертыванием

- [ ] Проект собирается без ошибок (`npm run build`)
- [ ] Все тесты проходят (`npm run test:run`)
- [ ] Линтер не выдает ошибок (`npm run lint`)
- [ ] Переменные окружения настроены
- [ ] `.env` файлы не закоммичены в Git
- [ ] Настроен правильный `base` в `vite.config.ts`
- [ ] Проверена работа на разных браузерах
- [ ] Настроен мониторинг ошибок (Sentry)
- [ ] Добавлена аналитика (опционально)

---

## Полезные команды

```bash
# Локальный предпросмотр production сборки
npm run preview

# Анализ размера bundle
npm run build
# Откройте dist/stats.html

# Проверка PWA
npx lighthouse http://localhost:4173 --view

# Очистка кэша и пересборка
rm -rf node_modules dist
npm install
npm run build
```

---

## Поддержка

Если возникли проблемы:

1. Проверьте [Issues](https://github.com/QuadDarv1ne/FastFingers/issues)
2. Создайте новый Issue с описанием проблемы
3. Приложите логи и скриншоты

---

**Удачного развертывания! 🚀**
