-- Migration v5: WK Winnaar voorspelling
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS wk_winner_predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predicted_country TEXT NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Kolom op global_state voor de echte WK-winnaar (admin vult in)
ALTER TABLE global_state ADD COLUMN IF NOT EXISTS wk_winner TEXT NULL;
