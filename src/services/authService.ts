import { User, LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordResetConfirm } from '../types/auth';
import { AuthError } from './authErrors';
import { supabase } from './supabase';
import { logger } from '../utils/logger';

const USERS_STORAGE_KEY = 'fastfingers_users';
const CURRENT_USER_KEY = 'fastfingers_current_user';
const RESET_TOKENS_KEY = 'fastfingers_reset_tokens';
const PASSWORD_SALT = 'fastfingers-salt-2026';
const REGISTRATION_DELAY_MS = 500;
const PROFILE_UPDATE_DELAY_MS = 300;
const RESET_TOKEN_EXPIRY_MS = 3600000;
const MIN_PASSWORD_LENGTH = 8;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 300000;
const LOGIN_ATTEMPTS_KEY = 'fastfingers_login_attempts';

type StoredUser = User & { password: string };

interface LoginAttempt {
  email: string;
  timestamp: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const hashPassword = async (password: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + PASSWORD_SALT);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      logger.warn('SHA-256 failed, using fallback hash');
      // Fallback to simple hash
    }
  }
  
  // Fallback для старых браузеров — используем djb2 хеш
  let hash = 5381
  const str = password + PASSWORD_SALT
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash >>> 0
  }
  return hash.toString(16)
};

const sanitizeEmail = (email: string): string => email.trim().toLowerCase();
const sanitizeName = (name: string): string => name.trim().replace(/\s+/g, ' ');

const getUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    logger.warn('Failed to parse stored users');
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    logger.warn('Failed to save users');
    // Ignore save errors
  }
};

const getCurrentUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    logger.warn('Failed to parse current user');
    return null;
  }
};

const saveCurrentUser = (user: User, remember: boolean) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const removeCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
};

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string): boolean => password.length >= MIN_PASSWORD_LENGTH;

const withoutPassword = ({ password: _pwd, ...user }: StoredUser): User => user;

const getLoginAttempts = (): LoginAttempt[] => {
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    logger.warn('Failed to parse login attempts');
    return [];
  }
};

const saveLoginAttempt = (email: string) => {
  const attempts = getLoginAttempts();
  attempts.push({ email, timestamp: Date.now() });
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
};

const clearLoginAttempts = (email: string) => {
  const attempts = getLoginAttempts().filter(a => a.email !== email);
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
};

const checkLockout = (email: string): number | null => {
  const attempts = getLoginAttempts().filter(a => a.email === email);
  const recentAttempts = attempts.filter(a => Date.now() - a.timestamp < LOCKOUT_TIME_MS);

  if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    const oldestRecent = Math.min(...recentAttempts.map(a => a.timestamp));
    const remainingTime = LOCKOUT_TIME_MS - (Date.now() - oldestRecent);
    return remainingTime > 0 ? remainingTime : null;
  }
  return null;
};

const cleanupExpiredTokens = () => {
  try {
    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
    const now = Date.now();
    const validTokens = tokens.filter((t: { expiresAt: string }) => new Date(t.expiresAt).getTime() > now);
    if (tokens.length !== validTokens.length) {
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(validTokens));
    }
  } catch {
    logger.warn('Failed to cleanup expired tokens');
    // Ignore errors
  }
};

const cleanupOldAttempts = () => {
  try {
    const attempts = getLoginAttempts();
    const now = Date.now();
    const recentAttempts = attempts.filter(a => now - a.timestamp < LOCKOUT_TIME_MS * 2);
    if (attempts.length !== recentAttempts.length) {
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(recentAttempts));
    }
  } catch {
    logger.warn('Failed to cleanup old login attempts');
    // Ignore errors
  }
};

cleanupExpiredTokens();
cleanupOldAttempts();

