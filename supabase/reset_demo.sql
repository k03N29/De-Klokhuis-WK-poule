-- ============================================================
-- RESET SCRIPT — alles naar nul voor de grote onthulling
-- + demo quizvraag voor vandaag
-- Run dit in de Supabase SQL Editor
-- ============================================================

-- 1. Punten resetten
UPDATE users SET total_points = 0, beers_drunk = 0, adts_drunk = 0;

-- 2. Alle events en voorspellingen leegmaken
DELETE FROM point_events;
DELETE FROM scheduled_predictions;
DELETE FROM quiz_answers;
DELETE FROM wk_winner_predictions;

-- 3. Draft resetten (landen los van spelers)
UPDATE countries SET owner_id = NULL;

-- 4. Global state resetten
UPDATE global_state SET
  draft_completed    = false,
  wout_status        = 'idle',
  nl_tegenpunt_alert = false,
  adt_uitdeel_active = false,
  adt_uitdeel_by_user_id = null,
  ad_wedstrijd_active    = false,
  ad_wedstrijd_winner_id = null,
  wk_winner              = null
WHERE id = 1;

-- 5. Demo quizvraag voor vandaag (Amerika thema)
--    Verwijder eerst als die er al is, dan opnieuw invoegen
DELETE FROM quiz_questions WHERE question_date = CURRENT_DATE;

INSERT INTO quiz_questions (question_date, match_reference, question, option_a, option_b, option_c, correct_option)
VALUES (
  CURRENT_DATE,
  '🎉 DEMOVRAAG — Amerika',
  '🇺🇸 DEMO — Echte vragen komen later! Amerika is gastland van WK 2026. Maar wat betekent het ''o'' in het Engelse ''o''clock''?',
  'Afkorting van ''on'' — on the clock',
  'Afkorting van ''of the clock''',
  'Verwijzing naar de ronde wijzerplaat',
  'B'
);
