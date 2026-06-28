import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { UserProgress, TypingStats, KeyHeatmapData, UserSettings, SoundTheme, Theme, KeyboardSkin, KeyboardLayout, FontSize } from '../types';
import { calculateLevel, xpForLevel, updateKeyHeatmap } from '../utils/stats';
import { getTodayDate } from '../utils/format';
import { useAppStore } from '../stores/useAppStore';
import { useProgressStore, calculateStreak } from '../stores/useProgressStore';
import { useShallow } from 'zustand/react/shallow';

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
  handleSessionComplete: (stats: TypingStats, totalXp: number) => void;
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

  // Initialize from persisted state on mount
  useEffect(() => {
    const stored = useProgressStore.getState();
    if (stored.totalXp > 0 || stored.streak > 0 || stored.sessions.length > 0) {
      setProgress(prev => ({
        ...prev,
        xp: stored.totalXp,
        level: stored.level,
        xpToNextLevel: xpForLevel(stored.level + 1),
        streak: stored.streak,
        lastPracticeDate: stored.lastPracticeDate,
      }));
    }
  }, []);

  const [currentStats, setCurrentStats] = useState<TypingStats | null>(null);
  const [heatmap, setHeatmap] = useState<KeyHeatmapData>({});
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Track previous level to detect level-ups without side effects in setState
  const prevLevelRef = useRef(options?.initialLevel ?? 1);
  const onLevelUpRef = useRef(options?.onLevelUp);
  onLevelUpRef.current = options?.onLevelUp;

  // Persisted settings from Zustand store - use useShallow to stabilize object reference
  const settings = useAppStore(useShallow(s => ({
    layout: s.layout,
    soundEnabled: s.soundEnabled,
    soundVolume: s.soundVolume,
    soundTheme: s.soundTheme,
    theme: s.theme,
    keyboardSkin: s.keyboardSkin,
    showKeyboard: s.showKeyboard,
    showStats: s.showStats,
    fontSize: s.fontSize,
    vibrationEnabled: s.vibrationEnabled,
  })));

  // Detect level-up and call callback as a side effect
  useEffect(() => {
    if (progress.level > prevLevelRef.current) {
      onLevelUpRef.current?.(progress.level);
    }
    prevLevelRef.current = progress.level;
  }, [progress.level]);

  const handleSessionComplete = useCallback((stats: TypingStats, totalXp: number) => {
    setCurrentStats(stats);

    setProgress(prev => {
      const newXp = prev.xp + totalXp;
      const newLevel = calculateLevel(newXp);
      const today = getTodayDate();
      const action = calculateStreak(prev.lastPracticeDate, today);
      let newStreak: number;
      switch (action) {
        case 'first':
        case 'reset':
          newStreak = 1;
          break;
        case 'increment':
          newStreak = prev.streak + 1;
          break;
        case 'unchanged':
          newStreak = prev.streak;
          break;
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
        streak: newStreak,
        lastPracticeDate: today,
      };
    });
  }, []);

  const updateHeatmap = useCallback((key: string, isCorrect: boolean) => {
    setHeatmap(prev => updateKeyHeatmap(prev, key, isCorrect))
  }, [])

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    switch (key) {
      case 'fontSize': useAppStore.getState().setFontSize(value as FontSize); break;
      case 'layout': useAppStore.getState().setLayout(value as KeyboardLayout); break;
      case 'soundEnabled': useAppStore.getState().setSoundEnabled(value as boolean); break;
      case 'soundVolume': useAppStore.getState().setSoundVolume(value as number); break;
      case 'soundTheme': useAppStore.getState().setSoundTheme(value as SoundTheme); break;
      case 'theme': useAppStore.getState().setTheme(value as Theme); break;
      case 'keyboardSkin': useAppStore.getState().setKeyboardSkin(value as KeyboardSkin); break;
      case 'showKeyboard': useAppStore.getState().setShowKeyboard(value as boolean); break;
      case 'showStats': useAppStore.getState().setShowStats(value as boolean); break;
      case 'vibrationEnabled': useAppStore.getState().setVibrationEnabled(value as boolean); break;
    }
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
