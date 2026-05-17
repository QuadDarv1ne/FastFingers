// Типы для аутентификации
export type UserRole = 'user' | 'admin'

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  role: UserRole;
  stats: UserStats;
}

export interface UserStats {
  totalXp: number;
  level: number;
  bestWpm: number;
  bestAccuracy: number;
  totalWordsTyped: number;
  totalPracticeTime: number;
  currentStreak: number;
  longestStreak: number;
  completedChallenges: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  agreeToTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export { AuthError } from '../services/authErrors';
export type { AuthErrorCode, AuthErrorData } from '../services/authErrors';
