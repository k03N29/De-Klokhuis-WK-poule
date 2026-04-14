-- ============================================================
-- V3: NL doelpuntenmakers systeem
-- ============================================================

-- Tabel: gebruikers voorspellen 2 NL doelpuntenmakers per wedstrijd
CREATE TABLE IF NOT EXISTS nl_scorer_predictions (
  id                SERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(id),
  match_id          INTEGER NOT NULL REFERENCES scheduled_matches(id),
  scorer1_name      TEXT NOT NULL,
  scorer1_position  TEXT NOT NULL,  -- 'aanvaller' | 'middenvelder' | 'verdediger'
  scorer2_name      TEXT NOT NULL,
  scorer2_position  TEXT NOT NULL,
  points_awarded    INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, match_id)
);

-- Tabel: admin logt daadwerkelijke NL doelpunten (1 rij per doelpunt)
CREATE TABLE IF NOT EXISTS nl_goals (
  id               SERIAL PRIMARY KEY,
  match_id         INTEGER NOT NULL REFERENCES scheduled_matches(id),
  scorer_name      TEXT NOT NULL,
  scorer_position  TEXT NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