export const authService = {
  async register(credentials: RegisterCredentials): Promise<User> {
    await delay(REGISTRATION_DELAY_MS);

    const sanitizedEmail = sanitizeEmail(credentials.email);
    const sanitizedName = sanitizeName(credentials.name);

    if (!isValidEmail(sanitizedEmail)) {
      throw new AuthError('invalid-email', 'Неверный формат email');
    }

    if (!isValidPassword(credentials.password)) {
      throw new AuthError('weak-password', `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов`);
    }

    if (credentials.password !== credentials.confirmPassword) {
      throw new AuthError('password-mismatch', 'Пароли не совпадают');
    }

    if (!credentials.agreeToTerms) {
      throw new AuthError('terms-not-accepted', 'Необходимо принять условия использования');
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: credentials.password,
        options: { data: { name: sanitizedName } },
      });

      if (error) {
        throw new AuthError('unknown', error.message);
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: sanitizedEmail,
          name: sanitizedName,
          createdAt: new Date().toISOString(),
          role: 'user',
          stats: {
            totalXp: 0,
            level: 1,
            bestWpm: 0,
            bestAccuracy: 0,
            totalWordsTyped: 0,
            totalPracticeTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            completedChallenges: 0,
          },
        };
        saveCurrentUser(user, true);
        return user;
      }
    }

    const users = getUsers();

    if (users.find(u => u.email === sanitizedEmail)) {
      throw new AuthError('email-in-use', 'Этот email уже зарегистрирован');
    }

    const hashedPassword = await hashPassword(credentials.password);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: generateId(),
      email: sanitizedEmail,
      name: sanitizedName,
      password: hashedPassword,
      createdAt: now,
      role: users.length === 0 ? 'admin' : 'user',
      stats: {
        totalXp: 0,
        level: 1,
        bestWpm: 0,
        bestAccuracy: 0,
        totalWordsTyped: 0,
        totalPracticeTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        completedChallenges: 0,
      },
    };

    users.push(newUser);
    saveUsers(users);

    const userWithoutPassword = withoutPassword(newUser);
    saveCurrentUser(userWithoutPassword, true);

    return userWithoutPassword;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    await delay(REGISTRATION_DELAY_MS);

    const sanitizedEmail = sanitizeEmail(credentials.email);

    if (!isValidEmail(sanitizedEmail)) {
      throw new AuthError('invalid-email', 'Неверный формат email');
    }

    // Check lockout before any auth attempt (applies to both Supabase and localStorage)
    const lockoutTime = checkLockout(sanitizedEmail);
    if (lockoutTime) {
      const minutes = Math.ceil(lockoutTime / 60000);
      throw new AuthError('locked-out', `Слишком много попыток входа. Попробуйте через ${minutes} мин.`);
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: credentials.password,
      });

      if (error) {
        // Track failed attempt for lockout
        saveLoginAttempt(sanitizedEmail);
        if (error.status === 401) {
          throw new AuthError('wrong-password', 'Неверный пароль');
        }
        if (error.status === 404) {
          throw new AuthError('user-not-found', 'Пользователь не найден');
        }
        throw new AuthError('unknown', error.message);
      }

      if (data.user) {
        clearLoginAttempts(sanitizedEmail);
        const user: User = {
          id: data.user.id,
          email: sanitizedEmail,
          name: data.user.user_metadata?.name || sanitizedEmail,
          createdAt: data.user.created_at,
          lastLogin: new Date().toISOString(),
          role: data.user.user_metadata?.role || 'user',
          stats: data.user.user_metadata?.stats || {
            totalXp: 0,
            level: 1,
            bestWpm: 0,
            bestAccuracy: 0,
            totalWordsTyped: 0,
            totalPracticeTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            completedChallenges: 0,
          },
        };
        saveCurrentUser(user, credentials.rememberMe ?? true);
        return user;
      }
    }

    const users = getUsers();
    const user = users.find(u => u.email === sanitizedEmail);

    if (!user) {
      saveLoginAttempt(sanitizedEmail);
      throw new AuthError('user-not-found', 'Пользователь с таким email не найден');
    }

    const hashedPassword = await hashPassword(credentials.password);
    if (user.password !== hashedPassword) {
      saveLoginAttempt(sanitizedEmail);
      throw new AuthError('wrong-password', 'Неверный пароль');
    }

    clearLoginAttempts(sanitizedEmail);
    user.lastLogin = new Date().toISOString();
    saveUsers(users);

    const userWithoutPassword = withoutPassword(user);
    saveCurrentUser(userWithoutPassword, credentials.rememberMe ?? false);

    return userWithoutPassword;
  },

  async logout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
    removeCurrentUser();
  },

  getCurrentUser(): User | null {
    return getCurrentUserFromStorage();
  },

  async requestPasswordReset(request: PasswordResetRequest): Promise<{ token: string; expiresAt: string }> {
    await delay(REGISTRATION_DELAY_MS);

    if (!isValidEmail(request.email)) {
      throw new AuthError('invalid-email', 'Неверный формат email');
    }

    const users = getUsers();
    const user = users.find(u => u.email === request.email);

    if (!user) {
      throw new AuthError('user-not-found', 'Пользователь с таким email не найден');
    }

    const token = generateId();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();

    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
    tokens.push({ email: request.email, token, expiresAt });
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));

    return { token, expiresAt };
  },

  async confirmPasswordReset(confirm: PasswordResetConfirm): Promise<void> {
    await delay(REGISTRATION_DELAY_MS);

    if (!isValidPassword(confirm.newPassword)) {
      throw new AuthError('weak-password', `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов`);
    }

    if (confirm.newPassword !== confirm.confirmPassword) {
      throw new AuthError('password-mismatch', 'Пароли не совпадают');
    }

    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
    const tokenIndex = tokens.findIndex((t: { token: string; expiresAt: string }) =>
      t.token === confirm.token && new Date(t.expiresAt) > new Date()
    );

    if (tokenIndex === -1) {
      throw new AuthError('invalid-token', 'Неверный или истёкший токен');
    }

    const tokenData = tokens[tokenIndex];
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === tokenData.email);

    if (userIndex === -1) {
      throw new AuthError('user-not-found', 'Пользователь не найден');
    }

    const user = users[userIndex];
    if (!user) {
      throw new AuthError('user-not-found', 'Пользователь не найден');
    }
    user.password = await hashPassword(confirm.newPassword);
    saveUsers(users);

    tokens.splice(tokenIndex, 1);
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  },

  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    await delay(PROFILE_UPDATE_DELAY_MS);

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new AuthError('user-not-found', 'Пользователь не найден');
    }

    const user = users[userIndex];
    if (!user) {
      throw new AuthError('user-not-found', 'Пользователь не найден');
    }

    users[userIndex] = { ...user, ...updates };
    saveUsers(users);

    const updatedUser = users[userIndex];
    if (!updatedUser) {
      throw new AuthError('user-not-found', 'Пользователь не найден');
    }
    const userWithoutPassword = withoutPassword(updatedUser);
    saveCurrentUser(userWithoutPassword, true);

    return userWithoutPassword;
  },

  async syncUserStats(userId: string, stats: Partial<User['stats']>): Promise<User> {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new AuthError('user-not-found', 'Пользователь не найден');
    }

    const user = users[userIndex];
    if (!user) {
      throw new AuthError('user-not-found', 'Пользователь не найден');
    }

    users[userIndex] = { ...user, stats: { ...user.stats, ...stats } };
    saveUsers(users);

    const updatedUser = users[userIndex];
    if (!updatedUser) {
      throw new AuthError('user-not-found', 'Пользователь не найден');
    }
    const userWithoutPassword = withoutPassword(updatedUser);
    saveCurrentUser(userWithoutPassword, true);

    return userWithoutPassword;
  },
};
