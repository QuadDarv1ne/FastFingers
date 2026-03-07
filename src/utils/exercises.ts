import { Exercise } from '../types'
import { practiceTexts, PracticeText, TextCategory, getRandomText } from '../data/practiceTexts'

type Layout = 'qwerty' | 'jcuken' | 'dvorak';

const EASY_WORDS = [
  'он', 'она', 'оно', 'мы', 'вы', 'они', 'там', 'тут', 'вот', 'как', 'так', 'где', 'кто', 'что',
  'мир', 'дом', 'лес', 'кот', 'год', 'рот', 'нос', 'лёд', 'мёд', 'сон', 'дым'
] as const;

const MEDIUM_WORDS = [
  'привет', 'работа', 'книга', 'письмо', 'экран', 'окно', 'дверь', 'стол', 'стул', 'ручка',
  'бумага', 'карта', 'город', 'река', 'море', 'поле', 'гора', 'луна', 'звезда', 'птица'
] as const;

const HARD_WORDS = [
  'программирование', 'клавиатура', 'монитор', 'интернет', 'телефон', 'камера', 'музыка',
  'картина', 'история', 'победа', 'удача', 'здоровье', 'счастье', 'свобода', 'правосудие'
] as const;

const ALL_WORDS = {
  easy: EASY_WORDS,
  medium: MEDIUM_WORDS,
  hard: HARD_WORDS,
} as const;

