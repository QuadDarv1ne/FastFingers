-- FastFingers — Полная миграция базы данных Supabase
-- Версия: 2026-05-11
-- Инструкция: скопируйте весь скрипт и вставьте в SQL Editor на https://app.supabase.com
-- Затем нажмите "Run" для выполнения

-- ============================================
-- ЭТАП 1: Расширения и базовая схема
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  stats JSONB DEFAULT '{"totalXp":0,"level":1,"bestWpm":0,"bestAccuracy":0,"totalWordsTyped":0,"totalPracticeTime":0,"currentStreak":0,"longestStreak":0,"completedChallenges":0}'::jsonb
);

-- Typing sessions table
CREATE TABLE IF NOT EXISTS typing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wpm INTEGER NOT NULL,
  cpm INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  errors INTEGER DEFAULT 0,
  correct_chars INTEGER DEFAULT 0,
  total_chars INTEGER DEFAULT 0,
  duration INTEGER NOT NULL,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_id)
);

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  text TEXT NOT NULL,
  target_wpm INTEGER NOT NULL,
  target_accuracy INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  completed BOOLEAN DEFAULT FALSE
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  user_wpm INTEGER,
  user_accuracy INTEGER,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- ============================================
-- ЭТАП 2: Hardcore Mode
-- ============================================

CREATE TABLE IF NOT EXISTS hardcore_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak INTEGER NOT NULL DEFAULT 0,
  wpm INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ЭТАП 3: Leaderboards, Duels, Tournaments
-- ============================================

CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL DEFAULT 'classic',
  wpm INTEGER NOT NULL DEFAULT 0,
  cpm INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  season TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  challenger_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  challenger_wpm INTEGER,
  opponent_wpm INTEGER,
  challenger_accuracy INTEGER,
  opponent_accuracy INTEGER,
  bet_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CHECK (challenger_id != opponent_id)
);

CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  game_mode TEXT NOT NULL DEFAULT 'classic',
  status TEXT NOT NULL DEFAULT 'upcoming',
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

-- ============================================
-- ЭТАП 4: User Stats Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stats JSONB NOT NULL DEFAULT '{"totalXp":0,"level":1,"bestWpm":0,"bestAccuracy":0,"totalWordsTyped":0,"totalPracticeTime":0,"currentStreak":0,"longestStreak":0,"completedChallenges":0}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON typing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON typing_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_hardcore_records_user_id ON hardcore_records(user_id);
CREATE INDEX IF NOT EXISTS idx_hardcore_records_streak ON hardcore_records(user_id, streak DESC);
CREATE INDEX IF NOT EXISTS idx_hardcore_records_created_at ON hardcore_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_game_mode ON leaderboards(game_mode);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(game_mode, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_season ON leaderboards(season);
CREATE INDEX IF NOT EXISTS idx_leaderboards_created_at ON leaderboards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duels_challenger ON duels(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duels_opponent ON duels(opponent_id);
CREATE INDEX IF NOT EXISTS idx_duels_status ON duels(status);
CREATE INDEX IF NOT EXISTS idx_duels_created_at ON duels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON tournaments(created_by);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_rank ON tournament_participants(tournament_id, rank);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_updated_at ON user_stats(updated_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardcore_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Typing sessions policies
CREATE POLICY "Users can read own sessions" ON typing_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON typing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON typing_sessions FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can read own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User challenges policies
CREATE POLICY "Users can read own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own challenges" ON user_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenges" ON user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Hardcore records policies
CREATE POLICY "Пользователи видят только свои рекорды" ON hardcore_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Пользователи могут создавать свои рекорды" ON hardcore_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Пользователи могут удалять свои рекорды" ON hardcore_records FOR DELETE USING (auth.uid() = user_id);

-- Leaderboards policies
CREATE POLICY "Anyone can read leaderboards" ON leaderboards FOR SELECT USING (true);
CREATE POLICY "Users can create own leaderboard entries" ON leaderboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own leaderboard entries" ON leaderboards FOR DELETE USING (auth.uid() = user_id);

-- Duels policies
CREATE POLICY "Users can read duels they participate in" ON duels FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "Users can create duels as challenger" ON duels FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update duels they participate in" ON duels FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- Tournaments policies
CREATE POLICY "Anyone can read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tournaments" ON tournaments FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Tournament creators can update their tournaments" ON tournaments FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Tournament creators can delete their tournaments" ON tournaments FOR DELETE USING (auth.uid() = created_by);

-- Tournament participants policies
CREATE POLICY "Anyone can read tournament participants" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can register for tournaments" ON tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tournament admins can update participants" ON tournament_participants FOR UPDATE USING (true);

-- User stats policies
CREATE POLICY "Users can read own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

DROP TRIGGER IF EXISTS trg_update_stats_after_session ON typing_sessions;
CREATE TRIGGER trg_update_stats_after_session
  AFTER INSERT ON typing_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_after_session();

-- Function to sync user_stats with users table
CREATE OR REPLACE FUNCTION public.sync_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET stats = NEW.stats,
      last_login = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_user_stats ON user_stats;
CREATE TRIGGER trg_sync_user_stats
  AFTER UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_stats();

-- Function to initialize user_stats on new user
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, stats, updated_at)
  VALUES (
    NEW.id,
    '{"totalXp":0,"level":1,"bestWpm":0,"bestAccuracy":0,"totalWordsTyped":0,"totalPracticeTime":0,"currentStreak":0,"longestStreak":0,"completedChallenges":0}'::jsonb,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_initialize_user_stats ON users;
CREATE TRIGGER trg_initialize_user_stats
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_stats();

-- ============================================
-- ФУНКЦИИ ДЛЯ LEADERBOARD
-- ============================================

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
-- SEED DATA
-- ============================================

INSERT INTO daily_challenges (date, text, target_wpm, target_accuracy, xp_reward, completed)
VALUES
  (CURRENT_DATE, 'The quick brown fox jumps over the lazy dog', 60, 95, 150, FALSE)
ON CONFLICT (date) DO NOTHING;

-- ============================================
-- ГОТОВО!
-- ============================================
-- Все таблицы, индексы, политики RLS, функции и триггеры созданы.
-- Следующий шаг: включите Realtime для таблиц duels, tournaments, tournament_participants
-- в Dashboard Supabase → Database → Replication → Enable Realtime.
