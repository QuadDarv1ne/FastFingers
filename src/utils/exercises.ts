import { Exercise } from '../types';

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
];

// Генерация случайного текста из упражнений
export function getRandomExercise(category?: string, difficulty?: number): Exercise {
  let filtered = exercises;
  
  if (category) {
    filtered = filtered.filter(e => e.category === category);
  }
  
  if (difficulty) {
    filtered = filtered.filter(e => e.difficulty <= difficulty);
  }
  
  if (filtered.length === 0) {
    filtered = exercises;
  }
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

// Генерация текста из слов для тренировки
export function generatePracticeText(wordCount: number, difficulty: number): string {
  const easyWords = ['он', 'она', 'оно', 'мы', 'вы', 'они', 'там', 'тут', 'вот', 'как', 'так', 'где', 'кто', 'что', 'мир', 'дом', 'лес', 'кот', 'год', 'рот', 'нос', 'лёд', 'мёд', 'сон', 'дым'];
  const mediumWords = ['привет', 'работа', 'книга', 'письмо', 'экран', 'окно', 'дверь', 'стол', 'стул', 'ручка', 'бумага', 'карта', 'город', 'река', 'море', 'поле', 'гора', 'луна', 'звезда', 'птица'];
  const hardWords = ['программирование', 'клавиатура', 'монитор', 'интернет', 'телефон', 'камера', 'музыка', 'картина', 'история', 'победа', 'удача', 'здоровье', 'счастье', 'свобода', 'правосудие'];
  
  let words: string[];
  if (difficulty <= 3) {
    words = easyWords;
  } else if (difficulty <= 6) {
    words = [...easyWords, ...mediumWords];
  } else {
    words = [...easyWords, ...mediumWords, ...hardWords];
  }
  
  const result: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  
  return result.join(' ');
}
