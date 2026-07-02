import type { User, LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordResetConfirm } from '../types/auth';
import { AuthError, isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from './authErrors';
import { supabase } from './supabase';
import { logger } from '../utils/logger';
import { getFromStorageAsArray, setToStorageWithQuotaHandling } from '../utils/storage';
import { generateId, generateShortId } from '../utils/id';
import { STORAGE_KEYS } from '../constants/storageKeys';

const USERS_STORAGE_KEY = STORAGE_KEYS.USERS;
const CURRENT_USER_KEY = STORAGE_KEYS.CURRENT_USER;
const RESET_TOKENS_KEY = STORAGE_KEYS.RESET_TOKENS;
const REGISTRATION_DELAY_MS = 500;
const LOGIN_DELAY_MS = 300;
const PASSWORD_RESET_DELAY_MS = 400;
const PROFILE_UPDATE_DELAY_MS = 300;
const RESET_TOKEN_EXPIRY_MS = 3600000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 300000;
const LOGIN_ATTEMPTS_KEY = STORAGE_KEYS.LOGIN_ATTEMPTS;

const generateSalt = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
  return generateId();
};

const DEFAULT_USER_STATS = {
  totalXp: 0,
  level: 1,
  bestWpm: 0,
  bestAccuracy: 0,
  totalWordsTyped: 0,
  totalPracticeTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  completedChallenges: 0,
};

type StoredUser = User & { password: string; salt: string };

const findUserOrThrow = (users: StoredUser[], predicate: (u: StoredUser) => boolean): StoredUser => {
  const user = users.find(predicate);
  if (!user) {
    throw new AuthError('user-not-found', 'User not found');
  }
  return user;
};

interface LoginAttempt {
  email: string;
  timestamp: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new AuthError('crypto-unavailable', 'Web Crypto API is required but not available')
  }
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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
  const result = setToStorageWithQuotaHandling(USERS_STORAGE_KEY, users);
  if (!result.success) {
    logger.warn('Failed to save users', result.quotaExceeded ? '(quota exceeded)' : '');
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
  try {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage errors
  }
};

const removeCurrentUser = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  } catch {
    // Ignore storage errors
  }
};

const withoutPassword = ({ password: _pwd, salt: _salt, ...user }: StoredUser): User => user;

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
  const result = setToStorageWithQuotaHandling(LOGIN_ATTEMPTS_KEY, attempts);
  if (!result.success) {
    logger.warn('Failed to save login attempt', result.quotaExceeded ? '(quota exceeded)' : '');
  }
};

const clearLoginAttempts = (email: string) => {
  const attempts = getLoginAttempts().filter(a => a.email !== email);
  const result = setToStorageWithQuotaHandling(LOGIN_ATTEMPTS_KEY, attempts);
  if (!result.success) {
    logger.warn('Failed to clear login attempts', result.quotaExceeded ? '(quota exceeded)' : '');
  }
};

const checkLockout = (email: string): number | null => {
  const attempts = getLoginAttempts().filter(a => a.email === email);
  const recentAttempts = attempts.filter(a => Date.now() - a.timestamp < LOCKOUT_TIME_MS);

  if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    const mostRecent = Math.max(...recentAttempts.map(a => a.timestamp));
    const remainingTime = LOCKOUT_TIME_MS - (Date.now() - mostRecent);
    return remainingTime > 0 ? remainingTime : null;
  }
  return null;
};

const cleanupExpiredTokens = () => {
  try {
    const tokens = getFromStorageAsArray<{ email: string; token: string; expiresAt: string }>(RESET_TOKENS_KEY);
    const now = Date.now();
    const validTokens = tokens.filter(t => new Date(t.expiresAt).getTime() > now);
    if (tokens.length !== validTokens.length) {
      const result = setToStorageWithQuotaHandling(RESET_TOKENS_KEY, validTokens);
      if (!result.success) {
        logger.warn('Failed to cleanup expired tokens', result.quotaExceeded ? '(quota exceeded)' : '');
      }
    }
  } catch {
    logger.warn('Failed to cleanup expired tokens');
  }
};

const cleanupOldAttempts = () => {
  try {
    const attempts = getLoginAttempts();
    const now = Date.now();
    const recentAttempts = attempts.filter(a => now - a.timestamp < LOCKOUT_TIME_MS * 2);
    if (attempts.length !== recentAttempts.length) {
      const result = setToStorageWithQuotaHandling(LOGIN_ATTEMPTS_KEY, recentAttempts);
      if (!result.success) {
        logger.warn('Failed to cleanup old login attempts', result.quotaExceeded ? '(quota exceeded)' : '');
      }
    }
  } catch {
    logger.warn('Failed to cleanup old login attempts');
  }
};

