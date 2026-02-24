import { User, LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordResetConfirm, AuthError } from '../types/auth';

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
      // Fallback to simple hash
    }
  }
  
  // Fallback для старых браузеров
  const encoder = new TextEncoder();
  const data = encoder.encode(password + PASSWORD_SALT);
  const hash = Array.from(new Uint8Array(data)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hash;
};

const sanitizeEmail = (email: string): string => email.trim().toLowerCase();
const sanitizeName = (name: string): string => name.trim().replace(/\s+/g, ' ');

const getUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error('[Auth] Ошибка чтения пользователей:', e);
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('[Auth] Ошибка сохранения пользователей:', e);
  }
};

const getCurrentUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
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
    // Игнорируем ошибки
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
    // Игнорируем ошибки
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
      throw { code: 'invalid-email', message: 'Неверный формат email' } as AuthError;
    }

    if (!isValidPassword(credentials.password)) {
      throw { code: 'weak-password', message: `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов` } as AuthError;
    }

    if (credentials.password !== credentials.confirmPassword) {
      throw { code: 'weak-password', message: 'Пароли не совпадают' } as AuthError;
    }

    if (!credentials.agreeToTerms) {
      throw { code: 'unknown', message: 'Необходимо принять условия использования' } as AuthError;
    }

    const users = getUsers();

    if (users.find(u => u.email === sanitizedEmail)) {
      throw { code: 'email-in-use', message: 'Этот email уже зарегистрирован' } as AuthError;
    }

    const hashedPassword = await hashPassword(credentials.password);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: generateId(),
      email: sanitizedEmail,
      name: sanitizedName,
      password: hashedPassword,
      createdAt: now,
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
      throw { code: 'invalid-email', message: 'Неверный формат email' } as AuthError;
    }

    const lockoutTime = checkLockout(sanitizedEmail);
    if (lockoutTime) {
      const minutes = Math.ceil(lockoutTime / 60000);
      throw { 
        code: 'locked-out', 
        message: `Слишком много попыток входа. Попробуйте через ${minutes} мин.` 
      } as AuthError;
    }

    const users = getUsers();
    const user = users.find(u => u.email === sanitizedEmail);

    if (!user) {
      saveLoginAttempt(sanitizedEmail);
      throw { code: 'user-not-found', message: 'Пользователь с таким email не найден' } as AuthError;
    }

    const hashedPassword = await hashPassword(credentials.password);
    if (user.password !== hashedPassword) {
      saveLoginAttempt(sanitizedEmail);
      throw { code: 'wrong-password', message: 'Неверный пароль' } as AuthError;
    }

    clearLoginAttempts(sanitizedEmail);
    user.lastLogin = new Date().toISOString();
    saveUsers(users);

    const userWithoutPassword = withoutPassword(user);
    saveCurrentUser(userWithoutPassword, credentials.rememberMe ?? false);

    return userWithoutPassword;
  },

  // Выход
  logout(): void {
    removeCurrentUser();
  },

  // Проверка текущего пользователя
  getCurrentUser(): User | null {
    return getCurrentUserFromStorage();
  },

  // Запрос на сброс пароля
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    await delay(REGISTRATION_DELAY_MS);

    if (!isValidEmail(request.email)) {
      throw { code: 'invalid-email', message: 'Неверный формат email' } as AuthError;
    }

    const users = getUsers();
    const user = users.find(u => u.email === request.email);

    if (!user) {
      return;
    }

    const token = generateId();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();

    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
    tokens.push({ email: request.email, token, expiresAt });
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));

    alert(`Токен для сброса пароля: ${token}\n(В реальном приложении он был бы отправлен на email)`);
  },

  // Подтверждение сброса пароля
  async confirmPasswordReset(confirm: PasswordResetConfirm): Promise<void> {
    await delay(REGISTRATION_DELAY_MS);

    if (!isValidPassword(confirm.newPassword)) {
      throw { code: 'weak-password', message: `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов` } as AuthError;
    }

    if (confirm.newPassword !== confirm.confirmPassword) {
      throw { code: 'weak-password', message: 'Пароли не совпадают' } as AuthError;
    }

    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
    const tokenIndex = tokens.findIndex((t: { token: string; expiresAt: string }) =>
      t.token === confirm.token && new Date(t.expiresAt) > new Date()
    );

    if (tokenIndex === -1) {
      throw { code: 'invalid-token', message: 'Неверный или истёкший токен' } as AuthError;
    }

    const tokenData = tokens[tokenIndex];
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === tokenData.email);

    if (userIndex === -1) {
      throw { code: 'user-not-found', message: 'Пользователь не найден' } as AuthError;
    }

    users[userIndex].password = await hashPassword(confirm.newPassword);
    saveUsers(users);

    tokens.splice(tokenIndex, 1);
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  },

  // Обновление профиля
  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    await delay(PROFILE_UPDATE_DELAY_MS);

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw { code: 'user-not-found', message: 'Пользователь не найден' } as AuthError;
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);

    const userWithoutPassword = withoutPassword(users[userIndex]);
    saveCurrentUser(userWithoutPassword, true);

    return userWithoutPassword;
  },

  // Синхронизация статистики пользователя
  async syncUserStats(userId: string, stats: Partial<User['stats']>): Promise<User> {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw { code: 'user-not-found', message: 'Пользователь не найден' } as AuthError;
    }

    users[userIndex].stats = { ...users[userIndex].stats, ...stats };
    saveUsers(users);

    const userWithoutPassword = withoutPassword(users[userIndex]);
    saveCurrentUser(userWithoutPassword, true);

    return userWithoutPassword;
  },
};
