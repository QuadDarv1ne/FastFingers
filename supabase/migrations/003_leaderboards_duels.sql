-- Leaderboards, Duels, and Tournaments Schema
-- FastFingers - Migration 003

-- ============================================
-- LEADERBOARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL DEFAULT 'classic', -- classic, hardcore, duel
  wpm INTEGER NOT NULL DEFAULT 0,
  cpm INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  season TEXT, -- e.g., "2025-Q1", "2025-03"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for leaderboards
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_game_mode ON leaderboards(game_mode);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(game_mode, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_season ON leaderboards(season);
CREATE INDEX IF NOT EXISTS idx_leaderboards_created_at ON leaderboards(created_at DESC);

-- RLS for leaderboards
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboards" ON leaderboards
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create own leaderboard entries" ON leaderboards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leaderboard entries" ON leaderboards
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DUELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, completed, cancelled
  challenger_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  challenger_wpm INTEGER,
  opponent_wpm INTEGER,
  challenger_accuracy INTEGER,
  opponent_accuracy INTEGER,
  bet_amount INTEGER DEFAULT 0, -- XP bet
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CHECK (challenger_id != opponent_id)
);

-- Indexes for duels
CREATE INDEX IF NOT EXISTS idx_duels_challenger ON duels(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duels_opponent ON duels(opponent_id);
CREATE INDEX IF NOT EXISTS idx_duels_status ON duels(status);
CREATE INDEX IF NOT EXISTS idx_duels_created_at ON duels(created_at DESC);

-- RLS for duels
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read duels they participate in" ON duels
  FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can create duels as challenger" ON duels
  FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update duels they participate in" ON duels
  FOR UPDATE
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- ============================================
-- TOURNAMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  game_mode TEXT NOT NULL DEFAULT 'classic',
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, registration, active, completed, cancelled
  min_level INTEGER DEFAULT 1,
  min_wpm INTEGER DEFAULT 0,
  entry_fee INTEGER DEFAULT 0,
  prize_pool INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 100,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for tournaments
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON tournaments(created_by);

-- RLS for tournaments
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournaments" ON tournaments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tournaments" ON tournaments
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tournament creators can update their tournaments" ON tournaments
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Tournament creators can delete their tournaments" ON tournaments
  FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- TOURNAMENT PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER,
  score INTEGER DEFAULT 0,
  wpm INTEGER,
  accuracy INTEGER,
  eliminated BOOLEAN DEFAULT FALSE,
  prize_won INTEGER DEFAULT 0,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Indexes for tournament participants
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_rank ON tournament_participants(tournament_id, rank);

-- RLS for tournament participants
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournament participants" ON tournament_participants
  FOR SELECT
  USING (true);

CREATE POLICY "Users can register for tournaments" ON tournament_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tournament admins can update participants" ON tournament_participants
  FOR UPDATE
  USING (true);

-- ============================================
-- ACHIEVEMENTS TABLE (Updated)
-- ============================================
-- Add metadata column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_achievements' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update user stats after typing session
CREATE OR REPLACE FUNCTION public.update_user_stats_after_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    '{totalXp}',
    to_jsonb(COALESCE((stats->>'totalXp')::int, 0) + COALESCE(NEW.xp, 0))
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating stats
DROP TRIGGER IF EXISTS trg_update_stats_after_session ON typing_sessions;
CREATE TRIGGER trg_update_stats_after_session
  AFTER INSERT ON typing_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_after_session();

-- Function to get global leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_game_mode TEXT DEFAULT 'classic',
  p_season TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  name TEXT,
  avatar TEXT,
  wpm INTEGER,
  accuracy INTEGER,
  score INTEGER,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY l.score DESC, l.wpm DESC, l.accuracy DESC) AS rank,
    l.user_id,
    u.name,
    u.avatar,
    l.wpm,
    l.accuracy,
    l.score,
    (u.stats->>'level')::INTEGER AS level
  FROM leaderboards l
  JOIN users u ON l.user_id = u.id
  WHERE l.game_mode = p_game_mode
    AND (p_season IS NULL OR l.season = p_season)
  ORDER BY l.score DESC, l.wpm DESC, l.accuracy DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user's rank
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID, p_game_mode TEXT DEFAULT 'classic')
RETURNS TABLE (
  rank BIGINT,
  total_players BIGINT,
  percentile NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      user_id,
      ROW_NUMBER() OVER (ORDER BY score DESC, wpm DESC, accuracy DESC) AS rank
    FROM leaderboards
    WHERE game_mode = p_game_mode
  )
  SELECT
    r.rank,
    COUNT(*) OVER () AS total_players,
    ROUND(100.0 * (COUNT(*) OVER () - r.rank) / COUNT(*) OVER (), 2) AS percentile
  FROM ranked r
  WHERE r.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- SEED DATA FOR DAILY CHALLENGES
-- ============================================
INSERT INTO daily_challenges (date, text, target_wpm, target_accuracy, xp_reward, completed)
VALUES
  (CURRENT_DATE, 'The quick brown fox jumps over the lazy dog', 60, 95, 150, FALSE)
ON CONFLICT (date) DO NOTHING;
