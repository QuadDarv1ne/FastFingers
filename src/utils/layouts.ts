import type { KeyboardLayoutData } from '../types';

export const layouts: Record<string, KeyboardLayoutData> = {
  qwerty: {
    name: 'QWERTY',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    ],
    keyToFinger: {
      // Левая рука
      q: 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
      w: 'left-ring', 's': 'left-ring', 'x': 'left-ring',
      e: 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
      r: 'left-index', 'f': 'left-index', 'v': 'left-index', 't': 'left-index', 'g': 'left-index', 'b': 'left-index',
      // Правая рука
      y: 'right-index', 'h': 'right-index', 'n': 'right-index', 'u': 'right-index', 'j': 'right-index', 'm': 'right-index',
      i: 'right-middle', 'k': 'right-middle', ',': 'right-middle',
      o: 'right-ring', 'l': 'right-ring', '.': 'right-ring',
      p: 'right-pinky', ';': 'right-pinky', '/': 'right-pinky',
      '[': 'right-pinky', ']': 'right-pinky', "'": 'right-pinky',
    },
  },
  jcuken: {
    name: 'ЙЦУКЕН',
    rows: [
      ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
      ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
      ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.'],
    ],
    keyToFinger: {
      // Левая рука
      й: 'left-pinky', 'ф': 'left-pinky', 'я': 'left-pinky',
      ц: 'left-ring', 'ы': 'left-ring', 'ч': 'left-ring',
      у: 'left-middle', 'в': 'left-middle', 'с': 'left-middle',
      к: 'left-index', 'а': 'left-index', 'м': 'left-index', 'е': 'left-index', 'п': 'left-index', 'и': 'left-index',
      // Правая рука
      н: 'right-index', 'р': 'right-index', 'т': 'right-index', 'г': 'right-index', 'о': 'right-index', 'ь': 'right-index',
      ш: 'right-middle', 'л': 'right-middle', 'б': 'right-middle',
      щ: 'right-ring', 'д': 'right-ring', 'ю': 'right-ring',
      з: 'right-pinky', 'ж': 'right-pinky', '.': 'right-pinky',
      х: 'right-pinky', 'э': 'right-pinky', 'ъ': 'right-pinky',
    },
  },
  dvorak: {
    name: 'Dvorak',
    rows: [
      ["'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '='],
      ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-'],
      [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z'],
    ],
    keyToFinger: {
      // Левая рука
      "'": 'left-pinky', 'a': 'left-pinky', ';': 'left-pinky',
      ',': 'left-ring', 'o': 'left-ring', 'q': 'left-ring',
      '.': 'left-middle', 'e': 'left-middle', 'j': 'left-middle',
      p: 'left-index', 'u': 'left-index', 'k': 'left-index', 'y': 'left-index', 'i': 'left-index', 'x': 'left-index',
      // Правая рука
      f: 'right-index', 'd': 'right-index', 'b': 'right-index', 'g': 'right-index', 'h': 'right-index', 'm': 'right-index',
      c: 'right-middle', 't': 'right-middle', 'w': 'right-middle',
      r: 'right-ring', 'n': 'right-ring', 'v': 'right-ring',
      l: 'right-pinky', 's': 'right-pinky', 'z': 'right-pinky',
      '/': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky',
    },
  },
};

// Зоны пальцев для визуализации
export const fingerZones: Record<string, string> = {
  'left-pinky': 'Мизинец (левый)',
  'left-ring': 'Безымянный (левый)',
  'left-middle': 'Средний (левый)',
  'left-index': 'Указательный (левый)',
  'right-index': 'Указательный (правый)',
  'right-middle': 'Средний (правый)',
  'right-ring': 'Безымянный (правый)',
  'right-pinky': 'Мизинец (правый)',
};

// Цвета для зон пальцев
export const fingerColors: Record<string, string> = {
  'left-pinky': '#8b5cf6',
  'left-ring': '#a78bfa',
  'left-middle': '#c4b5fd',
  'left-index': '#ddd6fe',
  'right-index': '#ddd6fe',
  'right-middle': '#c4b5fd',
  'right-ring': '#a78bfa',
  'right-pinky': '#8b5cf6',
};
