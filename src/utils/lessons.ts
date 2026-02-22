export interface Lesson {
  id: number
  title: string
  description: string
  text: string
  difficulty: number
  focusKeys: string[]
  minWpm: number
  minAccuracy: number
  unlocked: boolean
}

export const lessons: Lesson[] = [
  // Уровень 1: Основной ряд
  {
    id: 1,
    title: 'Основной ряд - левая рука',
    description: 'Изучаем клавиши а, в, ы, п',
    text: 'аааа вввв ыыыы пппп авып пыав вапы ыпав авып пыав вапы ыпав',
    difficulty: 1,
    focusKeys: ['а', 'в', 'ы', 'п'],
    minWpm: 10,
    minAccuracy: 90,
    unlocked: true,
  },
  {
    id: 2,
    title: 'Основной ряд - правая рука',
    description: 'Изучаем клавиши о, р, л, д',
    text: 'оооо рррр лллл дддд орлд лдоро ролд дорл орлд лдоро ролд дорл',
    difficulty: 1,
    focusKeys: ['о', 'р', 'л', 'д'],
    minWpm: 10,
    minAccuracy: 90,
    unlocked: false,
  },
  {
    id: 3,
    title: 'Основной ряд - вместе',
    description: 'Объединяем обе руки',
    text: 'авып орлд авып орлд выап лдро паыв длро выап лдро паыв длро',
    difficulty: 2,
    focusKeys: ['а', 'в', 'ы', 'п', 'о', 'р', 'л', 'д'],
    minWpm: 15,
    minAccuracy: 90,
    unlocked: false,
  },
  {
    id: 4,
    title: 'Простые слова',
    description: 'Первые слова из основного ряда',
    text: 'папа мама рама лава лапа право слово дело рука голова',
    difficulty: 2,
    focusKeys: ['а', 'в', 'ы', 'п', 'о', 'р', 'л', 'д'],
    minWpm: 15,
    minAccuracy: 85,
    unlocked: false,
  },
  
  // Уровень 2: Верхний ряд
  {
    id: 5,
    title: 'Верхний ряд - левая рука',
    description: 'Изучаем клавиши й, ц, у, к, е',
    text: 'йййй цццц уууу кккк ееее йцуке екуйц укейц йцуке екуйц',
    difficulty: 3,
    focusKeys: ['й', 'ц', 'у', 'к', 'е'],
    minWpm: 20,
    minAccuracy: 85,
    unlocked: false,
  },
  {
    id: 6,
    title: 'Верхний ряд - правая рука',
    description: 'Изучаем клавиши н, г, ш, щ, з',
    text: 'нннн гггг шшшщ щщщз зззз нгшщз зщшгн шщнгз нгшщз зщшгн',
    difficulty: 3,
    focusKeys: ['н', 'г', 'ш', 'щ', 'з'],
    minWpm: 20,
    minAccuracy: 85,
    unlocked: false,
  },
  {
    id: 7,
    title: 'Верхний и основной ряд',
    description: 'Комбинируем ряды',
    text: 'йцуке нгшщз авып орлд йцуке нгшщз авып орлд йцуке нгшщз',
    difficulty: 4,
    focusKeys: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з'],
    minWpm: 25,
    minAccuracy: 85,
    unlocked: false,
  },
  {
    id: 8,
    title: 'Слова с верхним рядом',
    description: 'Практика на словах',
    text: 'кот урок рука книга наука школа улица цветок дерево',
    difficulty: 4,
    focusKeys: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з'],
    minWpm: 25,
    minAccuracy: 85,
    unlocked: false,
  },
  
  // Уровень 3: Нижний ряд
  {
    id: 9,
    title: 'Нижний ряд - левая рука',
    description: 'Изучаем клавиши я, ч, с, м, и',
    text: 'яяяя чччч сссс мммм ииии ячсми имсчая ячсми имсчая',
    difficulty: 5,
    focusKeys: ['я', 'ч', 'с', 'м', 'и'],
    minWpm: 30,
    minAccuracy: 85,
    unlocked: false,
  },
  {
    id: 10,
    title: 'Нижний ряд - правая рука',
    description: 'Изучаем клавиши т, ь, б, ю',
    text: 'тттт ьььь бббб юююю тьбюю юбьтт тьюбь тьбюю юбьтт',
    difficulty: 5,
    focusKeys: ['т', 'ь', 'б', 'ю'],
    minWpm: 30,
    minAccuracy: 85,
    unlocked: false,
  },
  {
    id: 11,
    title: 'Все три ряда',
    description: 'Полная клавиатура',
    text: 'йцуке нгшщз авып орлд ячсми тьбюъ йцуке нгшщз авып орлд',
    difficulty: 6,
    focusKeys: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
    minWpm: 35,
    minAccuracy: 85,
    unlocked: false,
  },
  
  // Уровень 4: Предложения
  {
    id: 12,
    title: 'Простые предложения',
    description: 'Печатаем предложения',
    text: 'На дворе трава. На траве дрова. Не руби дрова на траве двора.',
    difficulty: 6,
    focusKeys: [],
    minWpm: 35,
    minAccuracy: 90,
    unlocked: false,
  },
  {
    id: 13,
    title: 'Сложные предложения',
    description: 'Длинные предложения',
    text: 'Съешь ещё этих мягких французских булок, да выпей чаю.',
    difficulty: 7,
    focusKeys: [],
    minWpm: 40,
    minAccuracy: 90,
    unlocked: false,
  },
  {
    id: 14,
    title: 'Панграммы',
    description: 'Все буквы алфавита',
    text: 'В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!',
    difficulty: 7,
    focusKeys: [],
    minWpm: 40,
    minAccuracy: 90,
    unlocked: false,
  },
  
  // Уровень 5: Продвинутый
  {
    id: 15,
    title: 'Технические термины',
    description: 'Слова из IT сферы',
    text: 'компьютер программа интернет браузер сервер файл документ система',
    difficulty: 8,
    focusKeys: [],
    minWpm: 45,
    minAccuracy: 90,
    unlocked: false,
  },
  {
    id: 16,
    title: 'Программный код',
    description: 'Печатаем код',
    text: 'const hello = "world"; function greet(name) { return `Hello, ${name}!`; }',
    difficulty: 8,
    focusKeys: [],
    minWpm: 45,
    minAccuracy: 90,
    unlocked: false,
  },
  {
    id: 17,
    title: 'Типы данных TypeScript',
    description: 'Код с типами',
    text: 'interface User { id: number; name: string; email: string; } type Status = "active" | "inactive";',
    difficulty: 9,
    focusKeys: [],
    minWpm: 50,
    minAccuracy: 90,
    unlocked: false,
  },
  
  // Уровень 6: Мастер
  {
    id: 18,
    title: 'Сложные панграммы',
    description: 'Максимальная сложность',
    text: 'Широкая электрификация южных губерний даст мощный толчок подъёму сельского хозяйства.',
    difficulty: 9,
    focusKeys: [],
    minWpm: 55,
    minAccuracy: 92,
    unlocked: false,
  },
  {
    id: 19,
    title: 'Литературный текст',
    description: 'Отрывок из произведения',
    text: 'В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С-м переулке.',
    difficulty: 10,
    focusKeys: [],
    minWpm: 60,
    minAccuracy: 92,
    unlocked: false,
  },
  {
    id: 20,
    title: 'Финальный экзамен',
    description: 'Проверка всех навыков',
    text: 'Съешь ещё этих мягких французских булок, да выпей чаю. В чащах юга жил бы цитрус? Да, но фальшивый экземпляр! Широкая электрификация южных губерний даст мощный толчок подъёму сельского хозяйства.',
    difficulty: 10,
    focusKeys: [],
    minWpm: 60,
    minAccuracy: 95,
    unlocked: false,
  },
]

// Проверка доступности урока
export function isLessonUnlocked(lessonId: number, completedLessons: number[]): boolean {
  if (lessonId === 1) return true
  
  const prevLesson = lessonId - 1
  return completedLessons.includes(prevLesson)
}

// Проверка завершения урока
export function isLessonCompleted(wpm: number, accuracy: number, lesson: Lesson): boolean {
  return wpm >= lesson.minWpm && accuracy >= lesson.minAccuracy
}
