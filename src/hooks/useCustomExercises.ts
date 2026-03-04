import { useState, useCallback } from 'react';
import { Exercise } from '../types';

export function useCustomExercises() {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

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
    setCustomExercises([]);
  }, []);

  return {
    customExercises,
    addExercise,
    removeExercise,
    updateExercise,
    clearExercises,
  };
}
