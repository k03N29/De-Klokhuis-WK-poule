-- ============================================================
-- De Klokhuis WK-Poule 2026 — Supabase Database Schema
-- Voer dit uit in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Users (de 7 spelers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  beers_drunk INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Landen (48 WK-landen)
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL DEFAULT '🏳',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Globale status (altijd 1 rij met id=1)
CREATE TABLE global_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  wout_status TEXT NOT NULL DEFAULT 'idle'
    CHECK (wout_status IN ('idle', 'subbed_in', 'scored')),
  draft_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ad_wedstrijd_active BOOLEAN NOT NULL DEFAULT FALSE,
  ad_wedstrijd_winner_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Wedstrijden
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  team1 TEXT NOT NULL,
  team2 TEXT NOT NULL,
  score1 INTEGER,
  score2 INTEGER,
  is_nl_match BOOLEAN NOT NULL DEFAULT FALSE,
  played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NL-Voorspellingen
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_score1 INTEGER NOT NULL,
  predicted_score2 INTEGER NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, match_id)
);

-- Punt-log (audit trail)
CREATE TABLE point_events (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initiële globale status
INSERT INTO global_state (id) VALUES (1);

-- Zet RLS uit (intern gebruik, geen wachtwoorden)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE countries DISABLE ROW LEVEL SECURITY;
ALTER TABLE global_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE point_events DISABLE ROW LEVEL SECURITY;
