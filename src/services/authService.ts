import { User, LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordResetConfirm, AuthError } from '../types/auth';

const USERS_STORAGE_KEY = 'fastfingers_users';
const CURRENT_USER_KEY = 'fastfingers_current_user';
const RESET_TOKENS_KEY = 'fastfingers_reset_tokens';
const PASSWORD_SALT = 'fastfingers-salt-2026';
const REGISTRATION_DELAY_MS = 500;
const PROFILE_UPDATE_DELAY_MS = 300;
const RESET_TOKEN_EXPIRY_MS = 3600000;
const MIN_PASSWORD_LENGTH = 8;

type StoredUser = User & { password: string };

// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Генерация уникального ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Хэширование пароля (упрощённое, для демонстрации)
const hashPassword = (password: string): string => btoa(password + PASSWORD_SALT);

// Получение пользователей из хранилища
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

// Сохранение пользователей в хранилище
const saveUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log('[Auth] Пользователи сохранены, всего:', users.length);
  } catch (e) {
    console.error('[Auth] Ошибка сохранения пользователей:', e);
  }
};

// Получение текущего пользователя из хранилища
const getCurrentUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Сохранение текущего пользователя
const saveCurrentUser = (user: User, remember: boolean) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Удаление текущего пользователя из хранилища
const removeCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
};

// Валидация email
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Валидация пароля
const isValidPassword = (password: string): boolean => password.length >= MIN_PASSWORD_LENGTH;

// Извлечение данных пользователя без пароля
const withoutPassword = ({ password: _pwd, ...user }: StoredUser): User => user;

export const authService = {
  // Регистрация
  async register(credentials: RegisterCredentials): Promise<User> {
    await delay(REGISTRATION_DELAY_MS);

    console.log('[Auth] Регистрация:', { email: credentials.email, name: credentials.name });

    if (!isValidEmail(credentials.email)) {
      console.error('[Auth] Неверный email');
      throw { code: 'invalid-email', message: 'Неверный формат email' } as AuthError;
    }

    if (!isValidPassword(credentials.password)) {
      console.error('[Auth] Слабый пароль');
      throw { code: 'weak-password', message: `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов` } as AuthError;
    }

    if (credentials.password !== credentials.confirmPassword) {
      console.error('[Auth] Пароли не совпадают');
      throw { code: 'weak-password', message: 'Пароли не совпадают' } as AuthError;
    }

    if (!credentials.agreeToTerms) {
      console.error('[Auth] Не принято соглашение');
      throw { code: 'unknown', message: 'Необходимо принять условия использования' } as AuthError;
    }

    const users = getUsers();
    console.log('[Auth] Текущие пользователи:', users.length);

    if (users.find(u => u.email === credentials.email)) {
      console.error('[Auth] Email уже занят');
      throw { code: 'email-in-use', message: 'Этот email уже зарегистрирован' } as AuthError;
    }

    const hashedPassword = hashPassword(credentials.password);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: generateId(),
      email: credentials.email,
      name: credentials.name,
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

  // Вход
  async login(credentials: LoginCredentials): Promise<User> {
    await delay(REGISTRATION_DELAY_MS);

    if (!isValidEmail(credentials.email)) {
      throw { code: 'invalid-email', message: 'Неверный формат email' } as AuthError;
    }

    const users = getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw { code: 'user-not-found', message: 'Пользователь с таким email не найден' } as AuthError;
    }

    const hashedPassword = hashPassword(credentials.password);
    if (user.password !== hashedPassword) {
      throw { code: 'wrong-password', message: 'Неверный пароль' } as AuthError;
    }

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

    console.log('Reset token:', token);
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

    users[userIndex].password = hashPassword(confirm.newPassword);
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
