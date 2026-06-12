/**
 * TournamentMode — Режим турниров
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppTranslation } from '../i18n/config'
import i18n from 'i18next'
import { useAuth } from '@hooks/useAuth'
import { useTypingGame } from '@hooks/useTypingGame'
import { simulateInput } from '../utils/inputEvent'
import { useTypingSound } from '../hooks/useTypingSound'
import { TypingStats } from '../types'
import { useSupabase } from '@hooks/useSupabase'
import { TournamentBracket } from './TournamentBracket'
import { logger } from '../utils/logger'
import { TypingTextDisplay } from './ui/TypingTextDisplay'

interface TournamentModeProps {
  onExit: () => void
  onComplete?: (stats: TypingStats) => void
}

export interface Tournament {
  id: string
  name: string
  description?: string
  game_mode: string
  status: 'upcoming' | 'registration' | 'active' | 'completed' | 'cancelled'
  min_level: number
  min_wpm: number
  entry_fee: number
  prize_pool: number
  max_participants: number
  current_participants: number
  start_time: string
  end_time?: string
  created_by: string
  creator_name?: string
  creator_avatar?: string
}

export interface TournamentParticipant {
  id: string
  tournament_id: string
  user_id: string
  rank?: number
  score: number
  wpm?: number
  accuracy?: number
  eliminated: boolean
  prize_won: number
  user_name?: string
  user_avatar?: string
  user_level?: number
  user_wpm?: number
}

const TOURNAMENT_ICONS: Record<string, string> = {
  upcoming: '📅',
  registration: '📝',
  active: '🔴',
  completed: '✅',
  cancelled: '❌',
}

const TOURNAMENT_LABELS: Record<string, string> = {
  upcoming: 'Предстоящий',
  registration: 'Регистрация',
  active: 'Идет',
  completed: 'Завершен',
  cancelled: 'Отменен',
}

export const TournamentMode = memo(function TournamentMode({ onExit, onComplete }: TournamentModeProps) {
  const { t } = useAppTranslation()
  const { user } = useAuth()
  const { client: supabase, isReady: supabaseReady } = useSupabase()
  const mountedRef = useRef(true)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [participants, setParticipants] = useState<TournamentParticipant[]>([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showBracket, setShowBracket] = useState(false)
  const [matchResult, setMatchResult] = useState<TypingStats | null>(null)
  const [activeMatch, setActiveMatch] = useState<{
    opponent: TournamentParticipant
    text: string
  } | null>(null)

  // Track mount status to prevent state updates after unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Sound for typing feedback
  const sound = useTypingSound({ enabled: true, volume: 0.5, theme: 'soft' })

  // Save match result to tournament
  const saveMatchResult = useCallback(async (stats: TypingStats) => {
    if (!supabaseReady || !supabase || !selectedTournament || !user) return

    try {
      const score = Math.round(stats.wpm * (stats.accuracy / 100))
      const { error } = await supabase
        .from('tournament_participants')
        .update({ score, wpm: stats.wpm, accuracy: stats.accuracy })
        .eq('tournament_id', selectedTournament.id)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      logger.error('Error saving match result:', error)
    }
  }, [supabaseReady, supabase, selectedTournament, user])

  // Typing engine for active match
  const {
    text: matchText,
    currentIndex,
    inputResults,
    isActive: isTypingActive,
    wpm,
    accuracy,
    inputRef,
    handleInput,
  } = useTypingGame({
    initialWordCount: 50,
    initialDifficulty: 5,
    mode: 'practice',
    onComplete: (stats: TypingStats) => {
      saveMatchResult(stats)
      onComplete?.(stats)
      setMatchResult(stats)
      setActiveMatch(null)
    },
    sound,
  })

  // Handle key down instead of input to avoid controlled input loop
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length > 1 && e.key !== 'Enter') return
    e.preventDefault()
    const input = e.currentTarget
    input.value = e.key === 'Enter' ? '\n' : e.key
    handleInput(simulateInput(input))
  }, [handleInput])

  // Загрузка турниров
  const loadTournaments = useCallback(async () => {
    if (!supabaseReady || !supabase) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          creator:users!created_by (
            name,
            avatar
          )
        `)
        .order('start_time', { ascending: true })

      if (error) throw error

      if (mountedRef.current) {
        setTournaments((data || []).map(t => ({
          ...t,
          creator_name: t.creator?.name,
          creator_avatar: t.creator?.avatar,
        })))
      }
    } catch (error) {
      logger.error('Error loading tournaments:', error)
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [supabaseReady, supabase])

  // Загрузка участников
  const loadParticipants = useCallback(async (tournamentId: string) => {
    if (!supabaseReady || !supabase) return

    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          user:users!user_id (
            name,
            avatar,
            stats
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('rank', { ascending: true })

      if (error) throw error

      if (mountedRef.current) {
        setParticipants((data || []).map(p => ({
          ...p,
          user_name: p.user?.name,
          user_avatar: p.user?.avatar,
          user_level: p.user?.stats?.level,
          user_wpm: p.user?.stats?.bestWpm,
        })))

        // Проверяем, зарегистрирован ли текущий пользователь
        const isUserRegistered = data?.some(p => p.user_id === user?.id)
        setIsRegistered(!!isUserRegistered)
      }
    } catch (error) {
      logger.error('Error loading participants:', error)
    }
  }, [user?.id, supabaseReady, supabase])

  // Регистрация в турнире
  const handleRegister = useCallback(async () => {
    if (!supabaseReady || !selectedTournament || !user || !supabase) return

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: selectedTournament.id,
          user_id: user.id,
          score: 0,
          eliminated: false,
          prize_won: 0,
        })

      if (error) throw error

      setIsRegistered(true)

      // Обновляем счетчик участников
      setTournaments(prev => prev.map(t =>
        t.id === selectedTournament.id
          ? { ...t, current_participants: t.current_participants + 1 }
          : t
      ))
    } catch (error) {
      logger.error('Error registering:', error)
    }
  }, [selectedTournament, user, supabaseReady, supabase])

  // Отмена регистрации
  const handleUnregister = useCallback(async () => {
    if (!supabaseReady || !selectedTournament || !user || !supabase) return

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', selectedTournament.id)
        .eq('user_id', user.id)

      if (error) throw error

      setIsRegistered(false)

      // Обновляем счетчик участников
      setTournaments(prev => prev.map(t =>
        t.id === selectedTournament.id
          ? { ...t, current_participants: Math.max(0, t.current_participants - 1) }
          : t
      ))
    } catch (error) {
      logger.error('Error unregistering:', error)
    }
  }, [selectedTournament, user, supabaseReady, supabase])

  useEffect(() => {
    loadTournaments()
  }, [loadTournaments])

  useEffect(() => {
    if (selectedTournament) {
      loadParticipants(selectedTournament.id)
    }
  }, [selectedTournament, loadParticipants])

  // Подписка на обновления турнира
  const selectedTournamentIdRef = useRef<string | null>(selectedTournament?.id ?? null)
  selectedTournamentIdRef.current = selectedTournament?.id ?? null

  useEffect(() => {
    if (!selectedTournament || !supabaseReady || !supabase) return

    const tournamentId = selectedTournament.id
    const channel = supabase
      .channel(`tournament:${tournamentId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tournaments',
        filter: `id=eq.${tournamentId}`,
      }, (payload) => {
        const updated = payload.new as Tournament
        setSelectedTournament(prev => prev ? { ...prev, ...updated } : null)
        setTournaments(prev => prev.map(t =>
          t.id === tournamentId ? { ...t, ...updated } : t
        ))
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_participants',
        filter: `tournament_id=eq.${tournamentId}`,
      }, () => {
        const currentId = selectedTournamentIdRef.current
        if (currentId) loadParticipants(currentId)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedTournament, loadParticipants, supabase, supabaseReady])

  if (matchResult) {
    return (
      <div className="glass rounded-xl p-8 relative overflow-hidden">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gradient mb-6">
            🏆 Матч завершён!
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
            <div className="bg-dark-800 rounded-lg p-4">
              <p className="text-sm text-dark-400">WPM</p>
              <p className="text-3xl font-bold text-primary-400">{matchResult.wpm}</p>
            </div>
            <div className="bg-dark-800 rounded-lg p-4">
              <p className="text-sm text-dark-400">Точность</p>
              <p className="text-3xl font-bold text-success">{matchResult.accuracy}%</p>
            </div>
            <div className="bg-dark-800 rounded-lg p-4">
              <p className="text-sm text-dark-400">Ошибки</p>
              <p className="text-3xl font-bold text-error">{matchResult.errors}</p>
            </div>
          </div>
          <button
            onClick={() => setMatchResult(null)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
          >
            Продолжить
          </button>
        </div>
      </div>
    )
  }

  if (activeMatch) {
    return (
      <div className="glass rounded-xl p-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            ⚔️ Матч против {activeMatch.opponent.user_name || 'Игрока'}
          </h2>
          <button
            onClick={() => setActiveMatch(null)}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            aria-label={t('action.close')}
          >
            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-800 rounded-lg p-4 text-center">
            <p className="text-sm text-dark-400">WPM</p>
            <p className="text-2xl font-bold text-primary-400">{wpm}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-4 text-center">
            <p className="text-sm text-dark-400">Точность</p>
            <p className="text-2xl font-bold text-success">{accuracy}%</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-4 text-center">
            <p className="text-sm text-dark-400">Символы</p>
            <p className="text-2xl font-bold text-dark-300">{currentIndex}</p>
          </div>
        </div>

        {/* Область ввода */}
        <div className="bg-dark-800/50 rounded-xl p-6 min-h-[100px] relative">
          <input
            ref={inputRef}
            type="text"
            className="sr-only"
            onKeyDown={handleKeyDown}
            disabled={!isTypingActive}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <TypingTextDisplay
            text={matchText}
            currentIndex={currentIndex}
            inputResults={inputResults}
            isActive={isTypingActive}
          />
        </div>

        <p className="text-center text-dark-400 mt-4 text-sm">
          {isTypingActive ? 'Печатайте текст выше...' : 'Нажмите на область текста чтобы начать'}
        </p>
      </div>
    )
  }

  if (showBracket && selectedTournament) {
    return (
      <TournamentBracket
        tournament={selectedTournament}
        participants={participants}
        onBack={() => setShowBracket(false)}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="glass rounded-xl p-8 relative overflow-hidden">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
            🏆 Турниры
          </h2>
          <p className="text-sm text-dark-400">Участвуй в турнирах и побеждай</p>
        </div>
        <button
          onClick={onExit}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          title={t('action.exit')}
          aria-label={t('action.exit')}
        >
          <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Список турниров */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Загрузка турниров...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-dark-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-dark-400">Турниры пока не созданы</p>
          <p className="text-sm text-dark-500 mt-2">Заходи позже или создай свой турнир</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTournament?.id === tournament.id
                  ? 'bg-primary-600/20 border-primary-500'
                  : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
              }`}
              onClick={() => {
                setSelectedTournament(tournament)
                if (tournament.status === 'active') {
                  setShowBracket(true)
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{TOURNAMENT_ICONS[tournament.status]}</span>
                  <div>
                    <h3 className="font-semibold text-white">{tournament.name}</h3>
                    <p className="text-sm text-dark-400">{tournament.description || 'Без описания'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                      <span>🎮 {tournament.game_mode}</span>
                      <span>👥 {tournament.current_participants}/{tournament.max_participants}</span>
                      <span>🏆 {tournament.prize_pool} XP</span>
                      {tournament.min_wpm > 0 && <span>⚡ Мин. WPM: {tournament.min_wpm}</span>}
                      {tournament.min_level > 1 && <span>📊 Мин. уровень: {tournament.min_level}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    tournament.status === 'registration' ? 'bg-green-500/20 text-green-400' :
                    tournament.status === 'active' ? 'bg-red-500/20 text-red-400' :
                    tournament.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-dark-600 text-dark-400'
                  }`}>
                    {TOURNAMENT_LABELS[tournament.status]}
                  </span>
                  <p className="text-xs text-dark-500 mt-2">
                    {new Date(tournament.start_time).toLocaleDateString(i18n.language, {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Детали выбранного турнира */}
      <AnimatePresence>
        {selectedTournament && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-6 bg-dark-800/50 rounded-xl border border-dark-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedTournament.name}</h3>
              <button
                onClick={() => setSelectedTournament(null)}
                className="p-1 hover:bg-dark-700 rounded transition-colors"
                aria-label={t('action.close')}
              >
                <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-dark-400">Статус</p>
                <p className="font-medium">{TOURNAMENT_LABELS[selectedTournament.status]}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Участники</p>
                <p className="font-medium">{selectedTournament.current_participants}/{selectedTournament.max_participants}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Призовой фонд</p>
                <p className="font-medium text-yellow-400">{selectedTournament.prize_pool} XP</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Взнос</p>
                <p className="font-medium">{selectedTournament.entry_fee} XP</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Начало</p>
                <p className="font-medium">
                  {new Date(selectedTournament.start_time).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Режим</p>
                <p className="font-medium">{selectedTournament.game_mode}</p>
              </div>
            </div>

            {selectedTournament.description && (
              <div className="mb-6">
                <p className="text-sm text-dark-400 mb-2">Описание</p>
                <p className="text-dark-300">{selectedTournament.description}</p>
              </div>
            )}

            {/* Участники */}
            {participants.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  👥 Участники ({participants.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {participants.slice(0, 10).map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        participant.user_id === user?.id ? 'bg-primary-600/20 border border-primary-500' : 'bg-dark-700/50'
                      }`}
                    >
                      <span className="text-sm font-medium text-dark-400 w-6">#{index + 1}</span>
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {participant.user_avatar || participant.user_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.user_name || 'Аноним'}</p>
                        <p className="text-xs text-dark-500">
                          Уровень {participant.user_level || 1} • {participant.user_wpm || 0} WPM
                        </p>
                      </div>
                      {participant.rank && (
                        <span className="text-xs text-dark-400">Место: {participant.rank}</span>
                      )}
                    </div>
                  ))}
                  {participants.length > 10 && (
                    <p className="text-xs text-dark-500 text-center">
                      + ещё {participants.length - 10} участников
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex gap-2">
              {selectedTournament.status === 'registration' && (
                <>
                  {isRegistered ? (
                    <button
                      onClick={handleUnregister}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
                    >
                      Отменить регистрацию
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={selectedTournament.current_participants >= selectedTournament.max_participants}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedTournament.current_participants >= selectedTournament.max_participants
                          ? 'bg-dark-600 text-dark-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-500 text-white'
                      }`}
                    >
                      {selectedTournament.current_participants >= selectedTournament.max_participants
                        ? 'Турнир заполнен'
                        : 'Зарегистрироваться'}
                    </button>
                  )}
                </>
              )}

              {selectedTournament.status === 'active' && isRegistered && (
                <button
                  onClick={() => setShowBracket(true)}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                >
                  🎮 Смотреть сетку
                </button>
              )}

              {selectedTournament.status === 'active' && !isRegistered && (
                <p className="text-dark-400 text-sm">
                  Регистрация закрыта. Турнир уже начался.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
