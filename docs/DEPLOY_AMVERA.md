# 🚀 Деплой FastFingers на Amvera

**Время:** 10 минут  
**Сложность:** ⭐⭐

---

## 📋 Оглавление

1. [О Amvera](#о-amvera)
2. [Подготовка](#подготовка)
3. [Способ 1: Через Git](#способ-1-через-git)
4. [Способ 2: Через Docker](#способ-2-через-docker)
5. [Интеграция с Tilda](#интеграция-с-tilda)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## ℹ️ О Amvera

**Amvera** — российская платформа для хостинга веб-приложений с автоматическим масштабированием.

### Преимущества:
- 🇷🇺 Серверы в России (152-ФЗ)
- ⚡ Автоматический деплой из Git
- 🐳 Поддержка Docker
- 💰 Бесплатный тариф для старта
- 🔒 SSL-сертификаты автоматически

### Тарифы:

| Тариф | CPU | RAM | Диск | Цена |
|-------|-----|-----|------|------|
| **Start** | 0.2 ядра | 512 MB | 1 GB | ~150 ₽/мес |
| **Basic** | 0.5 ядра | 1 GB | 5 GB | ~350 ₽/мес |
| **Pro** | 1 ядро | 2 GB | 10 GB | ~700 ₽/мес |

---

## 🔧 Подготовка

### Шаг 1: Регистрация

1. Перейдите на [amvera.io](https://amvera.io)
2. Нажмите **"Войти"** → выберите **GitHub** или **Email**
3. Подтвердите email

### Шаг 2: Создание проекта

1. В личном кабинете нажмите **"Создать проект"**
2. Выберите тип: **Веб-приложение**
3. Укажите название: `fastfingers`
4. Выберите регион: **Москва** (рекомендуется)

### Шаг 3: Подготовка проекта

Убедитесь, что в корне проекта есть `package.json`:

```json
{
  "name": "fastfingers",
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 📦 Способ 1: Через Git (рекомендуется)

### Шаг 1: Загрузка проекта на GitHub

```bash
# Инициализация репозитория (если не создан)
git init
git add .
git commit -m "Initial commit"

# Создание удалённого репозитория
git remote add origin https://github.com/username/fastfingers.git
git push -u origin main
```

### Шаг 2: Подключение репозитория в Amvera

1. В панели Amvera выберите проект
2. Перейдите во вкладку **"Исходный код"**
3. Нажмите **"Подключить репозиторий"**
4. Выберите **GitHub**
5. Авторизуйте доступ к GitHub
6. Выберите репозиторий `fastfingers`
7. Ветку: `main`

### Шаг 3: Настройка сборки

1. **Тип приложения:** Static App
2. **Build command:** `npm run build`
3. **Output directory:** `dist`
4. **Node.js version:** `18` или `20`

### Шаг 4: Деплой

Нажмите **"Сохранить и развернуть"**

Amvera автоматически:
- Установит зависимости (`npm install`)
- Запустит сборку (`npm run build`)
- Опубликует файлы из `dist`

### Шаг 5: Получение URL

После успешного деплоя вы получите URL:
```
https://fastfingers-<username>.amvera.app
```

### Шаг 6: Настройка домена (опционально)

1. Перейдите в **"Домены"**
2. Нажмите **"Добавить домен"**
3. Введите свой домен: `fastfingers.yoursite.ru`
4. Настройте CNAME в DNS вашего домена:
   ```
   fastfingers CNAME fastfingers-<username>.amvera.app
   ```

---

## 🐳 Способ 2: Через Docker

### Шаг 1: Создание Dockerfile

Создайте файл `Dockerfile` в корне проекта:

```dockerfile
# Этап сборки
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Этап продакшена
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Шаг 2: Создание nginx.conf

Создайте файл `nginx.conf` в корне проекта:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA роутинг
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

### Шаг 3: Создание .dockerignore

Создайте файл `.dockerignore`:

```
node_modules
dist
.git
.gitignore
*.md
.env
.env.*
!.env.example
```

### Шаг 4: Локальная сборка и тест

```bash
# Сборка образа
docker build -t fastfingers .

# Запуск локально
docker run -p 8080:80 fastfingers

# Откройте http://localhost:8080
```

### Шаг 5: Деплой на Amvera

#### Вариант A: Через Docker Hub

```bash
# Логин в Docker Hub
docker login

# Тегирование образа
docker tag fastfingers username/fastfingers:latest

# Пуш в Docker Hub
docker push username/fastfingers:latest
```

В панели Amvera:
1. **"Исходный код"** → **"Docker образ"**
2. Укажите: `username/fastfingers:latest`
3. Нажмите **"Развернуть"**

#### Вариант B: Прямая загрузка

```bash
# Авторизация в Amvera CLI (если есть)
amvera login

# Деплой
amvera deploy
```

---

## 🔗 Интеграция с Tilda

### Шаг 1: Получение URL

После деплоя скопируйте URL приложения:
```
https://fastfingers-<username>.amvera.app
```

### Шаг 2: Вставка в Tilda

Добавьте блок **T123 (HTML-код)** и вставьте:

```html
<iframe 
  src="https://fastfingers-<username>.amvera.app" 
  width="100%" 
  height="750" 
  frameborder="0"
  style="border-radius: 16px; overflow: hidden;"
  title="FastFingers — Тренажёр слепой печати"
  loading="lazy"
></iframe>
```

### Шаг 3: Адаптивный вариант

```html
<div style="
  position: relative; 
  width: 100%; 
  padding-bottom: 65%; 
  overflow: hidden; 
  border-radius: 16px;
  background: #0f0f1a;
">
  <iframe 
    src="https://fastfingers-<username>.amvera.app" 
    style="
      position: absolute; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      border: none;
    "
    title="FastFingers"
    loading="lazy"
  ></iframe>
</div>
```

---

## 🐛 Troubleshooting

### Ошибка: "Build failed"

**Причина:** Проблемы с зависимостями

**Решение:**
```bash
# Очистка кэша
npm cache clean --force

# Удаление node_modules
rm -rf node_modules package-lock.json

# Переустановка
npm install

# Коммит и пуш
git add .
git commit -m "Fix dependencies"
git push
```

---

### Ошибка: "404 Not Found"

**Причина:** Неправильный output directory

**Решение:**
1. Проверьте, что файлы собраны в `dist`
2. В настройках Amvera укажите `dist` как output directory
3. Проверьте наличие `index.html` в `dist`

---

### Ошибка: "White screen"

**Причина:** Проблемы с путями к ассетам

**Решение:**
В `vite.config.js` добавьте:
```javascript
export default defineConfig({
  base: '/',
  // ...остальные настройки
})
```

---

### Долгая загрузка

**Решение:**
1. Включите Gzip сжатие (см. nginx.conf выше)
2. Настройте кэширование статики
3. Используйте CDN для крупных ассетов

---

## ❓ FAQ

### Вопрос: Можно ли использовать свой домен?

**Ответ:** Да! В панели Amvera:
1. Домены → Добавить домен
2. Настройте CNAME в DNS хостинга

---

### Вопрос: Как обновить приложение?

**Ответ:**
```bash
git add .
git commit -m "Update"
git push
```
Amvera автоматически пересоберёт проект.

---

### Вопрос: Есть ли бесплатный тариф?

**Ответ:** Да, тариф **Start** подходит для тестирования. Для продакшена рекомендуется **Basic**.

---

### Вопрос: Как посмотреть логи?

**Ответ:** В панели Amvera → Логи. Или через CLI:
```bash
amvera logs
```

---

### Вопрос: Поддерживается ли HTTPS?

**Ответ:** Да, SSL-сертификат выдаётся автоматически для всех доменов.

---

### Вопрос: Как откатить версию?

**Ответ:**
1. Логи → История развёртываний
2. Выберите предыдущую версию
3. Нажмите **"Откатиться"**

---

## 📊 Сравнение с другими платформами

| Параметр | Amvera | Netlify | reg.ru |
|----------|--------|---------|--------|
| Серверы в РФ | ✅ | ❌ | ✅ |
| 152-ФЗ | ✅ | ❌ | ✅ |
| Бесплатный тариф | ✅ (ограничен) | ✅ | ❌ |
| Авто-деплой из Git | ✅ | ✅ | ❌ |
| Docker | ✅ | ❌ | ✅ |
| SSL | ✅ | ✅ | ✅ |
| Поддержка | 🇷🇺 RU | 🇺🇸 EN | 🇷🇺 RU |

---

## 📞 Поддержка Amvera

- 📧 Email: support@amvera.io
- 💬 Telegram: [@amvera_support](https://t.me/amvera_support)
- 📚 Документация: [docs.amvera.io](https://docs.amvera.io)

---

**Последнее обновление:** Март 2026