export const authService = {
  /** Run one-time startup cleanup (expired tokens, old login attempts). */
  init() {
    cleanupExpiredTokens();
    cleanupOldAttempts();
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    await delay(REGISTRATION_DELAY_MS);

    const sanitizedEmail = sanitizeEmail(credentials.email);
    const sanitizedName = sanitizeName(credentials.name);

    if (!isValidEmail(sanitizedEmail)) {
      throw new AuthError('invalid-email', 'Invalid email format');
    }

    if (!isValidPassword(credentials.password)) {
      throw new AuthError('weak-password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    if (credentials.password !== credentials.confirmPassword) {
      throw new AuthError('password-mismatch', 'Passwords do not match');
    }

    if (!credentials.agreeToTerms) {
      throw new AuthError('terms-not-accepted', 'You must accept the terms of use');
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
          stats: { ...DEFAULT_USER_STATS },
        };
        saveCurrentUser(user, true);
        return user;
      }
    }

    const users = getUsers();

    if (users.find(u => u.email === sanitizedEmail)) {
      throw new AuthError('email-in-use', 'This email is already registered');
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(credentials.password, salt);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: generateId(),
      email: sanitizedEmail,
      name: sanitizedName,
      password: hashedPassword,
      salt,
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
    await delay(LOGIN_DELAY_MS);

    const sanitizedEmail = sanitizeEmail(credentials.email);

    if (!isValidEmail(sanitizedEmail)) {
      throw new AuthError('invalid-email', 'Invalid email format');
    }

    const lockoutTime = checkLockout(sanitizedEmail);
    if (lockoutTime) {
      const minutes = Math.ceil(lockoutTime / 60000);
      throw new AuthError('locked-out', `Too many login attempts. Try again in ${minutes} min.`);
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: credentials.password,
      });

      if (error) {
        saveLoginAttempt(sanitizedEmail);
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid password')) {
          throw new AuthError('wrong-password', 'Invalid password');
        }
        if (msg.includes('email not confirmed')) {
          throw new AuthError('email-not-confirmed', 'Email not confirmed. Check your inbox.');
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
          stats: data.user.user_metadata?.stats || { ...DEFAULT_USER_STATS },
        };
        saveCurrentUser(user, credentials.rememberMe ?? true);
        return user;
      }
    }

    const users = getUsers();
    const user = users.find(u => u.email === sanitizedEmail);

    if (!user) {
      saveLoginAttempt(sanitizedEmail);
      throw new AuthError('user-not-found', 'User with this email not found');
    }

    const hashedPassword = await hashPassword(credentials.password, user.salt);
    if (user.password !== hashedPassword) {
      saveLoginAttempt(sanitizedEmail);
      throw new AuthError('wrong-password', 'Invalid password');
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
    await delay(PASSWORD_RESET_DELAY_MS);

    if (!isValidEmail(request.email)) {
      throw new AuthError('invalid-email', 'Invalid email format');
    }

    const users = getUsers();
    const user = users.find(u => u.email === request.email);

    if (!user) {
      throw new AuthError('user-not-found', 'User with this email not found');
    }

    const token = generateShortId(6).toUpperCase();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();

    const tokens = getFromStorageAsArray<{ email: string; token: string; expiresAt: string }>(RESET_TOKENS_KEY);
    tokens.push({ email: request.email, token, expiresAt });
    const result = setToStorageWithQuotaHandling(RESET_TOKENS_KEY, tokens);
    if (!result.success) {
      throw new AuthError('unknown', result.quotaExceeded ? 'Storage is full' : 'Save error');
    }

    return { token, expiresAt };
  },

  async confirmPasswordReset(confirm: PasswordResetConfirm): Promise<void> {
    await delay(PASSWORD_RESET_DELAY_MS);

    if (!isValidPassword(confirm.newPassword)) {
      throw new AuthError('weak-password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    if (confirm.newPassword !== confirm.confirmPassword) {
      throw new AuthError('password-mismatch', 'Passwords do not match');
    }

    const tokens = getFromStorageAsArray<{ token: string; expiresAt: string; email: string }>(RESET_TOKENS_KEY);
    const tokenIndex = tokens.findIndex(t =>
      t.token === confirm.token && new Date(t.expiresAt) > new Date()
    );

    if (tokenIndex === -1) {
      throw new AuthError('invalid-token', 'Invalid or expired token');
    }

    const tokenData = tokens[tokenIndex];
    if (!tokenData) {
      throw new AuthError('invalid-token', 'Invalid or expired token');
    }

    const users = getUsers();
    const user = users.find(u => u.email === tokenData.email);
    if (!user) {
      throw new AuthError('user-not-found', 'User not found');
    }
    const salt = user.salt || generateSalt();
    user.password = await hashPassword(confirm.newPassword, salt);
    user.salt = salt;
    saveUsers(users);

    tokens.splice(tokenIndex, 1);
    const result = setToStorageWithQuotaHandling(RESET_TOKENS_KEY, tokens);
    if (!result.success) {
      logger.warn('Failed to save tokens after password reset', result.quotaExceeded ? '(quota exceeded)' : '');
    }
  },

  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    await delay(PROFILE_UPDATE_DELAY_MS);

    const users = getUsers();
    const user = findUserOrThrow(users, u => u.id === userId);

    const userIndex = users.indexOf(user);
    users[userIndex] = { ...user, ...updates };
    saveUsers(users);

    const updatedUser = users[userIndex];
    if (!updatedUser) {
      throw new AuthError('user-not-found', 'User not found');
    }
    const userWithoutPassword = withoutPassword(updatedUser);
    saveCurrentUser(userWithoutPassword, true);

    return userWithoutPassword;
  },

  async syncUserStats(userId: string, stats: Partial<User['stats']>): Promise<User> {
    const users = getUsers();
    const user = findUserOrThrow(users, u => u.id === userId);

    const userIndex = users.indexOf(user);
    users[userIndex] = { ...user, stats: { ...user.stats, ...stats } };
    saveUsers(users);

    const updatedUser = users[userIndex];
    if (!updatedUser) {
      throw new AuthError('user-not-found', 'User not found');
    }
    const userWithoutPassword = withoutPassword(updatedUser);
    saveCurrentUser(userWithoutPassword, true);

    return userWithoutPassword;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const users = getUsers();
    const user = findUserOrThrow(users, u => u.id === userId);

    const hashedCurrent = await hashPassword(currentPassword, user.salt);
    if (user.password !== hashedCurrent) {
      throw new AuthError('wrong-password', 'Current password is incorrect');
    }

    const salt = generateSalt();
    const hashedNew = await hashPassword(newPassword, salt);

    const userIndex = users.indexOf(user);
    users[userIndex] = { ...user, password: hashedNew, salt };
    saveUsers(users);
  },
};