export const exercises: Exercise[] = [
  // Уровень 1 - Базовые клавиши
  {
    id: 'basic-1',
    title: 'Основной ряд - левая рука',
    description: 'Отработка клавиш основного ряда для левой руки',
    text: 'авып авып авып авып авып авып авып авып авып авып',
    difficulty: 1,
    category: 'basic',
    focusKeys: ['а', 'в', 'ы', 'п'],
  },
  {
    id: 'basic-2',
    title: 'Основной ряд - правая рука',
    description: 'Отработка клавиш основного ряда для правой руки',
    text: 'орлд орлд орлд орлд орлд орлд орлд орлд орлд орлд',
    difficulty: 1,
    category: 'basic',
    focusKeys: ['о', 'р', 'л', 'д'],
  },
  {
    id: 'basic-3',
    title: 'Весь основной ряд',
    description: 'Отработка всех клавиш основного ряда',
    text: 'авып орлд авып орлд выап лдро паыв длро выап лдро',
    difficulty: 2,
    category: 'basic',
    focusKeys: ['а', 'в', 'ы', 'п', 'о', 'р', 'л', 'д'],
  },
  
  // Уровень 2 - Верхний ряд
  {
    id: 'upper-1',
    title: 'Верхний ряд - левая рука',
    description: 'Отработка клавиш верхнего ряда для левой руки',
    text: 'йцуке йцуке йцуке йцуке йцуке йцуке йцуке йцуке',
    difficulty: 3,
    category: 'upper',
    focusKeys: ['й', 'ц', 'у', 'к', 'е'],
  },
  {
    id: 'upper-2',
    title: 'Верхний ряд - правая рука',
    description: 'Отработка клавиш верхнего ряда для правой руки',
    text: 'нгшщз нгшщз нгшщз нгшщз нгшщз нгшщз нгшщз нгшщз',
    difficulty: 3,
    category: 'upper',
    focusKeys: ['н', 'г', 'ш', 'щ', 'з'],
  },
  
  // Уровень 3 - Нижний ряд
  {
    id: 'lower-1',
    title: 'Нижний ряд - левая рука',
    description: 'Отработка клавиш нижнего ряда для левой руки',
    text: 'ячсми ячсми ячсми ячсми ячсми ячсми ячсми ячсми',
    difficulty: 4,
    category: 'lower',
    focusKeys: ['я', 'ч', 'с', 'м', 'и'],
  },
  {
    id: 'lower-2',
    title: 'Нижний ряд - правая рука',
    description: 'Отработка клавиш нижнего ряда для правой руки',
    text: 'тьбю. тьбю. тьбю. тьбю. тьбю. тьбю. тьбю. тьбю.',
    difficulty: 4,
    category: 'lower',
    focusKeys: ['т', 'ь', 'б', 'ю', '.'],
  },
  
  // Уровень 4 - Слова
  {
    id: 'words-1',
    title: 'Простые слова',
    description: 'Тренировка на простых словах',
    text: 'мама папа рама окно дом лес кот мир труд май',
    difficulty: 5,
    category: 'words',
    focusKeys: ['а', 'о', 'м', 'п', 'р', 'д', 'л', 'с'],
  },
  {
    id: 'words-2',
    title: 'Слова средней сложности',
    description: 'Тренировка на словах средней длины',
    text: 'привет работа книга письмо экран клавиатура мышка',
    difficulty: 6,
    category: 'words',
    focusKeys: ['п', 'р', 'и', 'в', 'е', 'т', 'к', 'н'],
  },
  
  // Уровень 5 - Предложения
  {
    id: 'sentences-1',
    title: 'Простые предложения',
    description: 'Тренировка на простых предложениях',
    text: 'На дворе трава, на траве дрова. Не руби дрова на траве двора.',
    difficulty: 7,
    category: 'sentences',
    focusKeys: [],
  },
  {
    id: 'sentences-2',
    title: 'Сложные предложения',
    description: 'Тренировка на сложных предложениях',
    text: 'Съешь ещё этих мягких французских булок, да выпей чаю.',
    difficulty: 8,
    category: 'sentences',
    focusKeys: [],
  },
  
  // Уровень 6 - Панграммы
  {
    id: 'pangrams-1',
    title: 'Панграммы',
    description: 'Предложения, содержащие все буквы алфавита',
    text: 'В чащах юга жил бы цитрус? Да, но фальшивый экземпляр! Съешь же ещё этих мягких французских булок, да выпей чаю.',
    difficulty: 9,
    category: 'pangrams',
    focusKeys: [],
  },
  
  // Уровень 7 - Программный код
  {
    id: 'code-1',
    title: 'Основы программирования',
    description: 'Тренировка на примерах кода',
    text: 'const hello = "world"; function greet(name) { return `Hello, ${name}!`; }',
    difficulty: 8,
    category: 'code',
    focusKeys: [],
  },
  {
    id: 'code-2',
    title: 'Типы данных',
    description: 'Примеры с типами данных TypeScript',
    text: 'interface User { id: number; name: string; email: string; } type Status = "active" | "inactive";',
    difficulty: 9,
    category: 'code',
    focusKeys: [],
  },
  {
    id: 'code-3',
    title: 'React компоненты',
    description: 'Примеры React кода',
    text: 'const [state, setState] = useState(initialValue); useEffect(() => { console.log("mounted"); }, []);',
    difficulty: 9,
    category: 'code',
    focusKeys: [],
  },
  {
    id: 'code-4',
    title: 'CSS стили',
    description: 'Примеры CSS кода',
    text: '.container { display: flex; justify-content: center; align-items: center; gap: 1rem; }',
    difficulty: 7,
    category: 'code',
    focusKeys: [],
  },

  // QWERTY упражнения
  {
    id: 'qwerty-basic-1',
    title: 'QWERTY - Home Row Left',
    description: 'Basic home row practice for left hand',
    text: 'asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf',
    difficulty: 1,
    category: 'basic',
    focusKeys: ['a', 's', 'd', 'f'],
    layout: 'qwerty',
  },
  {
    id: 'qwerty-basic-2',
    title: 'QWERTY - Home Row Right',
    description: 'Basic home row practice for right hand',
    text: 'jkl; jkl; jkl; jkl; jkl; jkl; jkl; jkl; jkl; jkl;',
    difficulty: 1,
    category: 'basic',
    focusKeys: ['j', 'k', 'l', ';'],
    layout: 'qwerty',
  },
  {
    id: 'qwerty-basic-3',
    title: 'QWERTY - Full Home Row',
    description: 'Complete home row practice',
    text: 'asdf jkl; asdf jkl; fdsa ;lkj asdf jkl; fdsa ;lkj',
    difficulty: 2,
    category: 'basic',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    layout: 'qwerty',
  },
  {
    id: 'qwerty-words-1',
    title: 'QWERTY - Simple Words',
    description: 'Simple English words for practice',
    text: 'the be to of and a in that have I it for not on with he as you do at',
    difficulty: 5,
    category: 'words',
    focusKeys: ['t', 'h', 'e', 'a', 'o', 'i', 'n'],
    layout: 'qwerty',
  },

  // Dvorak упражнения
  {
    id: 'dvorak-basic-1',
    title: 'Dvorak - Home Row Left',
    description: 'Basic home row practice for left hand',
    text: 'aoeu aoeu aoeu aoeu aoeu aoeu aoeu aoeu aoeu aoeu',
    difficulty: 1,
    category: 'basic',
    focusKeys: ['a', 'o', 'e', 'u'],
    layout: 'dvorak',
  },
  {
    id: 'dvorak-basic-2',
    title: 'Dvorak - Home Row Right',
    description: 'Basic home row practice for right hand',
    text: 'htns htns htns htns htns htns htns htns htns htns',
    difficulty: 1,
    category: 'basic',
    focusKeys: ['h', 't', 'n', 's'],
    layout: 'dvorak',
  },
  {
    id: 'dvorak-basic-3',
    title: 'Dvorak - Full Home Row',
    description: 'Complete home row practice',
    text: 'aoeu htns aoeu htns uoea snt h aoeu htns uoea snt h',
    difficulty: 2,
    category: 'basic',
    focusKeys: ['a', 'o', 'e', 'u', 'h', 't', 'n', 's'],
    layout: 'dvorak',
  },
  {
    id: 'dvorak-words-1',
    title: 'Dvorak - Simple Words',
    description: 'Simple English words for practice',
    text: 'the be to of and a in that have I it for not on with he as you do at',
    difficulty: 5,
    category: 'words',
    focusKeys: ['t', 'h', 'e', 'a', 'o', 'i', 'n'],
    layout: 'dvorak',
  },
];

