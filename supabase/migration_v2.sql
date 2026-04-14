-- ============================================================
-- Migration v2 — voer dit uit in Supabase SQL Editor
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS adts_drunk INTEGER NOT NULL DEFAULT 0;

ALTER TABLE global_state
  ADD COLUMN IF NOT EXISTS adt_uitdeel_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS adt_uitdeel_by_user_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS nl_tegenpunt_alert BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS scheduled_matches (
  id SERIAL PRIMARY KEY,
  team1 TEXT NOT NULL,
  team2 TEXT NOT NULL,
  match_date TIMESTAMPTZ,
  is_nl_match BOOLEAN NOT NULL DEFAULT FALSE,
  score1 INTEGER,
  score2 INTEGER,
  status TEXT DEFAULT 'upcoming',
  round_name TEXT,
  predictions_locked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS scheduled_predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL REFERENCES scheduled_matches(id) ON DELETE CASCADE,
  predicted_score1 INTEGER NOT NULL,
  predicted_score2 INTEGER NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  adt_uitgedeeld BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(user_id, match_id)
);

ALTER TABLE scheduled_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_predictions DISABLE ROW LEVEL SECURITY;
