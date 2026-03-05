# 🛡️ Автоматическая защита веток для всех репозиториев

Скрипты автоматически настроят защиту ветки `main` во всех ваших репозиториях.

---

## 📋 Что будет настроено:

| Правило                          | Описание                          |
| -------------------------------- | --------------------------------- |
| ✅ **Restrict deletions**        | Защита от удаления ветки          |
| ✅ **Restrict creations**        | Защита от создания без прав       |
| ✅ **Block force pushes**        | Блокировка force push             |
| ✅ **Require PR before merging** | Только через Pull Request         |
| ✅ **Dismiss stale reviews**     | Сброс аппрувов при новых коммитах |

---

## 🔧 Требования:

1. **GitHub CLI** — установите с https://cli.github.com/

   **Windows:**

   ```powershell
   winget install GitHub.cli
   # или
   choco install gh
   ```

   **macOS:**

   ```bash
   brew install gh
   ```

   **Linux:**

   ```bash
   # Debian/Ubuntu
   sudo apt install gh

   # Fedora/RHEL
   sudo dnf install gh
   ```

2. **Авторизация:**
   ```bash
   gh auth login
   ```

---

## 🚀 Запуск:

### Windows (PowerShell):

```powershell
# Разрешите выполнение скриптов (один раз)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Запустите скрипт
.\protect-branches.ps1
```

### macOS / Linux (Bash):

```bash
# Сделайте скрипт исполняемым
chmod +x protect-branches.sh

# Запустите
./protect-branches.sh
```

---

## 📊 Результат:

Скрипт:

1. ✅ Проверит установку GitHub CLI
2. ✅ Проверит авторизацию
3. ✅ Получит список всех ваших репозиториев
4. ✅ Создаст ruleset для каждого
5. ✅ Покажет статистику

Пример вывода:

```
🔒 Настройка защиты веток для всех репозиториев

✅ GitHub CLI найден
✅ Авторизация подтверждена

👤 Пользователь: QuadDarv1ne

📦 Получение списка репозиториев...
✅ Найдено репозиториев: 5

🔒 Настройка: FastFingers
  ✅ Создан
🔒 Настройка: AnotherProject
  ✅ Создан
...

═══════════════════════════════════════
📊 Результаты:
  ✅ Успешно: 5
  ❌ Ошибки: 0
═══════════════════════════════════════
```

---

## 🔍 Проверка:

После запуска проверьте любой репозиторий:

1. Откройте https://github.com/your-username/your-repo
2. Перейдите в **Settings → Rules → Rulesets**
3. Убедитесь, что ruleset `Default branch protection` создан и активен

---

## ⚠️ Важные замечания:

| Момент                    | Описание                                                                   |
| ------------------------- | -------------------------------------------------------------------------- |
| **Rate limiting**         | Скрипт делает задержку 500ms между запросами                               |
| **Archived repos**        | Архивированные репозитории пропускаются                                    |
| **Существующие rulesets** | Обновляются, а не дублируются                                              |
| **Ошибки**                | Если репозиторий в организации с собственными правилами, может быть ошибка |

---

## 🗑️ Удаление ruleset (если нужно):

```bash
# PowerShell
$repo = "имя-репозитория"
$username = gh api user --jq .login
$ruleset = gh api "/repos/$username/$repo/rulesets" --jq '.[] | select(.name == "Default branch protection") | .id'
gh api --method DELETE "/repos/$username/$repo/rulesets/$ruleset"

# Bash
repo="имя-репозитория"
username=$(gh api user --jq .login)
ruleset=$(gh api "/repos/$username/$repo/rulesets" --jq '.[] | select(.name == "Default branch protection") | .id')
gh api --method DELETE "/repos/$username/$repo/rulesets/$ruleset"
```

---

## 📚 Документация GitHub:

- [Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub CLI](https://cli.github.com/manual/)
- [REST API for rulesets](https://docs.github.com/en/rest/repos/rules)

---

## 🆘 Если что-то пошло не так:

1. **`gh: command not found`** — установите GitHub CLI
2. **`Not authorized`** — выполните `gh auth login`
3. **`403 Forbidden`** — проверьте права доступа к репозиторию
4. **`422 Validation failed`** — ruleset уже существует, скрипт попытается обновить

---

**💡 Совет:** Запустите сначала на одном тестовом репозитории, чтобы убедиться, что всё работает как ожидается.
