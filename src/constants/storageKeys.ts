/**
 * Единый источник всех ключей localStorage
 */
export const STORAGE_KEYS = {
  USERS: 'fastfingers_users',
  CURRENT_USER: 'fastfingers_current_user',
  HISTORY: 'fastfingers_history',
  NOTIFICATIONS: 'fastfingers_notifications',
  ADMIN_TEXTS: 'fastfingers_admin_texts',
  PENDING_SESSIONS: 'fastfingers_pending_sessions',
  CLOUD_SYNC: 'fastfingers_cloud_sync',
  BACKEND_STATUS: 'fastfingers_backend_status',
  RESET_TOKENS: 'fastfingers_reset_tokens',
  LOGIN_ATTEMPTS: 'fastfingers_login_attempts',
  TEXT_USAGE: 'fastfingers_textUsage',
  ADAPTIVE_DIFFICULTY: 'fastfingers_adaptive_difficulty',
  AUTOSAVE: 'fastfingers-autosave',
  CHALLENGES: 'fastfingers_challenges',
  STREAK: 'fastfingers_streak',
  COMPLETIONS: 'fastfingers_challenge_completions',
  NOTIF_SOUND: 'fastfingers_notif_sound',
  NOTIF_LEVELUP: 'fastfingers_notif_levelup',
  NOTIF_ACHIEVEMENT: 'fastfingers_notif_achievement',
} as const
