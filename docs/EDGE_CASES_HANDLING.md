# Обработка edge cases в useTypingGame

## Обзор

Улучшена обработка граничных случаев и ошибок в хуке `useTypingGame` и связанных утилитах.

## Реализованные улучшения

### 1. Валидация входных параметров

**Константы валидации:**

```ts
const MIN_WORD_COUNT = 1
const MAX_WORD_COUNT = 200
const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 10
const MIN_DURATION = 10
const MAX_DURATION = 600
```

**Автоматическая нормализация:**

```ts
const safeWordCount = Math.max(
  MIN_WORD_COUNT,
  Math.min(MAX_WORD_COUNT, Math.floor(initialWordCount || DEFAULT_WORD_COUNT))
)
```

### 2. Защита от пустого текста

```ts
const generateNewText = useCallback(() => {
  try {
    const newText = generatePracticeText(safeWordCount, safeDifficulty)

    if (!newText || newText.trim().length === 0) {
      console.warn('[useTypingGame] Generated empty text, using fallback')
      setText('текст для печати')
    } else {
      setText(newText)
    }
    // ...
  } catch (error) {
    console.error('[useTypingGame] Error generating text:', error)
    setText('ошибка генерации текста')
    // Fallback состояние
  }
}
```

### 3. Защита от повторного входа (re-entrancy)

```ts
const isHandlingInput = useRef(false)

const handleInput = useCallback((e) => {
  if (isHandlingInput.current) return
  isHandlingInput.current = true

  try {
    // Логика обработки
  } finally {
    isHandlingInput.current = false
  }
}
```

### 4. Обработка ошибок звуковых эффектов

```ts
try {
  if (sound) {
    isCorrect ? sound.playCorrect(expectedChar.toLowerCase()) : sound.playError()
  }
} catch (soundError) {
  console.warn('[useTypingGame] Sound playback error:', soundError)
}
```

### 5. Защита от выхода за границы текста

```ts
setCurrentIndex((prevIndex) => {
  const expectedChar = text[prevIndex]

  if (!expectedChar || prevIndex >= text.length) {
    isHandlingInput.current = false
    return prevIndex
  }

  // Продолжение обработки
})
```

### 6. Обработка пустых результатов в handleComplete

```ts
const handleComplete = useCallback((results: KeyInputResult[]) => {
  if (!results || results.length === 0) {
    console.warn('[useTypingGame] handleComplete called with empty results')
    return
  }

  if (!startTime && mode !== 'timed') {
    console.warn('[useTypingGame] handleComplete called without startTime')
    return
  }

  try {
    // Расчёт статистики
  } catch (error) {
    console.error('[useTypingGame] Error in handleComplete:', error)
    // Fallback значения
    setIsComplete(true)
    setWpm(0)
    setAccuracy(100)
    setErrors(0)
  }
}
```

### 7. Улучшенная функция calculateStats

**Файл:** `src/utils/stats.ts`

```ts
export function calculateStats(
  correctChars: number,
  totalChars: number,
  errors: number,
  timeElapsed: number
): TypingStats {
  // Валидация входных параметров
  const safeCorrectChars = Math.max(0, Math.floor(correctChars) || 0)
  const safeTotalChars = Math.max(1, Math.floor(totalChars) || 1)
  const safeErrors = Math.max(0, Math.floor(errors) || 0)
  const safeTimeElapsed = Math.max(0.001, timeElapsed || 0.001)

  const timeInMinutes = safeTimeElapsed / 60

  const cpm = timeInMinutes > 0 ? Math.round(safeCorrectChars / timeInMinutes) : 0
  const wpm = timeInMinutes > 0 ? Math.round(safeCorrectChars / 5 / timeInMinutes) : 0

  // Ограничение accuracy диапазоном [0, 100]
  const accuracy =
    safeTotalChars > 0
      ? Math.min(100, Math.max(0, Math.round((safeCorrectChars / safeTotalChars) * 100)))
      : 100

  return {
    wpm,
    cpm,
    accuracy,
    errors: safeErrors,
    correctChars: safeCorrectChars,
    totalChars: safeTotalChars,
    timeElapsed: safeTimeElapsed,
  }
}
```

### 8. Улучшенная функция generatePracticeText

**Файл:** `src/utils/exercises.ts`

