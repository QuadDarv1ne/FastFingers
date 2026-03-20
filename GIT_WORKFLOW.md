# 📚 Git Workflow - Руководство по работе с Git

**Автор:** Dupley Maxim Igorevich  
**Copyright:** 2025-2026 © Dupley Maxim Igorevich

Полное руководство по работе с Git в проекте FastFingers.

## 📋 Содержание

- [Основные команды](#основные-команды)
- [Ежедневный рабочий процесс](#ежедневный-рабочий-процесс)
- [Работа с ветками](#работа-с-ветками)
- [Синхронизация веток](#синхронизация-веток)
- [Разрешение конфликтов](#разрешение-конфликтов)
- [Полезные команды](#полезные-команды)
- [Устранение проблем](#устранение-проблем)

---

## Основные команды

### Проверка статуса

```bash
# Посмотреть текущий статус
git status

# Посмотреть все ветки
git branch -a

# Посмотреть ветки с информацией о tracking
git branch -vv
```

### Сохранение изменений

```bash
# Добавить все изменения
git add .

# Добавить конкретный файл
git add путь/к/файлу.ts

# Закоммитить с сообщением
git commit -m "описание изменений"

# Отправить на GitHub
git push origin название-ветки
```

---

## Ежедневный рабочий процесс

### 1. Начало работы

```bash
# Убедитесь, что вы на нужной ветке
git branch

# Получите последние изменения
git pull origin dev
```

### 2. Внесение изменений

```bash
# Работайте над кодом...

# Проверьте что изменилось
git status
git diff

# Добавьте изменения
git add .

# Закоммитьте
git commit -m "feat: добавлена новая функция"
```

### 3. Отправка изменений

```bash
# Отправьте на GitHub
git push origin dev
```

---

## Работа с ветками

### Структура веток в проекте

- **main** — стабильная версия для production
- **dev** — разработка новых функций

### Создание новой ветки

```bash
# Создать и переключиться на новую ветку
git checkout -b feature/новая-функция

# Или создать от конкретной ветки
git checkout -b feature/новая-функция dev
```

### Переключение между ветками

```bash
# Переключиться на существующую ветку
git checkout dev
git checkout main

# Посмотреть все ветки
git branch -a
```

### Удаление ветки

```bash
# Удалить локальную ветку
git branch -d название-ветки

# Принудительное удаление
git branch -D название-ветки

# Удалить удалённую ветку
git push origin --delete название-ветки
```

---

## Синхронизация веток

### Слияние dev в main (Стандартный процесс)

```bash
# 1. Переключитесь на main
git checkout main

# 2. Получите последние изменения
git pull origin main

# 3. Слейте dev в main
git merge dev

# 4. Если есть конфликты - разрешите их (см. раздел ниже)

# 5. Отправьте изменения
git push origin main
```

### Обновление dev из main

```bash
# 1. Переключитесь на dev
git checkout dev

# 2. Получите последние изменения
git pull origin dev

# 3. Слейте main в dev
git merge main

# 4. Отправьте изменения
git push origin dev
```

### Быстрая синхронизация обеих веток

```bash
# Синхронизация dev → main
git checkout main
git pull origin main
git merge dev
git push origin main

# Синхронизация main → dev
git checkout dev
git pull origin dev
git merge main
git push origin dev
```

---

## Разрешение конфликтов

### Что такое конфликт?

Конфликт возникает, когда одна и та же часть файла изменена в обеих ветках.

### Как выглядит конфликт

```typescript
<<<<<<< HEAD
// Ваша версия (текущая ветка)
const value = 'старое значение'
=======
// Версия из другой ветки
const value = 'новое значение'
>>>>>>> dev
```

### Способы разрешения

#### Способ 1: Вручную (рекомендуется для важных изменений)

1. Откройте файл с конфликтом
2. Найдите маркеры `<<<<<<<`, `=======`, `>>>>>>>`
3. Выберите нужную версию или объедините обе
4. Удалите маркеры конфликта
5. Сохраните файл

```bash
# Отметьте конфликт как разрешённый
git add путь/к/файлу

# Завершите слияние
git commit
```

#### Способ 2: Принять одну из версий целиком

```bash
# Принять версию из текущей ветки (HEAD)
git checkout --ours путь/к/файлу

# Принять версию из вливаемой ветки (dev)
git checkout --theirs путь/к/файлу

# Отметить как разрешённый
git add путь/к/файлу

# Завершить слияние
git commit
```

#### Способ 3: Отменить слияние

```bash
# Если что-то пошло не так
git merge --abort
```

### Пример разрешения конфликта

```bash
# 1. Увидели конфликт при слиянии
git merge dev
# CONFLICT (content): Merge conflict in src/App.tsx

# 2. Посмотрите какие файлы в конфликте
git status

# 3. Откройте файл и разрешите конфликт вручную
# Или используйте:
git checkout --theirs src/App.tsx  # взять версию из dev

# 4. Добавьте разрешённые файлы
git add src/App.tsx

# 5. Завершите слияние
git commit -m "Merge dev into main, resolved conflicts"

# 6. Отправьте изменения
git push origin main
```

---

## Полезные команды

### Просмотр истории

```bash
# Посмотреть историю коммитов
git log

# Компактный вид
git log --oneline

# С графом веток
git log --oneline --graph --all

# Последние 10 коммитов
git log --oneline -10

# История конкретного файла
git log --follow путь/к/файлу
```

### Отмена изменений

```bash
# Отменить изменения в файле (до add)
git restore путь/к/файлу

# Отменить все изменения
git restore .

# Убрать файл из staged (после add)
git restore --staged путь/к/файлу

# Отменить последний коммит (изменения останутся)
git reset --soft HEAD~1

# Отменить последний коммит (изменения удалятся)
git reset --hard HEAD~1
```

### Временное сохранение изменений

```bash
# Сохранить текущие изменения
git stash

# Посмотреть список stash
git stash list

# Восстановить последний stash
git stash pop

# Восстановить конкретный stash
git stash apply stash@{0}

# Удалить stash
git stash drop
```

### Работа с удалённым репозиторием

```bash
# Посмотреть удалённые репозитории
git remote -v

# Получить изменения без слияния
git fetch origin

# Получить и слить изменения
git pull origin dev

# Отправить изменения
git push origin dev

# Отправить с установкой upstream
git push -u origin dev

# Удалить удалённую ветку
git push origin --delete название-ветки
```

---

## Соглашения о коммитах

### Формат сообщения

```
тип: краткое описание

Подробное описание (опционально)
```

### Типы коммитов

- **feat:** новая функция
- **fix:** исправление бага
- **docs:** изменения в документации
- **style:** форматирование, отступы (не влияет на код)
- **refactor:** рефакторинг кода
- **perf:** улучшение производительности
- **test:** добавление тестов
- **chore:** обновление зависимостей, конфигов

### Примеры

```bash
git commit -m "feat: добавлен режим спринта"
git commit -m "fix: исправлена ошибка в подсчёте WPM"
git commit -m "docs: обновлено README"
git commit -m "refactor: упрощена логика клавиатуры"
git commit -m "chore: обновлены зависимости"
```

---

## Устранение проблем

### Проблема: "Your branch has diverged"

**Причина:** Локальная и удалённая ветки разошлись

**Решение 1:** Слияние

```bash
git pull origin dev
# Разрешите конфликты если есть
git push origin dev
```

**Решение 2:** Rebase (для чистой истории)

```bash
git pull --rebase origin dev
git push origin dev
```

### Проблема: "reference broken"

**Причина:** Повреждённые ссылки в .git

**Решение:**

```bash
# Удалите повреждённые ссылки
Remove-Item -Force .git/refs/remotes/origin/название-ветки -ErrorAction SilentlyContinue
Remove-Item -Force .git/ORIG_HEAD -ErrorAction SilentlyContinue

# Обновите информацию
git fetch --prune origin
```

### Проблема: "fatal: refusing to merge unrelated histories"

**Причина:** Ветки не имеют общей истории

**Решение:**

```bash
git pull origin main --allow-unrelated-histories
```

### Проблема: Случайно закоммитили в main вместо dev

**Решение:**

```bash
# 1. Создайте ветку с текущими изменениями
git branch temp-branch

# 2. Вернитесь на предыдущий коммит в main
git reset --hard HEAD~1

# 3. Переключитесь на dev
git checkout dev

# 4. Слейте временную ветку
git merge temp-branch

# 5. Удалите временную ветку
git branch -d temp-branch

# 6. Отправьте изменения
git push origin dev
```

### Проблема: Нужно отменить push

**Решение:**

```bash
# ВНИМАНИЕ: Используйте только если никто не успел забрать изменения!

# 1. Откатите локальный коммит
git reset --hard HEAD~1

# 2. Принудительно отправьте
git push --force origin название-ветки
```

⚠️ **Никогда не используйте --force на main в командных проектах!**

### Проблема: Забыли добавить файл в коммит

**Решение:**

```bash
# Добавьте файл
git add забытый-файл.ts

# Измените последний коммит
git commit --amend --no-edit

# Отправьте (если ещё не пушили)
git push origin dev

# Если уже пушили
git push --force origin dev
```

---

## Работа с .gitignore

### Что игнорировать

```gitignore
# Зависимости
node_modules/
.pnp
.pnp.js

# Сборка
dist/
build/

# Переменные окружения
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Логи
*.log
npm-debug.log*
```

### Удалить файл из Git, но оставить локально

```bash
# Удалить из Git
git rm --cached путь/к/файлу

# Добавить в .gitignore
echo "путь/к/файлу" >> .gitignore

# Закоммитить
git commit -m "chore: удалён файл из Git"
git push
```

---

## Чек-лист перед push

- [ ] Код собирается без ошибок (`npm run build`)
- [ ] Тесты проходят (`npm run test:run`)
- [ ] Линтер не ругается (`npm run lint`)
- [ ] Нет console.log в коде
- [ ] Нет закоммиченных .env файлов
- [ ] Сообщение коммита понятное и описательное
- [ ] Проверили `git status` перед коммитом

---

## Быстрая шпаргалка

### Ежедневная работа

```bash
# Утро - получить изменения
git checkout dev
git pull origin dev

# Работа над кодом
# ... редактирование файлов ...

# Сохранение
git add .
git commit -m "feat: описание"
git push origin dev
```

### Синхронизация dev → main

```bash
git checkout main
git pull origin main
git merge dev
# Если конфликты - разрешите
git push origin main
```

### Быстрое исправление

```bash
# Сохраните текущую работу
git stash

# Переключитесь на main
git checkout main

# Исправьте баг
# ... редактирование ...

# Закоммитьте
git add .
git commit -m "fix: критический баг"
git push origin main

# Вернитесь к работе
git checkout dev
git stash pop
```

---

## Алиасы для ускорения работы

Добавьте в `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    cm = commit -m
    aa = add .
    pl = pull
    ps = push
    lg = log --oneline --graph --all -10
    undo = reset --soft HEAD~1
```

Использование:

```bash
git st          # вместо git status
git co dev      # вместо git checkout dev
git cm "fix"    # вместо git commit -m "fix"
git lg          # красивый лог
```

---

## Работа с GitHub

### Создание Pull Request

1. Отправьте ветку на GitHub:

   ```bash
   git push origin feature/новая-функция
   ```

2. Откройте GitHub репозиторий
3. Нажмите **"Compare & pull request"**
4. Заполните описание
5. Нажмите **"Create pull request"**

### Обновление форка

```bash
# Добавьте upstream (один раз)
git remote add upstream https://github.com/original/repo.git

# Получите изменения
git fetch upstream

# Слейте в свою ветку
git merge upstream/main

# Отправьте в свой форк
git push origin main
```

---

## Продвинутые техники

### Rebase вместо merge (для чистой истории)

```bash
# Вместо merge используйте rebase
git checkout feature-branch
git rebase main

# Если конфликты - разрешите и продолжите
git add .
git rebase --continue

# Отправьте (потребуется force)
git push --force origin feature-branch
```

⚠️ **Не используйте rebase на публичных ветках (main, dev)!**

### Cherry-pick (взять конкретный коммит)

```bash
# Скопировать коммит из другой ветки
git cherry-pick хэш-коммита

# Пример
git checkout main
git cherry-pick abc123
```

### Интерактивный rebase (редактирование истории)

```bash
# Редактировать последние 3 коммита
git rebase -i HEAD~3

# В редакторе:
# pick - оставить коммит
# reword - изменить сообщение
# squash - объединить с предыдущим
# drop - удалить коммит
```

### Поиск бага с помощью bisect

```bash
# Начать поиск
git bisect start

# Отметить текущую версию как плохую
git bisect bad

# Отметить старую версию как хорошую
git bisect good хэш-коммита

# Git будет предлагать коммиты для проверки
# Тестируйте и отмечайте:
git bisect good  # если баг не воспроизводится
git bisect bad   # если баг есть

# Завершить поиск
git bisect reset
```

---

## Работа с тегами (версии)

### Создание тега

```bash
# Лёгкий тег
git tag v1.0.0

# Аннотированный тег (рекомендуется)
git tag -a v1.0.0 -m "Версия 1.0.0 - первый релиз"

# Отправить теги на GitHub
git push origin --tags
```

### Просмотр тегов

```bash
# Список всех тегов
git tag

# Информация о теге
git show v1.0.0
```

### Удаление тега

```bash
# Удалить локальный тег
git tag -d v1.0.0

# Удалить удалённый тег
git push origin --delete v1.0.0
```

---

## Безопасность и лучшие практики

### ✅ Делайте

- Коммитьте часто, маленькими порциями
- Пишите понятные сообщения коммитов
- Проверяйте код перед коммитом
- Используйте ветки для новых функций
- Регулярно синхронизируйтесь с удалённым репозиторием
- Делайте pull перед началом работы

### ❌ Не делайте

- Не коммитьте .env файлы с секретами
- Не используйте `git push --force` на main
- Не коммитьте node_modules
- Не коммитьте большие бинарные файлы
- Не работайте напрямую в main
- Не оставляйте console.log в коде

---

## Автоматизация с Husky

Проект использует Husky для автоматических проверок.

### Что проверяется перед коммитом

- Линтинг TypeScript файлов
- Форматирование CSS, JSON, MD файлов
- Prettier проверки

### Обновление Husky

```bash
# Если видите предупреждение о deprecated
# Откройте .husky/pre-commit и удалите строки:
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Оставьте только:
npx lint-staged
```

---

## Шпаргалка по Git Flow

```
main (production)
  ↑
  | merge
  |
dev (разработка)
  ↑
  | merge
  |
feature/новая-функция (фичи)
```

### Процесс разработки

1. Создайте ветку от dev: `git checkout -b feature/название`
2. Работайте и коммитьте: `git commit -m "feat: ..."`
3. Отправьте на GitHub: `git push origin feature/название`
4. Создайте Pull Request: feature → dev
5. После ревью слейте в dev
6. Периодически сливайте dev → main

---

## Полезные ссылки

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flight Rules](https://github.com/k88hudson/git-flight-rules)

---

## Экстренная помощь

### Всё сломалось, что делать?

```bash
# 1. Сохраните текущую работу
git stash

# 2. Посмотрите статус
git status

# 3. Если в процессе слияния
git merge --abort

# 4. Если в процессе rebase
git rebase --abort

# 5. Вернитесь к последнему рабочему состоянию
git reset --hard origin/dev

# 6. Восстановите работу
git stash pop
```

### Нужна помощь?

1. Скопируйте вывод `git status`
2. Скопируйте сообщение об ошибке
3. Создайте Issue на GitHub
4. Опишите что делали и что пошло не так

---

**Успешной работы с Git! 🚀**
