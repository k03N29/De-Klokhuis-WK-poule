-- ============================================================
-- FIX WEDSTRIJDTIJDEN + DEMO VRAAG VERWIJDEREN
-- Alle tijden gecheckt op officiële bronnen (UTC)
-- CEST = UTC+2 (zomertijd NL)
-- ============================================================

-- 1. Correcte tijden (UTC) voor alle 21 poolwedstrijden
--    Ongewijzigd: Mexico-ZA (20:00), FR-Senegal (20:00), Oezb-Colombia (03:00), Uruguay-Spanje (01:00)

UPDATE scheduled_matches SET match_date = '2026-06-12 19:00:00+00'
  WHERE team1 = 'Canada' AND team2 = 'Bosnië-Herzegovina';
-- Toronto (EDT=UTC-4), 15:00 EDT = 19:00 UTC = 21:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-13 19:00:00+00'
  WHERE team1 = 'Qatar' AND team2 = 'Zwitserland';
-- Santa Clara (PDT=UTC-7), 12:00 PDT = 19:00 UTC = 21:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-14 17:00:00+00'
  WHERE team1 = 'Duitsland' AND team2 = 'Curaçao';
-- Houston (CDT=UTC-5), 12:00 CDT = 17:00 UTC = 19:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-14 20:00:00+00'
  WHERE team1 = 'Nederland' AND team2 = 'Japan';
-- Arlington TX (CDT=UTC-5), 15:00 CDT = 20:00 UTC = 22:00 CEST (NL)

UPDATE scheduled_matches SET match_date = '2026-06-15 19:00:00+00'
  WHERE team1 = 'België' AND team2 = 'Egypte';
-- Seattle (PDT=UTC-7), 12:00 PDT = 19:00 UTC = 21:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-17 20:00:00+00'
  WHERE team1 = 'Engeland' AND team2 = 'Kroatië';
-- Arlington TX (CDT=UTC-5), 15:00 CDT = 20:00 UTC = 22:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-19 19:00:00+00'
  WHERE team1 = 'Verenigde Staten' AND team2 = 'Australië';
-- Seattle (PDT=UTC-7), 12:00 PDT = 19:00 UTC = 21:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-20 01:00:00+00'
  WHERE team1 = 'Brazilië' AND team2 = 'Haïti';
-- Philadelphia (EDT=UTC-4), 21:00 EDT 19 jun = 01:00 UTC 20 jun = 03:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-20 17:00:00+00'
  WHERE team1 = 'Nederland' AND team2 = 'Zweden';
-- Houston (CDT=UTC-5), 12:00 CDT = 17:00 UTC = 19:00 CEST (NL)

UPDATE scheduled_matches SET match_date = '2026-06-21 16:00:00+00'
  WHERE team1 = 'Spanje' AND team2 = 'Saoedi-Arabië';
-- Atlanta (EDT=UTC-4), 12:00 EDT = 16:00 UTC = 18:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-22 17:00:00+00'
  WHERE team1 = 'Argentinië' AND team2 = 'Oostenrijk';
-- Arlington TX (CDT=UTC-5), 12:00 CDT = 17:00 UTC = 19:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-23 03:00:00+00'
  WHERE team1 = 'Jordanië' AND team2 = 'Algerije';
-- Santa Clara (PDT=UTC-7), 20:00 PDT 22 jun = 03:00 UTC 23 jun = 05:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-24 03:00:00+00', round_name = 'Groepsfase Dag 14'
  WHERE team1 = 'Colombia' AND team2 = 'Congo';
-- Zapopan/Guadalajara (CDT=UTC-5), 22:00 CDT 23 jun = 03:00 UTC 24 jun = 05:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-25 20:00:00+00'
  WHERE team1 = 'Curaçao' AND team2 = 'Ivoorkust';
-- Philadelphia (EDT=UTC-4), 16:00 EDT = 20:00 UTC = 22:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-25 23:00:00+00'
  WHERE team1 = 'Tunesië' AND team2 = 'Nederland';
-- Kansas City (CDT=UTC-5), 18:00 CDT = 23:00 UTC = 01:00 CEST (26 jun, NL)

UPDATE scheduled_matches SET match_date = '2026-06-26 19:00:00+00'
  WHERE team1 = 'Noorwegen' AND team2 = 'Frankrijk';
-- Foxborough MA (EDT=UTC-4), 15:00 EDT = 19:00 UTC = 21:00 CEST

UPDATE scheduled_matches SET match_date = '2026-06-27 23:30:00+00', round_name = 'Groepsfase Dag 17'
  WHERE team1 = 'Colombia' AND team2 = 'Portugal';
-- Miami (EDT=UTC-4), 19:30 EDT = 23:30 UTC = 01:30 CEST (28 jun)

-- 2. Demo quizvraag van 7 mei 2026 verwijderen
DELETE FROM quiz_questions WHERE question_date = '2026-05-07';

-- 3. Supabase Storage bucket 'avatars' aanmaken (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies (upload/lezen/updaten zonder auth)
DROP POLICY IF EXISTS "avatars_public_upload" ON storage.objects;
CREATE POLICY "avatars_public_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_public_update" ON storage.objects;
CREATE POLICY "avatars_public_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');