export function getRandomExercise(category?: string, difficulty?: number, layout?: Layout): Exercise {
  let pool = exercises

  if (category && difficulty && layout) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && (e.category === category || !e.category) && e.difficulty <= difficulty && (!e.layout || e.layout === layout)) {
        pool.push(e)
      }
    }
  } else if (category && layout) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && (e.category === category || !e.category) && (!e.layout || e.layout === layout)) {
        pool.push(e)
      }
    }
  } else if (category && difficulty) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && e.category === category && e.difficulty <= difficulty) {
        pool.push(e)
      }
    }
  } else if (category) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && e.category === category) {
        pool.push(e)
      }
    }
  } else if (difficulty && layout) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && e.difficulty <= difficulty && (!e.layout || e.layout === layout)) {
        pool.push(e)
      }
    }
  } else if (difficulty) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && e.difficulty <= difficulty) {
        pool.push(e)
      }
    }
  } else if (layout) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && (!e.layout || e.layout === layout)) {
        pool.push(e)
      }
    }
  }

  if (pool.length === 0) pool = exercises
  const firstExercise = pool[0] ?? exercises[0]
  if (!firstExercise) throw new Error('No exercises available')
  const randomIndex = Math.floor(Math.random() * pool.length)
  return pool[randomIndex] ?? firstExercise
}

export function getRandomExercises(count: number, category?: string, difficulty?: number, layout?: Layout): Exercise[] {
  let pool = exercises

  if (category && difficulty && layout) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && (e.category === category || !e.category) && e.difficulty <= difficulty && (!e.layout || e.layout === layout)) {
        pool.push(e)
      }
    }
  } else if (category && layout) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && (e.category === category || !e.category) && (!e.layout || e.layout === layout)) {
        pool.push(e)
      }
    }
  } else if (category && difficulty) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && e.category === category && e.difficulty <= difficulty) {
        pool.push(e)
      }
    }
  } else if (category) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && e.category === category) {
        pool.push(e)
      }
    }
  } else if (difficulty && layout) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && e.difficulty <= difficulty && (!e.layout || e.layout === layout)) {
        pool.push(e)
      }
    }
  } else if (difficulty) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && e.difficulty <= difficulty) {
        pool.push(e)
      }
    }
  } else if (layout) {
    pool = []
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]
      if (e && (!e.layout || e.layout === layout)) {
        pool.push(e)
      }
    }
  }

  if (pool.length === 0) pool = exercises
  const shuffled: Exercise[] = []
  const indices: number[] = pool.map((_, i) => i)
  // Fisher-Yates shuffle
  while (indices.length > 0 && shuffled.length < count) {
    const randomIdx = Math.floor(Math.random() * indices.length)
    const exercise = pool[randomIdx]
    if (exercise) shuffled.push(exercise)
    indices.splice(randomIdx, 1)
  }
  return shuffled
}

const getWordsByDifficulty = (difficulty: number): readonly string[] => {
  if (difficulty <= 3) return ALL_WORDS.easy
  if (difficulty <= 6) return [...ALL_WORDS.easy, ...ALL_WORDS.medium]
  return [...ALL_WORDS.easy, ...ALL_WORDS.medium, ...ALL_WORDS.hard]
}

export function generatePracticeText(wordCount: number, difficulty: number, options: {
  unique?: boolean
  separator?: string
} = {}): string {
  const { unique = false, separator = ' ' } = options
  let words = getWordsByDifficulty(difficulty)

  if (unique) {
    words = [...words].sort(() => Math.random() - 0.5)
    return words.slice(0, Math.min(wordCount, words.length)).join(separator)
  }

  const result: string[] = []
  for (let i = 0; i < wordCount; i++) {
    const word = words[Math.floor(Math.random() * words.length)]
    if (word) result.push(word)
  }
  return result.join(separator)
}

// === Интеграция с базой текстов ===
export function getPracticeTextsByCategory(category: TextCategory): PracticeText[] {
  return practiceTexts.filter(t => t.category === category)
}

export function getPracticeTextsByDifficulty(difficulty: number): PracticeText[] {
  return practiceTexts.filter(t => t.difficulty === difficulty)
}

export function getRandomPracticeText(category?: TextCategory, difficulty?: number): string {
  const text = getRandomText(category, difficulty)
  return text?.text ?? generatePracticeText(20, difficulty ?? 5)
}

export function getAllTextCategories(): TextCategory[] {
  return ['literature', 'code', 'quotes', 'proverbs', 'science', 'technology']
}

export function getTextDifficultyLevels(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9]
}

export function getPracticeTextById(id: string): PracticeText | null {
  return practiceTexts.find(t => t.id === id) || null
}
