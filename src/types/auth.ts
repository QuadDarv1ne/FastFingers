// Типы для аутентификации
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
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

export type AuthErrorCode =
  | 'invalid-email'
  | 'weak-password'
  | 'email-in-use'
  | 'user-not-found'
  | 'wrong-password'
  | 'invalid-token'
  | 'token-expired'
  | 'network-error'
  | 'locked-out'
  | 'unknown';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}
