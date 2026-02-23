import { User, LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordResetConfirm } from '../types/auth'
import { AuthError, isValidEmail, isValidPassword } from './authErrors'

const USERS_STORAGE_KEY = 'fastfingers_users'
const CURRENT_USER_KEY = 'fastfingers_current_user'
const RESET_TOKENS_KEY = 'fastfingers_reset_tokens'

// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Генерация уникального ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

// Хэширование пароля (упрощённое, для демонстрации)
const hashPassword = (password: string): string => {
  return btoa(password + 'fastfingers-salt-2026')
}

// Получение пользователей из хранилища
const getUsers = (): (User & { password: string })[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (e) {
    console.error('[Auth] Ошибка чтения пользователей:', e)
    throw new AuthError('unknown', 'Ошибка при чтении данных пользователей')
  }
}

// Сохранение пользователей в хранилище
const saveUsers = (users: (User & { password: string })[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    console.log('[Auth] Пользователи сохранены, всего:', users.length)
  } catch (e) {
    console.error('[Auth] Ошибка сохранения пользователей:', e)
    throw new AuthError('unknown', 'Ошибка при сохранении данных пользователей')
  }
}

export const authService = {
  /**
   * Регистрация нового пользователя
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    await delay(500)

    console.log('[Auth] Регистрация:', { email: credentials.email, name: credentials.name })

    // Валидация email
    if (!isValidEmail(credentials.email)) {
      throw new AuthError('invalid-email', 'Неверный формат email', 'email')
    }

    // Валидация пароля
    if (!isValidPassword(credentials.password)) {
      throw new AuthError('weak-password', 'Пароль должен содержать минимум 8 символов', 'password')
    }

    // Проверка совпадения паролей
    if (credentials.password !== credentials.confirmPassword) {
      throw new AuthError('password-mismatch', 'Пароли не совпадают', 'confirmPassword')
    }

    // Проверка принятия соглашения
    if (!credentials.agreeToTerms) {
      throw new AuthError('terms-not-accepted', 'Необходимо принять условия использования')
    }

    const users = getUsers()

    // Проверка существования email
    if (users.find(u => u.email === credentials.email)) {
      throw new AuthError('email-in-use', 'Этот email уже зарегистрирован', 'email')
    }

    // Создание пользователя
    const hashedPassword = hashPassword(credentials.password)
    const now = new Date().toISOString()

    const newUser: User & { password: string } = {
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
    }

    users.push(newUser)
    saveUsers(users)

    // Сохранение текущего пользователя
    const { password: _, ...userWithoutPassword } = newUser
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  },

  /**
   * Вход пользователя
   */
  async login(credentials: LoginCredentials): Promise<User> {
    await delay(500)

    // Валидация email
    if (!isValidEmail(credentials.email)) {
      throw new AuthError('invalid-email', 'Неверный формат email', 'email')
    }

    const users = getUsers()
    const user = users.find(u => u.email === credentials.email)

    // Проверка существования пользователя
    if (!user) {
      throw new AuthError('user-not-found', 'Пользователь с таким email не найден', 'email')
    }

    // Проверка пароля
    const hashedPassword = hashPassword(credentials.password)
    if (user.password !== hashedPassword) {
      throw new AuthError('wrong-password', 'Неверный пароль', 'password')
    }

    // Обновление последнего входа
    user.lastLogin = new Date().toISOString()
    saveUsers(users)

    // Сохранение текущего пользователя
    const { password: _pwd, ...userWithoutPassword } = user

    if (credentials.rememberMe) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))
    }

    return userWithoutPassword
  },

  /**
   * Выход из системы
   */
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY)
    sessionStorage.removeItem(CURRENT_USER_KEY)
  },

  /**
   * Проверка текущего пользователя
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  /**
   * Запрос на сброс пароля
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    await delay(500)

    if (!isValidEmail(request.email)) {
      throw new AuthError('invalid-email', 'Неверный формат email', 'email')
    }

    const users = getUsers()
    const user = users.find(u => u.email === request.email)

    if (!user) {
      // Не раскрываем, существует ли пользователь (безопасность)
      return
    }

    // Генерация токена
    const token = generateId()
    const expiresAt = new Date(Date.now() + 3600000).toISOString() // 1 час

    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]')
    tokens.push({ email: request.email, token, expiresAt })
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))

    // В реальном приложении здесь была бы отправка email
    console.log('Reset token:', token)
    alert(`Токен для сброса пароля: ${token}\n(В реальном приложении он был бы отправлен на email)`)
  },

  /**
   * Подтверждение сброса пароля
   */
  async confirmPasswordReset(confirm: PasswordResetConfirm): Promise<void> {
    await delay(500)

    // Валидация нового пароля
    if (!isValidPassword(confirm.newPassword)) {
      throw new AuthError('weak-password', 'Пароль должен содержать минимум 8 символов', 'newPassword')
    }

    // Проверка совпадения паролей
    if (confirm.newPassword !== confirm.confirmPassword) {
      throw new AuthError('password-mismatch', 'Пароли не совпадают', 'confirmPassword')
    }

    // Проверка токена
    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]')
    const tokenIndex = tokens.findIndex((t: { token: string; expiresAt: string }) =>
      t.token === confirm.token && new Date(t.expiresAt) > new Date()
    )

    if (tokenIndex === -1) {
      throw new AuthError('invalid-token', 'Неверный или истёкший токен')
    }

    const tokenData = tokens[tokenIndex]
    const users = getUsers()
    const userIndex = users.findIndex(u => u.email === tokenData.email)

    if (userIndex === -1) {
      throw new AuthError('user-not-found', 'Пользователь не найден')
    }

    // Обновление пароля
    users[userIndex].password = hashPassword(confirm.newPassword)
    saveUsers(users)

    // Удаление использованного токена
    tokens.splice(tokenIndex, 1)
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))
  },

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    await delay(300)

    const users = getUsers()
    const userIndex = users.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      throw new AuthError('user-not-found', 'Пользователь не найден')
    }

    users[userIndex] = { ...users[userIndex], ...updates }
    saveUsers(users)

    const { password: _pwd2, ...userWithoutPassword } = users[userIndex]
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  },

  /**
   * Синхронизация статистики пользователя
   */
  async syncUserStats(userId: string, stats: Partial<User['stats']>): Promise<User> {
    const users = getUsers()
    const userIndex = users.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      throw new AuthError('user-not-found', 'Пользователь не найден')
    }

    users[userIndex].stats = { ...users[userIndex].stats, ...stats }
    saveUsers(users)

    const { password: _pwd3, ...userWithoutPassword } = users[userIndex]
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  },

  /**
   * Проверка токена сброса пароля
   */
  verifyResetToken(token: string): boolean {
    try {
      const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]')
      return tokens.some((t: { token: string; expiresAt: string }) =>
        t.token === token && new Date(t.expiresAt) > new Date()
      )
    } catch {
      return false
    }
  },

  /**
   * Очистка токенов сброса пароля
   */
  clearResetTokens(): void {
    localStorage.removeItem(RESET_TOKENS_KEY)
  },
}
