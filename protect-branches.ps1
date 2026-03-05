# PowerShell скрипт для настройки защиты веток во всех репозиториях
# Требует установленный GitHub CLI: https://cli.github.com/

Write-Host "🔒 Настройка защиты веток для всех репозиториев" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия gh
$ghVersion = gh --version 2>$null
if (-not $ghVersion) {
    Write-Host "❌ GitHub CLI не найден. Установите с https://cli.github.com/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ GitHub CLI найден" -ForegroundColor Green

# Проверка авторизации
$authStatus = gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Не авторизованы. Выполните: gh auth login" -ForegroundColor Red
    gh auth login
}

Write-Host "✅ Авторизация подтверждена" -ForegroundColor Green
Write-Host ""

# Получение имени пользователя
$username = gh api user --jq .login
Write-Host "👤 Пользователь: $username" -ForegroundColor Yellow
Write-Host ""

# Получение списка всех репозиториев
Write-Host "📦 Получение списка репозиториев..." -ForegroundColor Cyan
$repos = gh repo list --limit 100 --json name,isArchived --jq '.[] | select(.isArchived == false) | .name'

if (-not $repos) {
    Write-Host "❌ Репозитории не найдены" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Найдено репозиториев: $($repos.Count)" -ForegroundColor Green
Write-Host ""

# Настройки ruleset
$rulesetName = "Default branch protection"
$branchName = "~DEFAULT_BRANCH"

# JSON для ruleset
$rulesetJson = @"
{
  "name": "$rulesetName",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["$branchName"],
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
"@

# Применение к каждому репозиторию
$success = 0
$failed = 0

foreach ($repo in $repos) {
    Write-Host "🔒 Настройка: $repo" -ForegroundColor Yellow
    
    # Проверяем, есть ли уже ruleset с таким именем
    $existingRuleset = gh api "/repos/$username/$repo/rulesets" --jq '.[] | select(.name == "'$rulesetName'") | .id' 2>$null
    
    if ($existingRuleset) {
        Write-Host "  ⚠️  Ruleset уже существует (ID: $existingRuleset)" -ForegroundColor Gray
        # Обновляем существующий
        $result = gh api --method PUT "/repos/$username/$repo/rulesets/$existingRuleset" --input - < ([System.Text.Encoding]::UTF8.GetBytes($rulesetJson)) 2>&1
    } else {
        # Создаём новый
        $result = gh api --method POST "/repos/$username/$repo/rulesets" --input - < ([System.Text.Encoding]::UTF8.GetBytes($rulesetJson)) 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Успешно" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  ❌ Ошибка: $result" -ForegroundColor Red
        $failed++
    }
    
    # Небольшая задержка для rate limiting
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Результаты:" -ForegroundColor Cyan
Write-Host "  ✅ Успешно: $success" -ForegroundColor Green
Write-Host "  ❌ Ошибки: $failed" -ForegroundColor Red
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Проверить настройки можно в GitHub Settings → Branches для каждого репозитория" -ForegroundColor Cyan
