/**
 * Расширенные данные о раскладках клавиатуры
 * Включает информацию о зонах ответственности пальцев
 */

export type FingerZone =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb'

export interface KeyInfo {
  key: string
  finger: FingerZone
  row: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export const FINGER_COLORS: Record<FingerZone, string> = {
  'left-pinky': '#ef4444', // red
  'left-ring': '#f59e0b', // amber
  'left-middle': '#10b981', // emerald
  'left-index': '#3b82f6', // blue
  'right-index': '#3b82f6', // blue
  'right-middle': '#10b981', // emerald
  'right-ring': '#f59e0b', // amber
  'right-pinky': '#ef4444', // red
  thumb: '#8b5cf6', // violet
}

export const JCUKEN_LAYOUT: KeyInfo[] = [
  // Верхний ряд
  { key: 'ё', finger: 'left-pinky', row: 1, difficulty: 'hard' },
  { key: '1', finger: 'left-pinky', row: 1, difficulty: 'hard' },
  { key: '2', finger: 'left-ring', row: 1, difficulty: 'medium' },
  { key: '3', finger: 'left-middle', row: 1, difficulty: 'medium' },
  { key: '4', finger: 'left-index', row: 1, difficulty: 'medium' },
  { key: '5', finger: 'left-index', row: 1, difficulty: 'medium' },
  { key: '6', finger: 'right-index', row: 1, difficulty: 'medium' },
  { key: '7', finger: 'right-index', row: 1, difficulty: 'medium' },
  { key: '8', finger: 'right-middle', row: 1, difficulty: 'medium' },
  { key: '9', finger: 'right-ring', row: 1, difficulty: 'medium' },
  { key: '0', finger: 'right-pinky', row: 1, difficulty: 'hard' },
  { key: '-', finger: 'right-pinky', row: 1, difficulty: 'hard' },
  { key: '=', finger: 'right-pinky', row: 1, difficulty: 'hard' },

  // Основной ряд (home row)
  { key: 'й', finger: 'left-pinky', row: 2, difficulty: 'easy' },
  { key: 'ц', finger: 'left-ring', row: 2, difficulty: 'easy' },
  { key: 'у', finger: 'left-middle', row: 2, difficulty: 'easy' },
  { key: 'к', finger: 'left-index', row: 2, difficulty: 'easy' },
  { key: 'е', finger: 'left-index', row: 2, difficulty: 'easy' },
  { key: 'н', finger: 'right-index', row: 2, difficulty: 'easy' },
  { key: 'г', finger: 'right-index', row: 2, difficulty: 'easy' },
  { key: 'ш', finger: 'right-middle', row: 2, difficulty: 'easy' },
  { key: 'щ', finger: 'right-ring', row: 2, difficulty: 'easy' },
  { key: 'з', finger: 'right-pinky', row: 2, difficulty: 'easy' },
  { key: 'х', finger: 'right-pinky', row: 2, difficulty: 'easy' },
  { key: 'ъ', finger: 'right-pinky', row: 2, difficulty: 'hard' },

  // Средний ряд (home row)
  { key: 'ф', finger: 'left-pinky', row: 3, difficulty: 'easy' },
  { key: 'ы', finger: 'left-ring', row: 3, difficulty: 'easy' },
  { key: 'в', finger: 'left-middle', row: 3, difficulty: 'easy' },
  { key: 'а', finger: 'left-index', row: 3, difficulty: 'easy' },
  { key: 'п', finger: 'left-index', row: 3, difficulty: 'easy' },
  { key: 'р', finger: 'right-index', row: 3, difficulty: 'easy' },
  { key: 'о', finger: 'right-index', row: 3, difficulty: 'easy' },
  { key: 'л', finger: 'right-middle', row: 3, difficulty: 'easy' },
  { key: 'д', finger: 'right-ring', row: 3, difficulty: 'easy' },
  { key: 'ж', finger: 'right-pinky', row: 3, difficulty: 'easy' },
  { key: 'э', finger: 'right-pinky', row: 3, difficulty: 'easy' },

  // Нижний ряд
  { key: 'я', finger: 'left-pinky', row: 4, difficulty: 'medium' },
  { key: 'ч', finger: 'left-ring', row: 4, difficulty: 'medium' },
  { key: 'с', finger: 'left-middle', row: 4, difficulty: 'medium' },
  { key: 'м', finger: 'left-index', row: 4, difficulty: 'medium' },
  { key: 'и', finger: 'left-index', row: 4, difficulty: 'medium' },
  { key: 'т', finger: 'right-index', row: 4, difficulty: 'medium' },
  { key: 'ь', finger: 'right-index', row: 4, difficulty: 'medium' },
  { key: 'б', finger: 'right-middle', row: 4, difficulty: 'medium' },
  { key: 'ю', finger: 'right-ring', row: 4, difficulty: 'medium' },
  { key: '.', finger: 'right-pinky', row: 4, difficulty: 'medium' },
  { key: ',', finger: 'right-pinky', row: 4, difficulty: 'medium' },

  // Пробел
  { key: ' ', finger: 'thumb', row: 5, difficulty: 'easy' },
]

export const QWERTY_LAYOUT: KeyInfo[] = [
  // Верхний ряд
  { key: '`', finger: 'left-pinky', row: 1, difficulty: 'hard' },
  { key: '1', finger: 'left-pinky', row: 1, difficulty: 'hard' },
  { key: '2', finger: 'left-ring', row: 1, difficulty: 'medium' },
  { key: '3', finger: 'left-middle', row: 1, difficulty: 'medium' },
  { key: '4', finger: 'left-index', row: 1, difficulty: 'medium' },
  { key: '5', finger: 'left-index', row: 1, difficulty: 'medium' },
  { key: '6', finger: 'right-index', row: 1, difficulty: 'medium' },
  { key: '7', finger: 'right-index', row: 1, difficulty: 'medium' },
  { key: '8', finger: 'right-middle', row: 1, difficulty: 'medium' },
  { key: '9', finger: 'right-ring', row: 1, difficulty: 'medium' },
  { key: '0', finger: 'right-pinky', row: 1, difficulty: 'hard' },
  { key: '-', finger: 'right-pinky', row: 1, difficulty: 'hard' },
  { key: '=', finger: 'right-pinky', row: 1, difficulty: 'hard' },

  // Основной ряд
  { key: 'q', finger: 'left-pinky', row: 2, difficulty: 'easy' },
  { key: 'w', finger: 'left-ring', row: 2, difficulty: 'easy' },
  { key: 'e', finger: 'left-middle', row: 2, difficulty: 'easy' },
  { key: 'r', finger: 'left-index', row: 2, difficulty: 'easy' },
  { key: 't', finger: 'left-index', row: 2, difficulty: 'easy' },
  { key: 'y', finger: 'right-index', row: 2, difficulty: 'easy' },
  { key: 'u', finger: 'right-index', row: 2, difficulty: 'easy' },
  { key: 'i', finger: 'right-middle', row: 2, difficulty: 'easy' },
  { key: 'o', finger: 'right-ring', row: 2, difficulty: 'easy' },
  { key: 'p', finger: 'right-pinky', row: 2, difficulty: 'easy' },
  { key: '[', finger: 'right-pinky', row: 2, difficulty: 'hard' },
  { key: ']', finger: 'right-pinky', row: 2, difficulty: 'hard' },

  // Home row
  { key: 'a', finger: 'left-pinky', row: 3, difficulty: 'easy' },
  { key: 's', finger: 'left-ring', row: 3, difficulty: 'easy' },
  { key: 'd', finger: 'left-middle', row: 3, difficulty: 'easy' },
  { key: 'f', finger: 'left-index', row: 3, difficulty: 'easy' },
  { key: 'g', finger: 'left-index', row: 3, difficulty: 'easy' },
  { key: 'h', finger: 'right-index', row: 3, difficulty: 'easy' },
  { key: 'j', finger: 'right-index', row: 3, difficulty: 'easy' },
  { key: 'k', finger: 'right-middle', row: 3, difficulty: 'easy' },
  { key: 'l', finger: 'right-ring', row: 3, difficulty: 'easy' },
  { key: ';', finger: 'right-pinky', row: 3, difficulty: 'easy' },
  { key: "'", finger: 'right-pinky', row: 3, difficulty: 'easy' },

  // Нижний ряд
  { key: 'z', finger: 'left-pinky', row: 4, difficulty: 'medium' },
  { key: 'x', finger: 'left-ring', row: 4, difficulty: 'medium' },
  { key: 'c', finger: 'left-middle', row: 4, difficulty: 'medium' },
  { key: 'v', finger: 'left-index', row: 4, difficulty: 'medium' },
  { key: 'b', finger: 'left-index', row: 4, difficulty: 'medium' },
  { key: 'n', finger: 'right-index', row: 4, difficulty: 'medium' },
  { key: 'm', finger: 'right-index', row: 4, difficulty: 'medium' },
  { key: ',', finger: 'right-middle', row: 4, difficulty: 'medium' },
  { key: '.', finger: 'right-ring', row: 4, difficulty: 'medium' },
  { key: '/', finger: 'right-pinky', row: 4, difficulty: 'medium' },

  // Пробел
  { key: ' ', finger: 'thumb', row: 5, difficulty: 'easy' },
]

/**
 * Получить информацию о клавише
 */
export function getKeyInfo(
  key: string,
  layout: 'qwerty' | 'jcuken' | 'dvorak'
): KeyInfo | undefined {
  const layoutData = layout === 'jcuken' ? JCUKEN_LAYOUT : QWERTY_LAYOUT
  return layoutData.find(k => k.key.toLowerCase() === key.toLowerCase())
}

/**
 * Получить все клавиши для определённого пальца
 */
export function getKeysForFinger(
  finger: FingerZone,
  layout: 'qwerty' | 'jcuken' | 'dvorak'
): string[] {
  const layoutData = layout === 'jcuken' ? JCUKEN_LAYOUT : QWERTY_LAYOUT
  return layoutData.filter(k => k.finger === finger).map(k => k.key)
}

/**
 * Получить цвет для клавиши на основе зоны пальца
 */
export function getKeyColor(
  key: string,
  layout: 'qwerty' | 'jcuken' | 'dvorak'
): string {
  const keyInfo = getKeyInfo(key, layout)
  return keyInfo ? FINGER_COLORS[keyInfo.finger] : '#6b7280'
}
