import { Exercise } from '../types';

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

// Базовые упражнения для разных уровней
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
];

// Генерация случайного текста из упражнений
export function getRandomExercise(category?: string, difficulty?: number): Exercise {
  const filtered = exercises.filter(e => {
    if (category && e.category !== category) return false
    if (difficulty && e.difficulty > difficulty) return false
    return true
  })

  const pool = filtered.length > 0 ? filtered : exercises
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getRandomExercises(count: number, category?: string, difficulty?: number): Exercise[] {
  const filtered = exercises.filter(e => {
    if (category && e.category !== category) return false
    if (difficulty && e.difficulty > difficulty) return false
    return true
  })

  const pool = filtered.length > 0 ? filtered : exercises
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, pool.length))
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
  
  return Array.from({ length: wordCount }, () => words[Math.floor(Math.random() * words.length)]).join(separator)
}
