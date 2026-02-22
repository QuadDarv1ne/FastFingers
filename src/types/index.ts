// Раскладки клавиатуры
export type KeyboardLayout = 'qwerty' | 'jcuken' | 'dvorak';

export interface KeyPosition {
  key: string;
  finger: string;
  row: number;
  column: number;
}

export interface KeyboardLayoutData {
  name: string;
  rows: string[][];
  keyToFinger: Record<string, string>;
}

// Статистика печати
export interface TypingStats {
  wpm: number;        // слов в минуту
  cpm: number;        // символов в минуту
  accuracy: number;   // точность в %
  errors: number;     // количество ошибок
  correctChars: number;
  totalChars: number;
  timeElapsed: number; // время в секундах
}

// Прогресс пользователя
export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalWordsTyped: number;
  totalPracticeTime: number; // в минутах
  bestWpm: number;
  bestAccuracy: number;
  streak: number; // дней подряд
  lastPracticeDate: string | null;
}

// Настройки пользователя
export interface UserSettings {
  layout: KeyboardLayout;
  soundEnabled: boolean;
  soundVolume: number;
  fontSize: 'small' | 'medium' | 'large';
  theme: 'dark' | 'light' | 'system';
  showKeyboard: boolean;
  showStats: boolean;
}

// Результат ввода символа
export interface KeyInputResult {
  isCorrect: boolean;
  char: string;
  expectedChar: string;
  timestamp: number;
}

// Тепловая карта ошибок
export interface KeyHeatmapData {
  [key: string]: {
    errors: number;
    total: number;
    accuracy: number;
  };
}

// Ежедневный челлендж
export interface ChallengeWithProgress {
  id: string;
  date: string;
  text: string;
  targetWpm: number;
  targetAccuracy: number;
  completed: boolean;
  xpReward: number;
  userWpm?: number;
  userAccuracy?: number;
}

// Данные стрика
export interface StreakData {
  current: number;
  longest: number;
  lastPracticeDate: string | null;
  practiceDates: string[];
}

// Упражнение
export interface Exercise {
  id: string;
  title: string;
  description: string;
  text: string;
  difficulty: number; // 1-10
  category: string;
  focusKeys: string[]; // клавиши для отработки
}

// Достижение
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  condition: (stats: UserProgress, session: TypingStats) => boolean;
}

// Событие для WebSocket (соревнования)
export interface RaceEvent {
  type: 'start' | 'progress' | 'finish';
  playerId: string;
  progress: number; // 0-100%
  wpm?: number;
  timestamp: number;
}