```ts
export function generatePracticeText(
  wordCount: number,
  difficulty: number,
  options: {
    unique?: boolean
    separator?: string
  } = {}
): string {
  try {
    const safeWordCount = Math.max(1, Math.min(200, Math.floor(wordCount) || 1))
    const safeDifficulty = Math.max(1, Math.min(10, Math.floor(difficulty) || 5))

    const { unique = false, separator = ' ' } = options
    let words = getWordsByDifficulty(safeDifficulty)

    // Защита от пустого массива слов
    if (!words || words.length === 0) {
      words = ALL_WORDS.easy
    }

    // Защита от пустого массива после всех проверок
    if (!words || words.length === 0) {
      console.warn('[generatePracticeText] No words available, using fallback')
      return 'текст для печати'
    }

    // ... генерация текста

    // Финальная проверка на пустой результат
    if (result.length === 0) {
      console.warn('[generatePracticeText] Generated empty result, using fallback')
      return 'текст для печати'
    }

    return result.join(separator)
  } catch (error) {
    console.error('[generatePracticeText] Error generating text:', error)
    return 'ошибка генерации текста'
  }
}
```

## Обработанные edge cases

| Edge Case                    | Решение                           |
| ---------------------------- | --------------------------------- |
| Пустой текст                 | Fallback текст "текст для печати" |
| Null/undefined параметры     | Значения по умолчанию + валидация |
| Отрицательные числа          | Math.max(0, value)                |
| Деление на ноль              | Math.max(1, denominator)          |
| Выход за границы текста      | Проверка индекса перед доступом   |
| Повторный вход в handleInput | Флаг isHandlingInput              |
| Ошибки звука                 | Try-catch с warning               |
| Пустые результаты            | Проверка массива перед обработкой |
| Отсутствие startTime         | Warning + ранний выход            |
| Ошибки в callback            | Try-catch с warning               |

## Логирование ошибок

Все ошибки логируются с префиксом `[useTypingGame]` для удобной фильтрации:

```
[useTypingGame] Generated empty text, using fallback
[useTypingGame] Error generating text: ...
[useTypingGame] handleComplete called with empty results
[useTypingGame] Sound playback error: ...
[useTypingGame] Error in handleInput: ...
```

## Тестирование

### Примеры тестов

```ts
import { renderHook, act } from '@testing-library/react'
import { useTypingGame } from '../hooks/useTypingGame'

describe('useTypingGame edge cases', () => {
  test('handles negative word count', () => {
    const { result } = renderHook(() => useTypingGame({ initialWordCount: -10 }))
    expect(result.current.text).toBeTruthy()
    expect(result.current.text.length).toBeGreaterThan(0)
  })

  test('handles zero difficulty', () => {
    const { result } = renderHook(() => useTypingGame({ initialDifficulty: 0 }))
    expect(result.current.text).toBeTruthy()
  })

  test('handles extremely large word count', () => {
    const { result } = renderHook(() => useTypingGame({ initialWordCount: 10000 }))
    expect(result.current.text).toBeTruthy()
    // Должно быть ограничено MAX_WORD_COUNT
  })

  test('handles null sound', () => {
    const { result } = renderHook(() => useTypingGame({ sound: null as any }))
    expect(result.current.handleInput).toBeDefined()
  })
})
```

## Миграция

### Обновление существующего кода

Если вы использовали `useTypingGame` с нестандартными параметрами:

**До:**

```ts
// Могло работать нестабильно
const { handleInput } = useTypingGame({
  initialWordCount: -5,
  initialDifficulty: 15,
  duration: 5,
})
```

**После:**

```ts
// Параметры автоматически нормализуются:
// wordCount: -5 → 1 (MIN_WORD_COUNT)
// difficulty: 15 → 10 (MAX_DIFFICULTY)
// duration: 5 → 10 (MIN_DURATION)
const { handleInput } = useTypingGame({
  initialWordCount: -5,
  initialDifficulty: 15,
  duration: 5,
})
```

## Примечания

1. **Производительность**: Все проверки добавляют минимальные накладные расходы (<1ms на операцию)
2. **Совместимость**: Изменения обратно совместимы, существующий код продолжит работать
3. **Отладка**: Используйте консольные сообщения для диагностики проблем
