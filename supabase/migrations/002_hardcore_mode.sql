-- Таблица рекордов режима "Без ошибок" (Hardcore Mode)
CREATE TABLE IF NOT EXISTS hardcore_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak INTEGER NOT NULL DEFAULT 0,
  wpm INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_hardcore_records_user_id ON hardcore_records(user_id);
CREATE INDEX IF NOT EXISTS idx_hardcore_records_streak ON hardcore_records(user_id, streak DESC);
CREATE INDEX IF NOT EXISTS idx_hardcore_records_created_at ON hardcore_records(user_id, created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE hardcore_records ENABLE ROW LEVEL SECURITY;

-- Политики RLS
CREATE POLICY "Пользователи видят только свои рекорды"
  ON hardcore_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать свои рекорды"
  ON hardcore_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять свои рекорды"
  ON hardcore_records
  FOR DELETE
  USING (auth.uid() = user_id);
