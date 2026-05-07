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
  | 'scipop'
  | 'history'
  | 'art'
  | 'sports'
  | 'travel'

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
  {
    id: 'code-7',
    category: 'code',
    difficulty: 5,
    title: 'Python — Hello World',
    text: 'print("Hello, World!")',
  },
  {
    id: 'code-8',
    category: 'code',
    difficulty: 6,
    title: 'Python — Функция',
    text: 'def greet(name: str) -> str: return f"Hello, {name}!"',
  },
  {
    id: 'code-9',
    category: 'code',
    difficulty: 7,
    title: 'Python — Класс',
    text: 'class User: def __init__(self, name, email): self.name = name self.email = email',
  },
  {
    id: 'code-10',
    category: 'code',
    difficulty: 6,
    title: 'Java — Hello World',
    text: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }',
  },
  {
    id: 'code-11',
    category: 'code',
    difficulty: 7,
    title: 'Java — Метод',
    text: 'public static int sum(int a, int b) { return a + b; }',
  },
  {
    id: 'code-12',
    category: 'code',
    difficulty: 8,
    title: 'Rust — Hello World',
    text: 'fn main() { println!("Hello, World!"); }',
  },
  {
    id: 'code-13',
    category: 'code',
    difficulty: 9,
    title: 'Rust — Функция с Result',
    text: 'fn divide(a: i32, b: i32) -> Result<i32, String> { if b == 0 { Err("Division by zero".to_string()) } else { Ok(a / b) } }',
  },
  {
    id: 'code-14',
    category: 'code',
    difficulty: 7,
    title: 'Go — Hello World',
    text: 'package main import "fmt" func main() { fmt.Println("Hello, World!") }',
  },
  {
    id: 'code-15',
    category: 'code',
    difficulty: 8,
    title: 'SQL — SELECT запрос',
    text: 'SELECT u.id, u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;',
  },
  {
    id: 'code-16',
    category: 'code',
    difficulty: 9,
    title: 'SQL — CREATE TABLE',
    text: 'CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT NOW());',
  },
  {
    id: 'code-17',
    category: 'code',
    difficulty: 8,
    title: 'CSS — Flexbox',
    text: '.container { display: flex; justify-content: center; align-items: center; gap: 1rem; }',
  },
  {
    id: 'code-18',
    category: 'code',
    difficulty: 9,
    title: 'CSS — Grid Layout',
    text: '.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }',
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
  {
    id: 'movie-7',
    category: 'movies',
    difficulty: 5,
    title: 'Побег из Шоушенка',
    text: 'Надежда — хорошая вещь, может быть, самая лучшая из вещей. А хорошее не умирает.',
    source: 'Побег из Шоушенка, 1994'
  },
  {
    id: 'movie-8',
    category: 'movies',
    difficulty: 6,
    title: 'Звёздные войны',
    text: 'Да пребудет с тобой Сила. Это джедайская вещь. Она окружает нас, проникает в нас, связывает галактику.',
    source: 'Звёздные войны, 1977'
  },
  {
    id: 'movie-9',
    category: 'movies',
    difficulty: 4,
    title: 'Терминатор',
    text: 'Я вернусь. Эти слова стали одним из самых известных киноцитат всех времён.',
    source: 'Терминатор, 1984'
  },
  {
    id: 'movie-10',
    category: 'movies',
    difficulty: 7,
    title: 'Криминальное чтиво',
    text: 'Путь праведного человека со всех сторон окружают несправедливость и эгоизм.',
    source: 'Криминальное чтиво, 1994'
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

  // === НАУЧПОП ===
  {
    id: 'scipop-1',
    category: 'scipop',
    difficulty: 4,
    title: 'Космос',
    text: 'Вселенная расширяется, и чем дальше галактика, тем быстрее она удаляется от нас.',
  },
  {
    id: 'scipop-2',
    category: 'scipop',
    difficulty: 5,
    title: 'Эволюция',
    text: 'Естественный отбор — основной механизм эволюции, предложенный Чарльзом Дарвином.',
  },
  {
    id: 'scipop-3',
    category: 'scipop',
    difficulty: 6,
    title: 'Генетика',
    text: 'Геном человека содержит около 20 тысяч генов, которые определяют наши наследственные признаки.',
  },
  {
    id: 'scipop-4',
    category: 'scipop',
    difficulty: 7,
    title: 'Нейробиология',
    text: 'Мозг человека состоит из примерно 86 миллиардов нейронов, каждый из которых может образовывать тысячи связей.',
  },
  {
    id: 'scipop-5',
    category: 'scipop',
    difficulty: 8,
    title: 'Квантовая физика',
    text: 'Принцип неопределённости Гейзенберга гласит: невозможно одновременно точно измерить положение и импульс частицы.',
  },
  {
    id: 'scipop-6',
    category: 'scipop',
    difficulty: 5,
    title: 'Климат',
    text: 'Парниковый эффект — естественное явление, но деятельность человека усиливает его, вызывая глобальное потепление.',
  },
  {
    id: 'scipop-7',
    category: 'scipop',
    difficulty: 6,
    title: 'Океанология',
    text: 'Тихий океан — самый большой на Земле, его площадь превышает площадь всей суши планеты.',
  },
  {
    id: 'scipop-8',
    category: 'scipop',
    difficulty: 7,
    title: 'Палеонтология',
    text: 'Динозавры вымерли около 65 миллионов лет назад, вероятно, из-за падения астероида и вулканической активности.',
  },
  {
    id: 'scipop-9',
    category: 'scipop',
    difficulty: 8,
    title: 'Астрофизика',
    text: 'Чёрные дыры образуются при гравитационном коллапсе массивных звёзд в конце их жизненного цикла.',
  },
  {
    id: 'scipop-10',
    category: 'scipop',
    difficulty: 9,
    title: 'Теория струн',
    text: 'Теория струн предполагает, что фундаментальные частицы — это не точки, а одномерные колеблющиеся струны.',
  },

  // === ИСТОРИЯ ===
  {
    id: 'hist-1',
    category: 'history',
    difficulty: 3,
    title: 'Древний Египет',
    text: 'Пирамиды Гизы были построены более 4500 лет назад как гробницы для фараонов.',
  },
  {
    id: 'hist-2',
    category: 'history',
    difficulty: 4,
    title: 'Римская империя',
    text: 'Римская империя достигла максимального размера во втором веке нашей эры при императоре Траяне.',
  },
  {
    id: 'hist-3',
    category: 'history',
    difficulty: 5,
    title: 'Средневековье',
    text: 'Феодализм — общественно-политический строй, основанный на земельной собственности и личной зависимости.',
  },
  {
    id: 'hist-4',
    category: 'history',
    difficulty: 6,
    title: 'Эпоха Возрождения',
    text: 'Леонардо да Винчи был не только художником, но и учёным, инженером, изобретателем и философом.',
  },
  {
    id: 'hist-5',
    category: 'history',
    difficulty: 7,
    title: 'Промышленная революция',
    text: 'Изобретение парового двигателя Джеймсом Уаттом в 1769 году положило начало промышленной революции.',
  },
  {
    id: 'hist-6',
    category: 'history',
    difficulty: 5,
    title: 'Великие географические открытия',
    text: 'Христофор Колумб открыл Америку в 1492 году, хотя до конца жизни считал, что достиг Индии.',
  },
  {
    id: 'hist-7',
    category: 'history',
    difficulty: 6,
    title: 'Первая мировая война',
    text: 'Первая мировая война длилась с 1914 по 1918 год и унесла жизни более 17 миллионов человек.',
  },
  {
    id: 'hist-8',
    category: 'history',
    difficulty: 7,
    title: 'Холодная война',
    text: 'Холодная война — период геополитического противостояния между США и СССР с 1946 по 1991 год.',
  },
  {
    id: 'hist-9',
    category: 'history',
    difficulty: 8,
    title: 'Византийская империя',
    text: 'Византия пала в 1453 году, когда османы под предводительством Мехмеда II захватили Константинополь.',
  },
  {
    id: 'hist-10',
    category: 'history',
    difficulty: 9,
    title: 'Месопотамия',
    text: 'Шумеры создали первую известную систему письма — клинопись — около 3500 года до нашей эры.',
  },

  // === ИСКУССТВО ===
  {
    id: 'art-1',
    category: 'art',
    difficulty: 3,
    title: 'Живопись',
    text: 'Мона Лиза Леонардо да Винчи — самая известная картина в мире, выставленная в Лувре.',
  },
  {
    id: 'art-2',
    category: 'art',
    difficulty: 4,
    title: 'Импрессионизм',
    text: 'Клод Моне написал серию картин «Кувшинки», вдохновлённую садом в своём доме в Живерни.',
  },
  {
    id: 'art-3',
    category: 'art',
    difficulty: 5,
    title: 'Сюрреализм',
    text: 'Сальвадор Дали изображал сновидения и подсознание в своих сюрреалистических полотнах.',
  },
  {
    id: 'art-4',
    category: 'art',
    difficulty: 6,
    title: 'Архитектура',
    text: 'Антонио Гауди создал уникальный архитектурный стиль, сочетающий готику и модерн в Барселоне.',
  },
  {
    id: 'art-5',
    category: 'art',
    difficulty: 7,
    title: 'Скульптура',
    text: 'Микеланджело Буонарроти создал статую Давида из мрамора высотой более пяти метров.',
  },
  {
    id: 'art-6',
    category: 'art',
    difficulty: 5,
    title: 'Музыка',
    text: 'Иоганн Себастьян Бах написал более тысячи произведений, включая «Бранденбургские концерты».',
  },
  {
    id: 'art-7',
    category: 'art',
    difficulty: 6,
    title: 'Литература',
    text: 'Уильям Шекспир написал 37 пьес и 154 сонета, став величайшим драматургом всех времён.',
  },
  {
    id: 'art-8',
    category: 'art',
    difficulty: 7,
    title: 'Кинематограф',
    text: 'Альфред Хичкок, мастер саспенса, снял более 50 фильмов за свою карьеру.',
  },
  {
    id: 'art-9',
    category: 'art',
    difficulty: 8,
    title: 'Фотография',
    text: 'Анри Картье-Брессон разработал концепцию «решающего момента» в документальной фотографии.',
  },
  {
    id: 'art-10',
    category: 'art',
    difficulty: 9,
    title: 'Современное искусство',
    text: 'Энди Уорхол стал пионером поп-арта, используя образы массовой культуры в своих работах.',
  },

  // === СПОРТ ===
  {
    id: 'sport-1',
    category: 'sports',
    difficulty: 2,
    title: 'Футбол',
    text: 'Лионель Месси выиграл рекордное количество Золотых мячей — награды лучшему футболисту года.',
  },
  {
    id: 'sport-2',
    category: 'sports',
    difficulty: 3,
    title: 'Баскетбол',
    text: 'Майкл Джордан шесть раз приводил «Чикаго Буллз» к чемпионству в НБА.',
  },
  {
    id: 'sport-3',
    category: 'sports',
    difficulty: 4,
    title: 'Теннис',
    text: 'Роджер Федерер выиграл 20 турниров Большого шлема в одиночном разряде.',
  },
  {
    id: 'sport-4',
    category: 'sports',
    difficulty: 5,
    title: 'Олимпийские игры',
    text: 'Первые современные Олимпийские игры состоялись в Афинах в 1896 году.',
  },
  {
    id: 'sport-5',
    category: 'sports',
    difficulty: 6,
    title: 'Формула-1',
    text: 'Айртон Сенна трижды становился чемпионом Формулы-1 и считается одним из величайших пилотов.',
  },
  {
    id: 'sport-6',
    category: 'sports',
    difficulty: 4,
    title: 'Плавание',
    text: 'Майкл Фелпс выиграл 23 олимпийские золотые медали — рекорд в истории спорта.',
  },
  {
    id: 'sport-7',
    category: 'sports',
    difficulty: 5,
    title: 'Лёгкая атлетика',
    text: 'Усэйн Болт установил мировой рекорд в беге на 100 метров — 9,58 секунды.',
  },
  {
    id: 'sport-8',
    category: 'sports',
    difficulty: 6,
    title: 'Хоккей',
    text: 'Уэйн Гретцки забил 894 гола в НХЛ — рекорд, который держится уже более 30 лет.',
  },
  {
    id: 'sport-9',
    category: 'sports',
    difficulty: 7,
    title: 'Бокс',
    text: 'Мухаммед Али трижды становился чемпионом мира в супертяжёлом весе.',
  },
  {
    id: 'sport-10',
    category: 'sports',
    difficulty: 8,
    title: 'Гольф',
    text: 'Тайгер Вудс выиграл 15 турниров серии мэйджор и провёл более 68 недель на первом месте рейтинга.',
  },

  // === ПУТЕШЕСТВИЯ ===
  {
    id: 'travel-1',
    category: 'travel',
    difficulty: 3,
    title: 'Париж',
    text: 'Эйфелева башня была построена в 1889 году и стала символом Франции.',
  },
  {
    id: 'travel-2',
    category: 'travel',
    difficulty: 4,
    title: 'Токио',
    text: 'Токио — самый населённый мегаполис мира, где проживает более 37 миллионов человек.',
  },
  {
    id: 'travel-3',
    category: 'travel',
    difficulty: 5,
    title: 'Нью-Йорк',
    text: 'Статуя Свободы была подарена Франции США в 1886 году как символ дружбы.',
  },
  {
    id: 'travel-4',
    category: 'travel',
    difficulty: 6,
    title: 'Рим',
    text: 'Колизей — крупнейший амфитеатр древнего мира, вмещавший до 50 тысяч зрителей.',
  },
  {
    id: 'travel-5',
    category: 'travel',
    difficulty: 7,
    title: 'Пекин',
    text: 'Великая Китайская стена протянулась более чем на 21 тысячу километров.',
  },
  {
    id: 'travel-6',
    category: 'travel',
    difficulty: 5,
    title: 'Лондон',
    text: 'Биг-Бен — знаменитая часовая башня Вестминстерского дворца в Лондоне.',
  },
  {
    id: 'travel-7',
    category: 'travel',
    difficulty: 6,
    title: 'Дубай',
    text: 'Бурдж-Халифа — самое высокое здание в мире высотой 828 метров.',
  },
  {
    id: 'travel-8',
    category: 'travel',
    difficulty: 7,
    title: 'Мачу-Пикчу',
    text: 'Мачу-Пикчу — древний город инков, расположенный на высоте 2430 метров над уровнем моря.',
  },
  {
    id: 'travel-9',
    category: 'travel',
    difficulty: 8,
    title: 'Антарктида',
    text: 'Антарктида — самый холодный континент, где температура опускалась до минус 89 градусов.',
  },
  {
    id: 'travel-10',
    category: 'travel',
    difficulty: 9,
    title: 'Исландия',
    text: 'Исландия расположена на стыке тектонических плит и имеет более 200 вулканов.',
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
  return ['literature', 'code', 'quotes', 'proverbs', 'science', 'technology', 'movies', 'news', 'philosophy', 'business', 'scipop', 'history', 'art', 'sports', 'travel']
}

export function getDifficultyLevels(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9]
}
