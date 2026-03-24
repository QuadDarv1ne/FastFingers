-- User Stats Table (separate from users for better sync management)
-- FastFingers - Migration 004

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stats JSONB NOT NULL DEFAULT '{"totalXp":0,"level":1,"bestWpm":0,"bestAccuracy":0,"totalWordsTyped":0,"totalPracticeTime":0,"currentStreak":0,"longestStreak":0,"completedChallenges":0}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_updated_at ON user_stats(updated_at DESC);

-- RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own stats" ON user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to sync stats with users table
CREATE OR REPLACE FUNCTION public.sync_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update users table stats from user_stats
  UPDATE users
  SET stats = NEW.stats,
      last_login = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync on user_stats update
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

-- Trigger to create user_stats on user creation
DROP TRIGGER IF EXISTS trg_initialize_user_stats ON users;
CREATE TRIGGER trg_initialize_user_stats
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_stats();
