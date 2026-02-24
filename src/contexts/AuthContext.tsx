import { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordResetConfirm, AuthError } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (confirm: PasswordResetConfirm) => Promise<void>;
  updateUserStats: (stats: Partial<User['stats']>) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  isActionPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAuthError = (error: unknown): { code?: string; message: string } => {
  if (error && typeof error === 'object' && 'message' in error) {
    const authError = error as Partial<AuthError>;
    return {
      code: authError.code,
      message: authError.message || 'Unknown error',
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

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const user = authService.getCurrentUser();
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  }, []);

  const withActionState = async <T,>(action: Promise<T>): Promise<T> => {
    setIsActionPending(true);
    await new Promise(resolve => setTimeout(resolve, ACTION_DELAY));
    try {
      const result = await action;
      return result;
    } finally {
      setIsActionPending(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
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
  };

  const register = async (credentials: RegisterCredentials) => {
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
  };

  const logout = useCallback(() => {
    authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const resetPassword = async (request: PasswordResetRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await withActionState(authService.requestPasswordReset(request));
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
  };

  const confirmPasswordReset = async (confirm: PasswordResetConfirm) => {
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
  };

  const updateUserStats = async (stats: Partial<User['stats']>) => {
    if (!state.user) return;
    try {
      const updatedUser = await authService.syncUserStats(state.user.id, stats);
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Failed to sync user stats:', error);
    }
  };

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
  }), [state, logout, updateUserStats, clearError, refreshUser, isActionPending]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext };
