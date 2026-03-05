#!/bin/bash
# Bash скрипт для настройки защиты веток во всех репозиториях
# Требует установленный GitHub CLI: https://cli.github.com/

set -e

echo "🔒 Настройка защиты веток для всех репозиториев"
echo ""

# Проверка наличия gh
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI не найден. Установите с https://cli.github.com/"
    exit 1
fi

echo "✅ GitHub CLI найден"

# Проверка авторизации
if ! gh auth status &> /dev/null; then
    echo "❌ Не авторизованы. Выполните: gh auth login"
    gh auth login
fi

echo "✅ Авторизация подтверждена"
echo ""

# Получение имени пользователя
username=$(gh api user --jq .login)
echo "👤 Пользователь: $username"
echo ""

# Получение списка всех репозиториев
echo "📦 Получение списка репозиториев..."
repos=$(gh repo list --limit 100 --json name,isArchived --jq '.[] | select(.isArchived == false) | .name')

if [ -z "$repos" ]; then
    echo "❌ Репозитории не найдены"
    exit 1
fi

repo_count=$(echo "$repos" | wc -l)
echo "✅ Найдено репозиториев: $repo_count"
echo ""

# Настройки ruleset
ruleset_name="Default branch protection"
branch_name="~DEFAULT_BRANCH"

# JSON для ruleset
read -r -d '' ruleset_json <<EOF
{
  "name": "$ruleset_name",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["$branch_name"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "creation"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "pull_request",
      "parameters": {
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "required_approving_review_count": 0
      }
    }
  ]
}
EOF

# Применение к каждому репозиторию
success=0
failed=0

while IFS= read -r repo; do
    echo "🔒 Настройка: $repo"
    
    # Проверяем, есть ли уже ruleset с таким именем
    existing_ruleset=$(gh api "/repos/$username/$repo/rulesets" --jq '.[] | select(.name == "'$ruleset_name'") | .id' 2>/dev/null || echo "")
    
    if [ -n "$existing_ruleset" ]; then
        echo "  ⚠️  Ruleset уже существует (ID: $existing_ruleset)"
        # Обновляем существующий
        if echo "$ruleset_json" | gh api --method PUT "/repos/$username/$repo/rulesets/$existing_ruleset" --input - > /dev/null 2>&1; then
            echo "  ✅ Обновлён"
            ((success++))
        else
            echo "  ❌ Ошибка при обновлении"
            ((failed++))
        fi
    else
        # Создаём новый
        if echo "$ruleset_json" | gh api --method POST "/repos/$username/$repo/rulesets" --input - > /dev/null 2>&1; then
            echo "  ✅ Создан"
            ((success++))
        else
            echo "  ❌ Ошибка при создании"
            ((failed++))
        fi
    fi
    
    # Небольшая задержка для rate limiting
    sleep 0.5
done <<< "$repos"

echo ""
echo "═══════════════════════════════════════"
echo "📊 Результаты:"
echo "  ✅ Успешно: $success"
echo "  ❌ Ошибки: $failed"
echo "═══════════════════════════════════════"
echo ""
echo "💡 Проверить настройки можно в GitHub Settings → Branches для каждого репозитория"
