import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordResetConfirm } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (confirm: PasswordResetConfirm) => Promise<void>;
  updateUserStats: (stats: Partial<User['stats']>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Проверка текущего пользователя при загрузке
  useEffect(() => {
    const user = authService.getCurrentUser();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.login(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as { message: string }).message,
      }));
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.register(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as { message: string }).message,
      }));
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const resetPassword = async (request: PasswordResetRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.requestPasswordReset(request);
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as { message: string }).message,
      }));
      throw error;
    }
  };

  const confirmPasswordReset = async (confirm: PasswordResetConfirm) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.confirmPasswordReset(confirm);
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as { message: string }).message,
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

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      resetPassword,
      confirmPasswordReset,
      updateUserStats,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
