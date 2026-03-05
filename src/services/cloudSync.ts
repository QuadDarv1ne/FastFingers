import { supabase } from './supabase'
import { User, UserStats } from '../types/auth'
import { TypingStats } from '../types'

const LOCAL_STORAGE_KEY = 'fastfingers_cloud_sync'

interface CloudSession {
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  duration: number
  xp: number
  date: string
}

export async function syncUserStats(user: User, stats: Partial<UserStats>): Promise<void> {
  if (!supabase) {
    // Fallback на localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ userId: user.id, stats }))
    return
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ stats })
      .eq('id', user.id)

    if (error) throw error
  } catch {
    // Fallback на localStorage при ошибке
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ userId: user.id, stats }))
  }
}

export async function saveTypingSession(
  userId: string,
  stats: TypingStats,
  xp: number
): Promise<void> {
  if (!supabase) {
    // Fallback на localStorage
    const sessions = JSON.parse(localStorage.getItem('fastfingers_history') || '[]')
    sessions.unshift({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...stats,
      xp,
    })
    localStorage.setItem('fastfingers_history', JSON.stringify(sessions.slice(0, 100)))
    return
  }

  try {
    const { error } = await supabase.from('typing_sessions').insert({
      user_id: userId,
      wpm: stats.wpm,
      cpm: stats.cpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      correct_chars: stats.correctChars,
      total_chars: stats.totalChars,
      duration: Math.floor(stats.timeElapsed),
      xp,
    })

    if (error) throw error
  } catch {
    // Fallback на localStorage
    const sessions = JSON.parse(localStorage.getItem('fastfingers_history') || '[]')
    sessions.unshift({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...stats,
      xp,
    })
    localStorage.setItem('fastfingers_history', JSON.stringify(sessions.slice(0, 100)))
  }
}

export async function loadUserSessions(
  userId: string,
  limit: number = 100
): Promise<CloudSession[]> {
  if (!supabase) {
    // Fallback на localStorage
    return JSON.parse(localStorage.getItem('fastfingers_history') || '[]')
  }

  try {
    const { data, error } = await supabase
      .from('typing_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map(session => ({
      wpm: session.wpm,
      cpm: session.cpm,
      accuracy: session.accuracy,
      errors: session.errors,
      correctChars: session.correct_chars,
      totalChars: session.total_chars,
      duration: session.duration,
      xp: session.xp,
      date: session.created_at,
    }))
  } catch {
    // Fallback на localStorage
    return JSON.parse(localStorage.getItem('fastfingers_history') || '[]')
  }
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  if (!supabase) return

  try {
    await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievementId,
    })
  } catch {
    // Игнорируем ошибки достижений
  }
}

export async function completeDailyChallenge(
  userId: string,
  challengeId: string,
  wpm: number,
  accuracy: number
): Promise<void> {
  if (!supabase) return

  try {
    await supabase.from('user_challenges').upsert({
      user_id: userId,
      challenge_id: challengeId,
      completed: true,
      user_wpm: wpm,
      user_accuracy: accuracy,
      completed_at: new Date().toISOString(),
    })
  } catch {
    // Игнорируем ошибки челленджей
  }
}

export async function getDailyChallenge(date: string): Promise<{
  id: string
  text: string
  targetWpm: number
  targetAccuracy: number
  xpReward: number
} | null> {
  if (!supabase) {
    const hash = date.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
    return {
      id: 'local-' + date,
      text: 'Локальный челлендж',
      targetWpm: 30 + (Math.abs(hash) % 40),
      targetAccuracy: 85 + (Math.abs(hash) % 10),
      xpReward: 100,
    }
  }

  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', date)
      .single()

    if (error) return null

    return data
  } catch {
    return null
  }
}
