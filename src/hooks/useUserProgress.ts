import { useState, useCallback, useMemo } from 'react';
import { UserProgress, TypingStats, KeyHeatmapData, UserSettings, FontSize } from '../types';
import { calculateLevel, xpForLevel, calculateSessionXp, updateKeyHeatmap } from '../utils/stats';
import { calculateStreakXpBonus } from '../utils/streakBonus';
import { useAppStore } from '../stores/useAppStore';

interface UseUserProgressOptions {
  initialLevel?: number;
  initialXp?: number;
  onLevelUp?: (newLevel: number) => void;
}

interface UseUserProgressReturn {
  progress: UserProgress;
  currentStats: TypingStats | null;
  heatmap: KeyHeatmapData;
  showHeatmap: boolean;
  settings: UserSettings;
  handleSessionComplete: (stats: TypingStats, streak?: number) => void;
  updateHeatmap: (key: string, isCorrect: boolean) => void;
  setShowHeatmap: (show: boolean) => void;
  resetHeatmap: () => void;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  importProgress: (data: UserProgress) => void;
}

export function useUserProgress(options?: UseUserProgressOptions): UseUserProgressReturn {
  const [progress, setProgress] = useState<UserProgress>({
    level: options?.initialLevel ?? 1,
    xp: options?.initialXp ?? 0,
    xpToNextLevel: xpForLevel((options?.initialLevel ?? 1) + 1),
    totalWordsTyped: 0,
    totalPracticeTime: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    streak: 0,
    lastPracticeDate: null,
  });

  const [currentStats, setCurrentStats] = useState<TypingStats | null>(null);
  const [heatmap, setHeatmap] = useState<KeyHeatmapData>({});
  const [showHeatmap, setShowHeatmap] = useState(false);

  const [fontSize, setFontSize] = useState<FontSize>('medium');

  // Persisted settings from Zustand store
  const layout = useAppStore(s => s.layout);
  const soundEnabled = useAppStore(s => s.soundEnabled);
  const soundVolume = useAppStore(s => s.soundVolume);
  const soundTheme = useAppStore(s => s.soundTheme);
  const theme = useAppStore(s => s.theme);
  const keyboardSkin = useAppStore(s => s.keyboardSkin);
  const showKeyboard = useAppStore(s => s.showKeyboard);
  const showStats = useAppStore(s => s.showStats);

  const settings = useMemo<UserSettings>(() => ({
    layout,
    soundEnabled,
    soundVolume,
    soundTheme,
    fontSize,
    theme,
    keyboardSkin,
    showKeyboard,
    showStats,
  }), [layout, soundEnabled, soundVolume, soundTheme, fontSize, theme, keyboardSkin, showKeyboard, showStats]);

  const handleSessionComplete = useCallback((stats: TypingStats, streak = 0) => {
    setCurrentStats(stats);

    const xp = calculateSessionXp(stats);
    const streakBonus = calculateStreakXpBonus(streak);
    const totalXp = xp + streakBonus;

    setProgress(prev => {
      const newXp = prev.xp + totalXp;
      const newLevel = calculateLevel(newXp);
      const prevLevel = calculateLevel(prev.xp);

      if (newLevel > prevLevel) {
        options?.onLevelUp?.(newLevel);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: xpForLevel(newLevel + 1),
        totalWordsTyped: prev.totalWordsTyped + Math.floor(stats.correctChars / 5),
        bestWpm: Math.max(prev.bestWpm, stats.wpm),
        bestAccuracy: Math.max(prev.bestAccuracy, stats.accuracy),
        totalPracticeTime: prev.totalPracticeTime + Math.round(stats.timeElapsed),
      };
    });
  }, [options]);

  const updateHeatmap = useCallback((key: string, isCorrect: boolean) => {
    setHeatmap(prev => updateKeyHeatmap(prev, key, isCorrect))
  }, [])

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (key === 'fontSize') {
      setFontSize(value as FontSize);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setters: Record<string, (...args: any[]) => void> = {
      layout: useAppStore.getState().setLayout,
      soundEnabled: useAppStore.getState().setSoundEnabled,
      soundVolume: useAppStore.getState().setSoundVolume,
      soundTheme: useAppStore.getState().setSoundTheme,
      theme: useAppStore.getState().setTheme,
      keyboardSkin: useAppStore.getState().setKeyboardSkin,
      showKeyboard: useAppStore.getState().setShowKeyboard,
      showStats: useAppStore.getState().setShowStats,
    };
    setters[key]?.(value);
  }, []);

  const resetHeatmap = useCallback(() => {
    setHeatmap({});
    setShowHeatmap(false);
  }, []);

  const importProgress = useCallback((data: UserProgress) => {
    setProgress(data);
  }, []);

  return useMemo(() => ({
    progress,
    currentStats,
    heatmap,
    showHeatmap,
    settings,
    handleSessionComplete,
    updateHeatmap,
    setShowHeatmap,
    resetHeatmap,
    updateSetting,
    importProgress,
  }), [progress, currentStats, heatmap, showHeatmap, settings, handleSessionComplete, updateHeatmap, resetHeatmap, updateSetting, importProgress]);
}
