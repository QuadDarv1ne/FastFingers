/** Раскладки клавиатуры */
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

/** Данные о нажатии клавиши для расширенной статистики */
export interface KeystrokeData {
  key: string;
  timestamp: number;
  isCorrect: boolean;
  finger: string;
  hand: 'left' | 'right';
}

/** Расширенная статистика печати с новыми метриками */
export interface TypingStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  totalChars: number;
  timeElapsed: number;
  // Новые метрики
  rhythmScore?: number; // Отклонение интервала между нажатиями (0-100)
  fingerBalance?: { left: number; right: number }; // Сравнение скорости левой/правой руки
  errorRecoveryTime?: number; // Время исправления ошибки (мс)
  sessionEfficiency?: number; // (Правильные символы / время) × точность
}

/** Данные для расчёта Learning Velocity (прирост WPM за неделю) */
export interface WeeklyProgress {
  week: string;
  avgWpm: number;
  sessions: number;
}

/** Данные для анализа оттока (Funnel Analysis) */
export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

/** Данные для корреляционного анализа */
export interface TimeOfDayPerformance {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  avgWpm: number;
  avgAccuracy: number;
  sessions: number;
}

/** Прогресс пользователя */
export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalWordsTyped: number;
  totalPracticeTime: number;
  bestWpm: number;
  bestAccuracy: number;
  streak: number;
  lastPracticeDate: string | null;
}

/** Настройки пользователя */
export interface UserSettings {
  layout: KeyboardLayout;
  soundEnabled: boolean;
  soundVolume: number;
  soundTheme: SoundTheme;
  fontSize: FontSize;
  theme: Theme;
  keyboardSkin: KeyboardSkin;
  showKeyboard: boolean;
  showStats: boolean;
}

/** Результат ввода символа */
export interface KeyInputResult {
  isCorrect: boolean;
  char: string;
  expectedChar: string;
  timestamp: number;
}

/** Тепловая карта ошибок */
export type KeyHeatmapData = Record<string, { errors: number; total: number; accuracy: number }>;

/** Ежедневный челлендж */
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

/** Данные стрика */
export interface StreakData {
  current: number;
  longest: number;
  lastPracticeDate: string | null;
  practiceDates: string[];
}

/** Упражнение */
export interface Exercise {
  id: string;
  title: string;
  description: string;
  text: string;
  difficulty: number;
  category: string;
  focusKeys: string[];
  layout?: KeyboardLayout;
}

/** Достижение */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  condition: (stats: UserProgress, session: TypingStats) => boolean;
}

/** Событие для WebSocket (соревнования) */
export interface RaceEvent {
  type: 'start' | 'progress' | 'finish';
  playerId: string;
  progress: number;
  wpm?: number;
  timestamp: number;
}

/** Звуковые темы */
export type SoundTheme = 'default' | 'piano' | 'mechanical' | 'soft' | 'retro';

/** Скины клавиатуры */
export type KeyboardSkin = 'classic' | 'neon' | 'cyberpunk' | 'minimal' | 'ocean' | 'sunset' | 'matrix' | 'monokai';

/** Размеры шрифта */
export type FontSize = 'small' | 'medium' | 'large';

/** Темы оформления */
export type Theme = 'dark' | 'light' | 'system';

/** Finger zones for keyboard */
export type FingerZone = 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';
