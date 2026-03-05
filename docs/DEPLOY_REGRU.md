# 🚀 Деплой FastFingers на reg.ru

**Время:** 20 минут  
**Сложность:** ⭐⭐⭐

---

## 📋 Оглавление

1. [О reg.ru](#о-regru)
2. [Выбор тарифа](#выбор-тарифа)
3. [Подготовка](#подготовка)
4. [Способ 1: Классический хостинг](#способ-1-классический-хостинг)
5. [Способ 2: VPS](#способ-2-vps)
6. [Интеграция с Tilda](#интеграция-с-tilda)
7. [Настройка домена](#настройка-домена)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## ℹ️ О reg.ru

**reg.ru** — крупнейший российский регистратор доменов и хостинг-провайдер.

### Преимущества:
- 🇷🇺 Серверы в России (152-ФЗ)
- 🌐 Регистрация доменов
- 💰 Доступные тарифы
- 📞 Поддержка 24/7
- 🔒 SSL-сертификаты

### Недостатки:
- ❌ Нет автоматического деплоя из Git
- ❌ Нет поддержки Node.js на классическом хостинге
- ⚠️ Ручная загрузка файлов

---

## 💳 Выбор тарифа

### Для статического сайта (рекомендуется)

| Тариф | Место | Базы | Цена/мес |
|-------|-------|------|----------|
| **Optimal** | 5 GB | 1 | ~169 ₽ |
| **Maximum** | 15 GB | 5 | ~329 ₽ |
| **Unlimited** | ∞ | ∞ | ~599 ₽ |

**Рекомендация:** Optimal достаточно для FastFingers.

### VPS (для продвинутых)

| Тариф | CPU | RAM | Диск | Цена/мес |
|-------|-----|-----|------|----------|
| **VPS Start** | 1 ядро | 512 MB | 10 GB | ~299 ₽ |
| **VPS Basic** | 1 ядро | 1 GB | 20 GB | ~499 ₽ |
| **VPS Pro** | 2 ядра | 2 GB | 40 GB | ~899 ₽ |

---

## 🔧 Подготовка

### Шаг 1: Регистрация

1. Перейдите на [reg.ru](https://reg.ru)
2. Нажмите **"Личный кабинет"** → **"Регистрация"**
3. Введите email и пароль
4. Подтвердите email

### Шаг 2: Покупка хостинга

1. **Хостинг** → **Виртуальный хостинг**
2. Выберите тариф (рекомендуется **Optimal**)
3. Период: 12 месяцев (выгоднее)
4. Нажмите **"Заказать"**

### Шаг 3: Сборка проекта

```bash
# Перейдите в папку проекта
cd C:\Users\maksi\OneDrive\Documents\GitHub\FastFingers

# Установите зависимости
npm install

# Соберите проект
npm run build
```

После сборки в папке `dist` будут готовые файлы.

---

## 📦 Способ 1: Классический хостинг

### Шаг 1: Вход в панель управления

1. Личный кабинет reg.ru → **"Мои услуги"**
2. Выберите хостинг
3. Нажмите **"Панель управления"**

### Шаг 2: Загрузка файлов

#### Вариант A: Через файловый менеджер

1. В панели хостинга найдите **"Файловый менеджер"**
2. Перейдите в папку `www/ваш-домен.ru/` или `public_html/`
3. Удалите старые файлы (если есть)
4. Нажмите **"Загрузить"**
5. Выберите все файлы из папки `dist`
6. Дождитесь загрузки

#### Вариант B: Через FTP

1. **Получите FTP-доступ** в панели хостинга
2. **Подключитесь через FileZilla:**
   - Хост: `ftp.ваш-домен.ru` или IP сервера
   - Логин/пароль: из панели управления
   - Порт: 21
3. **Загрузите файлы** из `dist` в `www/ваш-домен.ru/`

### Шаг 3: Настройка .htaccess

Создайте файл `.htaccess` в корне сайта:

```apache
# Включение RewriteEngine
RewriteEngine On

# Перенаправление всех запросов на index.html (для SPA)
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Gzip сжатие
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Кэширование статики
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Шаг 4: Проверка

Откройте браузер и перейдите на:
```
https://ваш-домен.ru
```

---

## 🖥️ Способ 2: VPS

### Шаг 1: Покупка VPS

1. **VPS** → **Выбрать тариф**
2. Выберите ОС: **Ubuntu 22.04**
3. Период: 12 месяцев
4. Нажмите **"Заказать"**

### Шаг 2: Подключение по SSH

```bash
ssh root@<IP-адрес-сервера>
```

### Шаг 3: Установка Node.js и nginx

```bash
# Обновление пакетов
apt update && apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка nginx
apt install -y nginx

# Проверка
node -v && nginx -v
```

### Шаг 4: Загрузка проекта

```bash
# Установка Git
apt install -y git

# Клонирование репозитория
cd /var/www
git clone https://github.com/username/fastfingers.git
cd fastfingers

# Установка зависимостей и сборка
npm install
npm run build
```

### Шаг 5: Настройка nginx

Создайте конфиг:

```bash
nano /etc/nginx/sites-available/fastfingers
```

Вставьте содержимое:

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;
    
    root /var/www/fastfingers/dist;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

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

Сохраните (Ctrl+O, Enter) и выйдите (Ctrl+X).

Активируйте сайт:

```bash
ln -s /etc/nginx/sites-available/fastfingers /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Шаг 6: Настройка HTTPS (Let's Encrypt)

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

---

## 🔗 Интеграция с Tilda

### Шаг 1: Получение URL

После деплоя ваш сайт доступен по:
```
https://ваш-домен.ru
```

### Шаг 2: Вставка в Tilda

Добавьте блок **T123 (HTML-код)** и вставьте:

```html
<iframe 
  src="https://ваш-домен.ru" 
  width="100%" 
  height="750" 
  frameborder="0"
  style="border-radius: 16px; overflow: hidden;"
  title="FastFingers — Тренажёр слепой печати"
  loading="lazy"
></iframe>
```

---

## 🌐 Настройка домена

### Шаг 1: Покупка домена

1. **Домены** → **Зарегистрировать домен**
2. Введите имя: `fastfingers.ru`
3. Проверьте доступность
4. Оплатите (~199 ₽/год для .ru)

### Шаг 2: Привязка домена к хостингу

1. Личный кабинет → **Мои услуги** → Хостинг
2. **Добавить домен**
3. Введите имя домена
4. Дождитесь активации (до 24 часов)

---

## 🐛 Troubleshooting

### Ошибка 403 Forbidden

**Причина:** Неправильные права доступа

**Решение (VPS):**
```bash
chmod -R 755 /var/www/fastfingers
chown -R www-data:www-data /var/www/fastfingers
```

---

### Ошибка 404 Not Found

**Причина:** Файлы не в той папке

**Решение:**
1. Проверьте путь в настройках хостинга
2. Файлы должны быть в `www/ваш-домен.ru/`
3. Убедитесь, что `index.html` существует

---

### Белый экран

**Причина:** Проблемы с путями к JS/CSS

**Решение:**
1. Откройте консоль браузера (F12)
2. Проверьте ошибки
3. Убедитесь, что пути в `index.html` правильные

---

## ❓ FAQ

### Вопрос: Как обновить сайт?

**Ответ (хостинг):**
1. Соберите проект: `npm run build`
2. Загрузите файлы через FTP
3. Перезапишите старые файлы

**Ответ (VPS):**
```bash
cd /var/www/fastfingers
git pull
npm install
npm run build
```

---

### Вопрос: Нужна ли база данных?

**Ответ:** Нет, FastFingers — статическое приложение.

---

### Вопрос: Сколько места занимает FastFingers?

**Ответ:** После сборки ~500 KB - 2 MB.

---

## 📊 Сравнение способов деплоя

| Параметр | reg.ru Хостинг | reg.ru VPS | Netlify | Amvera |
|----------|----------------|------------|---------|--------|
| Сложность | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐ |
| Цена/мес | от 169 ₽ | от 299 ₽ | Бесплатно | от 150 ₽ |
| Авто-деплой | ❌ | ⚠️ (скрипт) | ✅ | ✅ |
| Серверы в РФ | ✅ | ✅ | ❌ | ✅ |
| SSL | ✅ | ✅ | ✅ | ✅ |

---

## 📞 Поддержка reg.ru

- 📞 Телефон: 8-800-511-92-41 (бесплатно по РФ)
- 💬 Онлайн-чат: на сайте reg.ru
- 📧 Email: support@reg.ru
- 📚 База знаний: [reg.ru/support](https://www.reg.ru/support/)

---

**Последнее обновление:** Март 2026
