import { KeyboardLayoutData } from '../types';

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
      q: 'pinky-left', 'a': 'pinky-left', 'z': 'pinky-left',
      w: 'ring-left', 's': 'ring-left', 'x': 'ring-left',
      e: 'middle-left', 'd': 'middle-left', 'c': 'middle-left',
      r: 'index-left', 'f': 'index-left', 'v': 'index-left', 't': 'index-left', 'g': 'index-left', 'b': 'index-left',
      // Правая рука
      y: 'index-right', 'h': 'index-right', 'n': 'index-right', 'u': 'index-right', 'j': 'index-right', 'm': 'index-right',
      i: 'middle-right', 'k': 'middle-right', ',': 'middle-right',
      o: 'ring-right', 'l': 'ring-right', '.': 'ring-right',
      p: 'pinky-right', ';': 'pinky-right', '/': 'pinky-right',
      '[': 'pinky-right', ']': 'pinky-right', "'": 'pinky-right',
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
      й: 'pinky-left', 'ф': 'pinky-left', 'я': 'pinky-left',
      ц: 'ring-left', 'ы': 'ring-left', 'ч': 'ring-left',
      у: 'middle-left', 'в': 'middle-left', 'с': 'middle-left',
      к: 'index-left', 'а': 'index-left', 'м': 'index-left', 'е': 'index-left', 'п': 'index-left', 'и': 'index-left',
      // Правая рука
      н: 'index-right', 'р': 'index-right', 'т': 'index-right', 'г': 'index-right', 'о': 'index-right', 'ь': 'index-right',
      ш: 'middle-right', 'л': 'middle-right', 'б': 'middle-right',
      щ: 'ring-right', 'д': 'ring-right', 'ю': 'ring-right',
      з: 'pinky-right', 'ж': 'pinky-right', '.': 'pinky-right',
      х: 'pinky-right', 'э': 'pinky-right', 'ъ': 'pinky-right',
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
      "'": 'pinky-left', 'a': 'pinky-left', ';': 'pinky-left',
      ',': 'ring-left', 'o': 'ring-left', 'q': 'ring-left',
      '.': 'middle-left', 'e': 'middle-left', 'j': 'middle-left',
      p: 'index-left', 'u': 'index-left', 'k': 'index-left', 'y': 'index-left', 'i': 'index-left', 'x': 'index-left',
      // Правая рука
      f: 'index-right', 'd': 'index-right', 'b': 'index-right', 'g': 'index-right', 'h': 'index-right', 'm': 'index-right',
      c: 'middle-right', 't': 'middle-right', 'w': 'middle-right',
      r: 'ring-right', 'n': 'ring-right', 'v': 'ring-right',
      l: 'pinky-right', 's': 'pinky-right', 'z': 'pinky-right',
      '/': 'pinky-right', '-': 'pinky-right', '=': 'pinky-right',
    },
  },
};

// Зоны пальцев для визуализации
export const fingerZones: Record<string, string> = {
  'pinky-left': 'Мизинец (левый)',
  'ring-left': 'Безымянный (левый)',
  'middle-left': 'Средний (левый)',
  'index-left': 'Указательный (левый)',
  'index-right': 'Указательный (правый)',
  'middle-right': 'Средний (правый)',
  'ring-right': 'Безымянный (правый)',
  'pinky-right': 'Мизинец (правый)',
};

// Цвета для зон пальцев
export const fingerColors: Record<string, string> = {
  'pinky-left': '#8b5cf6',
  'ring-left': '#a78bfa',
  'middle-left': '#c4b5fd',
  'index-left': '#ddd6fe',
  'index-right': '#ddd6fe',
  'middle-right': '#c4b5fd',
  'ring-right': '#a78bfa',
  'pinky-right': '#8b5cf6',
};
