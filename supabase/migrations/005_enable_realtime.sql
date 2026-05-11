-- FastFingers — Enable Realtime для дуэлей, турниров и участников
-- Версия: 2026-05-11
-- Инструкция: скопируйте скрипт и вставьте в SQL Editor на https://app.supabase.com
-- Затем нажмите "Run" для выполнения

-- ============================================
-- Включение Realtime Publication для таблиц
-- ============================================

-- Supabase Realtime использует PostgreSQL logical replication через publication.
-- По умолчанию публикация 'supabase_realtime' уже создана, но нужно добавить
-- таблицы в неё для того чтобы Realtime работал.

-- Добавляем таблицу duels в realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE duels;

-- Добавляем таблицу tournaments в realtime publication  
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;

-- Добавляем таблицу tournament_participants в realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_participants;

-- ============================================
-- ГОТОВО!
-- ============================================
-- Realtime теперь включен для таблиц:
--   • duels — обновления дуэлей в реальном времени
--   • tournaments — обновления турниров в реальном времени
--   • tournament_participants — изменения участников в реальном времени
--
-- Проверить статус можно в Dashboard → Database → Replication
