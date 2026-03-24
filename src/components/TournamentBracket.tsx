/**
 * TournamentBracket — Визуализация турнирной сетки
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useAppTranslation } from '../i18n/config'
import type { Tournament, TournamentParticipant } from './TournamentMode'

interface TournamentBracketProps {
  tournament: Tournament
  participants: TournamentParticipant[]
  onBack: () => void
  onExit: () => void
}

interface BracketRound {
  name: string
  matches: BracketMatch[]
}

interface BracketMatch {
  id: string
  player1: TournamentParticipant | null
  player2: TournamentParticipant | null
  winner: TournamentParticipant | null
  round: number
}

export function TournamentBracket({ tournament, participants, onBack, onExit }: TournamentBracketProps) {
  const { t } = useAppTranslation()

  // Генерация сетки турнира
  const rounds = useMemo(() => {
    if (participants.length < 2) return []

    // Определяем количество раундов
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(participants.length)))
    const numRounds = Math.log2(bracketSize)

    // Заполняем первый раунд
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const firstRoundMatches: BracketMatch[] = []

    for (let i = 0; i < bracketSize / 2; i++) {
      const player1 = shuffled[i * 2] ?? null
      const player2 = shuffled[i * 2 + 1] ?? null

      // Определяем победителя (если есть данные)
      let winner: TournamentParticipant | null = null
      if (player1 && player2) {
        // Сравниваем WPM для определения победителя
        const p1Wpm = player1.wpm || player1.score || 0
        const p2Wpm = player2.wpm || player2.score || 0
        winner = p1Wpm >= p2Wpm ? player1 : player2
      } else if (player1) {
        winner = player1 // Автоматический проход
      }

      firstRoundMatches.push({
        id: `round1-match${i}`,
        player1,
        player2,
        winner,
        round: 1,
      })
    }

    const allRounds: BracketRound[] = [{
      name: 'Раунд 1',
      matches: firstRoundMatches,
    }]

    // Генерируем последующие раунды
    let prevRoundWinners = firstRoundMatches.map(m => m.winner)

    for (let round = 2; round <= numRounds; round++) {
      const roundMatches: BracketMatch[] = []
      const roundName = round === numRounds ? 'Финал' : round === numRounds - 1 ? 'Полуфинал' : `Раунд ${round}`

      for (let i = 0; i < prevRoundWinners.length; i += 2) {
        const player1 = prevRoundWinners[i] ?? null
        const player2 = prevRoundWinners[i + 1] ?? null

        let winner: TournamentParticipant | null = null
        if (player1 && player2) {
          const p1Wpm = player1.wpm || player1.score || 0
          const p2Wpm = player2.wpm || player2.score || 0
          winner = p1Wpm >= p2Wpm ? player1 : player2
        } else if (player1) {
          winner = player1
        }

        roundMatches.push({
          id: `round${round}-match${i / 2}`,
          player1,
          player2,
          winner,
          round,
        })
      }

      allRounds.push({
        name: roundName,
        matches: roundMatches,
      })

      prevRoundWinners = roundMatches.map(m => m.winner)
    }

    return allRounds
  }, [participants])

  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : undefined
  const champion = lastRound?.matches[0]?.winner || null

  return (
    <div className="glass rounded-xl p-6 relative overflow-hidden">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
            🏆 {tournament.name}
          </h2>
          <p className="text-sm text-dark-400">Турнирная сетка</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm font-medium transition-colors"
          >
            ← Назад
          </button>
          <button
            onClick={onExit}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            title={t('action.exit')}
          >
            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Чемпион */}
      {champion && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 p-6 bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-yellow-600/20 rounded-xl border border-yellow-500/50 text-center"
        >
          <p className="text-yellow-400 text-sm font-medium mb-2">🏆 ЧЕМПИОН</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-xl font-bold">
              {champion.user_avatar || champion.user_name?.[0]?.toUpperCase() || '🏆'}
            </div>
            <div>
              <p className="text-xl font-bold">{champion.user_name || 'Неизвестен'}</p>
              <p className="text-sm text-dark-400">
                {champion.wpm || champion.score || 0} WPM • {champion.accuracy || 0}% точность
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Турнирная сетка */}
      {rounds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-400">Ожидание участников...</p>
          <p className="text-sm text-dark-500 mt-2">
            Для начала турнира необходимо минимум 2 участника
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {rounds.map((round, roundIndex) => (
              <div key={round.name} className="flex flex-col gap-4">
                <h3 className="text-center font-semibold text-dark-300 sticky top-0 bg-dark-900/90 px-4 py-2 rounded-lg">
                  {round.name}
                </h3>
                <div className="flex flex-col gap-4">
                  {round.matches.map((match) => (
                    <BracketMatchCard
                      key={match.id}
                      match={match}
                      isFinalRound={roundIndex === rounds.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Легенда */}
      <div className="mt-6 pt-6 border-t border-dark-700">
        <h4 className="text-sm font-medium text-dark-400 mb-3">Условные обозначения</h4>
        <div className="flex flex-wrap gap-4 text-xs text-dark-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/30 border border-green-500 rounded" />
            <span>Победитель</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-dark-700 border border-dark-600 rounded" />
            <span>Ожидание матча</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-600/30 border border-primary-500 rounded" />
            <span>Ваш матч</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface BracketMatchCardProps {
  match: BracketMatch
  isFinalRound: boolean
}

function BracketMatchCard({ match, isFinalRound }: BracketMatchCardProps) {
  const { user } = useAuth()
  const currentUserId = user?.id || ''
  const isUserMatch = match.player1?.user_id === currentUserId || match.player2?.user_id === currentUserId

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-lg border min-w-[280px] ${
        isFinalRound && match.winner
          ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/50'
          : isUserMatch
          ? 'bg-primary-600/10 border-primary-500/50'
          : 'bg-dark-800/50 border-dark-700'
      }`}
    >
      {/* Игрок 1 */}
      <div className={`flex items-center justify-between p-2 rounded ${
        match.winner?.user_id === match.player1?.user_id ? 'bg-green-500/20' : ''
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.player1 ? (
            <>
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {match.player1.user_avatar || match.player1.user_name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium truncate">
                {match.player1.user_name || 'Игрок'}
              </span>
            </>
          ) : (
            <span className="text-sm text-dark-600 italic">Ожидание...</span>
          )}
        </div>
        {match.player1 && (
          <span className="text-xs font-mono text-dark-400 ml-2">
            {match.player1.wpm || match.player1.score || 0} WPM
          </span>
        )}
      </div>

      {/* Разделитель */}
      <div className="my-1 border-t border-dark-700" />

      {/* Игрок 2 */}
      <div className={`flex items-center justify-between p-2 rounded ${
        match.winner && match.player2 && match.winner.user_id === match.player2.user_id ? 'bg-green-500/20' : ''
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.player2 ? (
            <>
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {match.player2.user_avatar || match.player2.user_name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium truncate">
                {match.player2.user_name || 'Игрок'}
              </span>
            </>
          ) : (
            <span className="text-sm text-dark-600 italic">Ожидание...</span>
          )}
        </div>
        {match.player2 && (
          <span className="text-xs font-mono text-dark-400 ml-2">
            {match.player2.wpm || match.player2.score || 0} WPM
          </span>
        )}
      </div>

      {/* Статус матча */}
      {!match.player1 || !match.player2 ? (
        <p className="text-xs text-dark-500 text-center mt-2">Ожидание игроков</p>
      ) : !match.winner ? (
        <p className="text-xs text-dark-500 text-center mt-2">Матч идет...</p>
      ) : null}
    </motion.div>
  )
}
