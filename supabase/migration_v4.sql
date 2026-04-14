-- ============================================================
-- V4: Quiz systeem + fix NL wedstrijdtijden
-- ============================================================

-- Fix NL match times (waren 2 uur te laat opgeslagen, nu correct UTC voor NL zomertijd UTC+2)
-- Nederland-Japan: 22:00 NL = 20:00 UTC
UPDATE scheduled_matches SET match_date = '2026-06-14 20:00:00+00' WHERE team1='Nederland' AND team2='Japan';
-- Nederland-Zweden: 19:00 NL = 17:00 UTC
UPDATE scheduled_matches SET match_date = '2026-06-20 17:00:00+00' WHERE team1='Nederland' AND team2='Zweden';
-- Tunesië-Nederland: 01:00 NL op 26 juni = 23:00 UTC op 25 juni
UPDATE scheduled_matches SET match_date = '2026-06-25 23:00:00+00' WHERE team1='Tunesië' AND team2='Nederland';

-- Quiz vragen tabel (één per dag)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id               SERIAL PRIMARY KEY,
  question_date    DATE NOT NULL UNIQUE,
  match_reference  TEXT NOT NULL,
  question         TEXT NOT NULL,
  option_a         TEXT NOT NULL,
  option_b         TEXT NOT NULL,
  option_c         TEXT NOT NULL,
  correct_option   CHAR(1),  -- 'A', 'B' of 'C' — ingevuld in seed, admin kan aanpassen
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz antwoorden tabel
CREATE TABLE IF NOT EXISTS quiz_answers (
  id               SERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES users(id),
  question_id      INTEGER NOT NULL REFERENCES quiz_questions(id),
  chosen_option    CHAR(1) NOT NULL,
  points_awarded   INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
