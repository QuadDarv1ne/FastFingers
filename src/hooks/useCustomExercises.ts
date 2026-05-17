import { useState, useCallback, useEffect } from 'react';
import { Exercise } from '../types';
import type { PracticeText } from '../data/practiceTexts';

const ADMIN_TEXTS_KEY = 'fastfingers_admin_texts';

function loadAdminTexts(): PracticeText[] {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_TEXTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function adminToExercises(texts: PracticeText[]): Exercise[] {
  return texts.map(t => ({
    id: t.id,
    title: t.title,
    description: t.text.slice(0, 120),
    text: t.text,
    difficulty: t.difficulty,
    category: t.category,
    focusKeys: [],
  }));
}

export function useCustomExercises() {
  const [customExercises, setCustomExercises] = useState<Exercise[]>(() =>
    adminToExercises(loadAdminTexts())
  );

  useEffect(() => {
    const handleStorage = () => {
      setCustomExercises(prev => {
        const texts = loadAdminTexts()
        const admin = adminToExercises(texts)
        const adminIds = new Set(texts.map(t => t.id))
        const user = prev.filter(e => !adminIds.has(e.id))
        return [...admin, ...user]
      })
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const addExercise = useCallback((exercise: Exercise) => {
    setCustomExercises(prev => [...prev, exercise]);
  }, []);

  const removeExercise = useCallback((id: string) => {
    setCustomExercises(prev => prev.filter(ex => ex.id !== id));
  }, []);

  const updateExercise = useCallback((id: string, updates: Partial<Exercise>) => {
    setCustomExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, ...updates } : ex
    ));
  }, []);

  const clearExercises = useCallback(() => {
    setCustomExercises(adminToExercises(loadAdminTexts()));
  }, []);

  return {
    customExercises,
    addExercise,
    removeExercise,
    updateExercise,
    clearExercises,
  };
}
