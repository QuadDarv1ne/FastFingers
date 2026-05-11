import { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import { UserProgress, TypingStats, KeyHeatmapData, UserSettings } from '../types';
import { calculateLevel, xpForLevel, calculateSessionXp, updateKeyHeatmap } from '../utils/stats';
import { calculateStreakXpBonus } from '../utils/streakBonus';

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
  setProgress: Dispatch<SetStateAction<UserProgress>>;
  handleSessionComplete: (stats: TypingStats, streak?: number) => void;
  updateHeatmap: (key: string, isCorrect: boolean) => void;
  setShowHeatmap: (show: boolean) => void;
  resetHeatmap: () => void;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
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

  const [settings, setSettings] = useState<UserSettings>({
    layout: 'jcuken',
    soundEnabled: true,
    soundVolume: 0.5,
    soundTheme: 'default',
    fontSize: 'medium',
    theme: 'dark',
    keyboardSkin: 'classic',
    showKeyboard: true,
    showStats: true,
  });

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
      };
    });
  }, [options]);

  const updateHeatmap = useCallback((key: string, isCorrect: boolean) => {
    setHeatmap(prev => updateKeyHeatmap(prev, key, isCorrect))
  }, [])

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetHeatmap = useCallback(() => {
    setHeatmap({});
    setShowHeatmap(false);
  }, []);

  return useMemo(() => ({
    progress,
    currentStats,
    heatmap,
    showHeatmap,
    settings,
    setProgress,
    handleSessionComplete,
    updateHeatmap,
    setShowHeatmap,
    resetHeatmap,
    updateSetting,
  }), [progress, currentStats, heatmap, showHeatmap, settings, setProgress, handleSessionComplete, updateHeatmap, resetHeatmap, updateSetting]);
}
