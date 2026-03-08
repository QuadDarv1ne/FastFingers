export interface PracticeText {
  id: string
  category: TextCategory
  difficulty: number
  text: string
  title: string
  source?: string
}

export type TextCategory =
  | 'literature'
  | 'code'
  | 'quotes'
  | 'proverbs'
  | 'science'
  | 'technology'
  | 'movies'
  | 'news'
  | 'philosophy'
  | 'business'

export const practiceTexts: PracticeText[] = [
  // === ЛИТЕРАТУРА ===
  {
    id: 'lit-1',
    category: 'literature',
    difficulty: 3,
    title: 'А.С. Пушкин — Евгений Онегин',
    text: 'Мой дядя самых честных правил, когда не в шутку занемог, он уважать себя заставил и лучше выдумать не мог.',
    source: 'Евгений Онегин'
  },
  {
    id: 'lit-2',
    category: 'literature',
    difficulty: 4,
    title: 'Л.Н. Толстой — Война и мир',
    text: 'В начале июля тысяча восемьсот пятого года в комнату, нанятую у поджарова мещанина на Васильевском острове, пришел молодой человек.',
    source: 'Война и мир'
  },
  {
    id: 'lit-3',
    category: 'literature',
    difficulty: 5,
    title: 'Ф.М. Достоевский — Преступление и наказание',
    text: 'В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С-м переулке.',
    source: 'Преступление и наказание'
  },
  {
    id: 'lit-4',
    category: 'literature',
    difficulty: 6,
    title: 'М.А. Булгаков — Мастер и Маргарита',
    text: 'Однажды весною, в час небывало жаркого заката, в Москве, на Патриарших прудах, появились два гражданина.',
    source: 'Мастер и Маргарита'
  },
  {
    id: 'lit-5',
    category: 'literature',
    difficulty: 7,
    title: 'В.В. Набоков — Приглашение на казнь',
    text: 'Цинцинат Ц. проснулся, потянулся, нащупал возле себя очки, надел их и, приподнявшись на локте, взглянул на кровать.',
    source: 'Приглашение на казнь'
  },
  
  // === КОД ===
  {
    id: 'code-1',
    category: 'code',
    difficulty: 2,
    title: 'JavaScript — Hello World',
    text: 'console.log("Hello, World!");',
  },
  {
    id: 'code-2',
    category: 'code',
    difficulty: 4,
    title: 'JavaScript — Функция',
    text: 'function greet(name) { return `Hello, ${name}!`; }',
  },
  {
    id: 'code-3',
    category: 'code',
    difficulty: 5,
    title: 'TypeScript — Интерфейс',
    text: 'interface User { id: number; name: string; email: string; }',
  },
  {
    id: 'code-4',
    category: 'code',
    difficulty: 6,
    title: 'React — Компонент',
    text: 'const Button = ({ onClick, children }) => <button onClick={onClick}>{children}</button>;',
  },
  {
    id: 'code-5',
    category: 'code',
    difficulty: 7,
    title: 'React — Хук useState',
    text: 'const [count, setCount] = useState<number>(0); useEffect(() => { document.title = `Count: ${count}`; }, [count]);',
  },
  {
    id: 'code-6',
    category: 'code',
    difficulty: 8,
    title: 'Node.js — Express сервер',
    text: 'app.get("/api/users/:id", async (req, res) => { const user = await User.findById(req.params.id); res.json(user); });',
  },
  
  // === ЦИТАТЫ ===
  {
    id: 'quote-1',
    category: 'quotes',
    difficulty: 2,
    title: 'Стив Джобс',
    text: 'Stay hungry, stay foolish.',
    source: 'Стэнфордская речь 2005'
  },
  {
    id: 'quote-2',
    category: 'quotes',
    difficulty: 3,
    title: 'Альберт Эйнштейн',
    text: 'Воображение важнее, чем знания. Знания ограничены, тогда как воображение охватывает целый мир.',
    source: 'Интервью 1929'
  },
  {
    id: 'quote-3',
    category: 'quotes',
    difficulty: 4,
    title: 'Марк Твен',
    text: 'Через двадцать лет вы будете больше жалеть о том, чего не сделали, чем о том, что сделали.',
  },
  {
    id: 'quote-4',
    category: 'quotes',
    difficulty: 5,
    title: 'Оскар Уайльд',
    text: 'Мы все живем под гнетом обстоятельств, но мы все же не рабы обстоятельств.',
  },
  {
    id: 'quote-5',
    category: 'quotes',
    difficulty: 6,
    title: 'Фридрих Ницше',
    text: 'То, что не убивает меня, делает меня сильнее.',
    source: 'Сумерки идолов'
  },
  
  // === ПОСЛОВИЦЫ ===
  {
    id: 'prov-1',
    category: 'proverbs',
    difficulty: 1,
    title: 'Русская пословица',
    text: 'Тише едешь — дальше будешь.',
  },
  {
    id: 'prov-2',
    category: 'proverbs',
    difficulty: 2,
    title: 'Русская пословица',
    text: 'Семь раз отмерь — один раз отрежь.',
  },
  {
    id: 'prov-3',
    category: 'proverbs',
    difficulty: 3,
    title: 'Русская пословица',
    text: 'Без труда не вытащишь и рыбку из пруда.',
  },
  {
    id: 'prov-4',
    category: 'proverbs',
    difficulty: 4,
    title: 'Русская пословица',
    text: 'Кто рано встаёт, тому Бог подаёт.',
  },
  {
    id: 'prov-5',
    category: 'proverbs',
    difficulty: 5,
    title: 'Японская пословица',
    text: 'Падение — это не поражение. Поражение — это отказ подняться.',
  },
  
  // === НАУКА ===
  {
    id: 'sci-1',
    category: 'science',
    difficulty: 4,
    title: 'Физика — Законы Ньютона',
    text: 'Первый закон Ньютона: тело сохраняет состояние покоя или равномерного прямолинейного движения, пока внешние силы не изменят это состояние.',
  },
  {
    id: 'sci-2',
    category: 'science',
    difficulty: 5,
    title: 'Химия — Периодическая таблица',
    text: 'Периодический закон гласит: свойства химических элементов находятся в периодической зависимости от заряда их атомных ядер.',
  },
  {
    id: 'sci-3',
    category: 'science',
    difficulty: 6,
    title: 'Биология — ДНК',
    text: 'Дезоксирибонуклеиновая кислота хранит генетическую информацию в виде последовательности нуклеотидов.',
  },
  {
    id: 'sci-4',
    category: 'science',
    difficulty: 7,
    title: 'Астрономия — Чёрные дыры',
    text: 'Чёрная дыра — область пространства-времени с гравитационным притяжением настолько сильным, что покинуть её не могут даже объекты, движущиеся со скоростью света.',
  },
  
  // === ТЕХНОЛОГИИ ===
  {
    id: 'tech-1',
    category: 'technology',
    difficulty: 3,
    title: 'Интернет',
    text: 'Всемирная паутина — система связанных между собой документов, доступных через Интернет.',
  },
  {
    id: 'tech-2',
    category: 'technology',
    difficulty: 4,
    title: 'Искусственный интеллект',
    text: 'Машинное обучение — область искусственного интеллекта, изучающая методы построения алгоритмов, способных обучаться.',
  },
  {
    id: 'tech-3',
    category: 'technology',
    difficulty: 5,
    title: 'Блокчейн',
    text: 'Блокчейн — распределённая база данных, в которой цепочка записей хранится на множестве компьютеров одновременно.',
  },
  {
    id: 'tech-4',
    category: 'technology',
    difficulty: 6,
    title: 'Квантовые вычисления',
    text: 'Квантовый компьютер использует квантовые биты — кубиты, которые могут находиться в суперпозиции состояний.',
  },
  {
    id: 'tech-5',
    category: 'technology',
    difficulty: 8,
    title: 'Нейронные сети',
    text: 'Глубокое обучение — класс методов машинного обучения, основанный на использовании многослойных искусственных нейронных сетей.',
  },

  // === ФИЛЬМЫ И СЕРИАЛЫ ===
  {
    id: 'movie-1',
    category: 'movies',
    difficulty: 2,
    title: 'Крёстный отец',
    text: 'Я сделаю ему предложение, от которого он не сможет отказаться.',
    source: 'Крёстный отец, 1972'
  },
  {
    id: 'movie-2',
    category: 'movies',
    difficulty: 3,
    title: 'Звёздные войны',
    text: 'Да пребудет с тобой Сила.',
    source: 'Звёздные войны, 1977'
  },
  {
    id: 'movie-3',
    category: 'movies',
    difficulty: 4,
    title: 'Бойцовский клуб',
    text: 'Первое правило бойцовского клуба: никому не говорить о бойцовском клубе.',
    source: 'Бойцовский клуб, 1999'
  },
  {
    id: 'movie-4',
    category: 'movies',
    difficulty: 5,
    title: 'Матрица',
    text: 'Добро пожаловать в реальный мир. Ты принимаешь синюю таблетку — и сказке конец.',
    source: 'Матрица, 1999'
  },
  {
    id: 'movie-5',
    category: 'movies',
    difficulty: 6,
    title: 'Интерстеллар',
    text: 'Мы привыкли думать, что время неизменно. Но время может растягиваться и сжиматься.',
    source: 'Интерстеллар, 2014'
  },
  {
    id: 'movie-6',
    category: 'movies',
    difficulty: 7,
    title: 'Начало',
    text: 'Семя идеи — это самый живучий паразит. Однажды идея укоренилась в мозге, её практически невозможно удалить.',
    source: 'Начало, 2010'
  },

  // === НОВОСТИ ===
  {
    id: 'news-1',
    category: 'news',
    difficulty: 3,
    title: 'Технологии',
    text: 'Крупнейшие технологические компании представили новые смартфоны с улучшенными камерами и искусственным интеллектом.',
  },
  {
    id: 'news-2',
    category: 'news',
    difficulty: 4,
    title: 'Экономика',
    text: 'Центральный банк принял решение сохранить ключевую ставку на прежнем уровне для стабилизации инфляции.',
  },
  {
    id: 'news-3',
    category: 'news',
    difficulty: 5,
    title: 'Наука',
    text: 'Учёные обнаружили новую экзопланету в зоне обитаемости, где可能存在 жидкая вода и условия для жизни.',
  },
  {
    id: 'news-4',
    category: 'news',
    difficulty: 6,
    title: 'Космос',
    text: 'Космическое агентство успешно запустило новую миссию по исследованию Марса. Аппарат доставит образцы грунта на Землю.',
  },
  {
    id: 'news-5',
    category: 'news',
    difficulty: 7,
    title: 'Климат',
    text: 'Международный саммит по климату принял решение об ускорении перехода на возобновляемые источники энергии к 2030 году.',
  },

  // === ФИЛОСОФИЯ ===
  {
    id: 'phil-1',
    category: 'philosophy',
    difficulty: 4,
    title: 'Сократ',
    text: 'Я знаю, что ничего не знаю.',
    source: 'Апология Сократа'
  },
  {
    id: 'phil-2',
    category: 'philosophy',
    difficulty: 5,
    title: 'Рене Декарт',
    text: 'Я мыслю, следовательно, существую.',
    source: 'Размышления о первой философии'
  },
  {
    id: 'phil-3',
    category: 'philosophy',
    difficulty: 6,
    title: 'Иммануил Кант',
    text: 'Имей мужество пользоваться собственным умом — вот девиз просвещения.',
    source: 'Ответ на вопрос: Что такое просвещение?'
  },
  {
    id: 'phil-4',
    category: 'philosophy',
    difficulty: 7,
    title: 'Аристотель',
    text: 'Счастье — это смысл и цель жизни, конечная цель человеческого существования.',
    source: 'Никомахова этика'
  },
  {
    id: 'phil-5',
    category: 'philosophy',
    difficulty: 8,
    title: 'Фридрих Ницше',
    text: 'Бог умер! Но его тень ещё долго будет лежать в пещерах. Мы, люди, должны стать богами, чтобы сделать это достойным.',
    source: 'Весёлая наука'
  },

  // === БИЗНЕС ===
  {
    id: 'biz-1',
    category: 'business',
    difficulty: 3,
    title: 'Предпринимательство',
    text: 'Успешный бизнес начинается с решения проблемы клиента.',
  },
  {
    id: 'biz-2',
    category: 'business',
    difficulty: 4,
    title: 'Инвестиции',
    text: 'Диверсификация — единственный бесплатный обед в финансах.',
    source: 'Уоррен Баффетт'
  },
  {
    id: 'biz-3',
    category: 'business',
    difficulty: 5,
    title: 'Маркетинг',
    text: 'Контент — король, но дистрибуция — королева.',
  },
  {
    id: 'biz-4',
    category: 'business',
    difficulty: 6,
    title: 'Лидерство',
    text: 'Лидерство — это не о том, чтобы быть лучшим. Это о том, чтобы делать других лучше.',
  },
  {
    id: 'biz-5',
    category: 'business',
    difficulty: 7,
    title: 'Стратегия',
    text: 'Стратегия без тактики — это самый медленный путь к победе. Тактика без стратегии — это просто суета перед поражением.',
    source: 'Сунь-цзы'
  },
]

export function getTextsByCategory(category: TextCategory): PracticeText[] {
  return practiceTexts.filter(t => t.category === category)
}

export function getTextsByDifficulty(difficulty: number): PracticeText[] {
  return practiceTexts.filter(t => t.difficulty === difficulty)
}

export function getRandomText(category?: TextCategory, difficulty?: number): PracticeText | null {
  let filtered = practiceTexts
  if (category) filtered = filtered.filter(t => t.category === category)
  if (difficulty) filtered = filtered.filter(t => t.difficulty === difficulty)
  if (filtered.length === 0) return null
  return filtered[Math.floor(Math.random() * filtered.length)] || null
}

export function getAllCategories(): TextCategory[] {
  return ['literature', 'code', 'quotes', 'proverbs', 'science', 'technology', 'movies', 'news', 'philosophy', 'business']
}

export function getDifficultyLevels(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9]
}
