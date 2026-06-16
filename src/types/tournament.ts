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
