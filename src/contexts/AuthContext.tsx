/**
 * AuthContext — Контекст аутентификации
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordResetConfirm } from '../types/auth';
import { AuthError } from '../services/authErrors';
import { authService } from '../services/authService';
import { supabase } from '../services/supabase';

interface AuthContextType extends AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<{ token: string; expiresAt: string }>;
  confirmPasswordReset: (confirm: PasswordResetConfirm) => Promise<void>;
  updateUserStats: (stats: Partial<User['stats']>) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  isActionPending: boolean;
  lastResetToken: { token: string; expiresAt: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAuthError = (error: unknown): { code?: string; message: string } => {
  if (AuthError.isAuthError(error)) {
    return {
      code: error.code,
      message: error.message,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'Unknown error',
  };
};

const ACTION_DELAY = 300;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const [isActionPending, setIsActionPending] = useState(false);
  const [lastResetToken, setLastResetToken] = useState<{ token: string; expiresAt: string } | null>(null);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    authService.init();
    const user = authService.getCurrentUser();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });

    // Subscribe to Supabase auth state changes (login/logout from other tabs, session expiry)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email || '',
              createdAt: session.user.created_at,
              role: session.user.user_metadata?.role || 'user',
              stats: session.user.user_metadata?.stats || {
                totalXp: 0, level: 1, bestWpm: 0, bestAccuracy: 0,
                totalWordsTyped: 0, totalPracticeTime: 0,
                currentStreak: 0, longestStreak: 0, completedChallenges: 0,
              },
            };
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } else {
          const updatedUser = authService.getCurrentUser();
          setState({
            user: updatedUser,
            isAuthenticated: !!updatedUser,
            isLoading: false,
            error: null,
          });
        }
      });
      return () => subscription.unsubscribe();
    }
    return undefined;
  }, []);

  const refreshUser = useCallback(async () => {
    const user = authService.getCurrentUser();
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  }, []);

  const withActionState = useCallback(async <T,>(action: Promise<T>): Promise<T> => {
    setIsActionPending(true);
    const startTime = Date.now();
    try {
      const result = await action;
      // Ensure minimum pending duration for UX
      const elapsed = Date.now() - startTime;
      if (elapsed < ACTION_DELAY) {
        await new Promise(resolve => setTimeout(resolve, ACTION_DELAY - elapsed));
      }
      return result;
    } catch (error) {
      // Ensure minimum pending duration even on error
      const elapsed = Date.now() - startTime;
      if (elapsed < ACTION_DELAY) {
        await new Promise(resolve => setTimeout(resolve, ACTION_DELAY - elapsed));
      }
      throw error;
    } finally {
      setIsActionPending(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await withActionState(authService.login(credentials));
      const user = authService.getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const authError = getAuthError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message,
      }));
      throw error;
    }
  }, [withActionState]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await withActionState(authService.register(credentials));
      const user = authService.getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const authError = getAuthError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message,
      }));
      throw error;
    }
  }, [withActionState]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.logout();
    } catch (error) {
      const authError = getAuthError(error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: authError.message,
      });
      throw error;
    }
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const resetPassword = useCallback(async (request: PasswordResetRequest): Promise<{ token: string; expiresAt: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await withActionState(authService.requestPasswordReset(request));
      setLastResetToken(result);
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      return result;
    } catch (error) {
      const authError = getAuthError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message,
      }));
      throw error;
    }
  }, [withActionState]);

  const confirmPasswordReset = useCallback(async (confirm: PasswordResetConfirm) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await withActionState(authService.confirmPasswordReset(confirm));
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      const authError = getAuthError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message,
      }));
      throw error;
    }
  }, [withActionState]);

  const updateUserStats = useCallback(async (stats: Partial<User['stats']>) => {
    if (!state.user) return;
    try {
      const updatedUser = await authService.syncUserStats(state.user.id, stats);
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      const authError = getAuthError(error);
      setState(prev => ({
        ...prev,
        error: authError.message,
      }));
    }
  }, [state.user]);

  const contextValue = useMemo<AuthContextType>(() => ({
    ...state,
    login,
    register,
    logout,
    resetPassword,
    confirmPasswordReset,
    updateUserStats,
    clearError,
    refreshUser,
    isActionPending,
    lastResetToken,
  }), [state, login, register, logout, resetPassword, confirmPasswordReset, updateUserStats, clearError, refreshUser, isActionPending, lastResetToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext };
