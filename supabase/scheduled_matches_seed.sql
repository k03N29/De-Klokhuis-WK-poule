-- ============================================================
-- 21 Voorspelwedstrijden WK 2026
-- Tijden in UTC, gelijk aan het officiele speelschema (lib/wk2026-schema.ts)
-- ============================================================
INSERT INTO scheduled_matches (team1, team2, match_date, is_nl_match, round_name) VALUES
  ('Mexico',          'Zuid-Afrika',          '2026-06-11 19:00:00+00', false, 'Groepsfase Dag 1'),
  ('Canada',          'Bosnië-Herzegovina',   '2026-06-12 19:00:00+00', false, 'Groepsfase Dag 2'),
  ('Qatar',           'Zwitserland',          '2026-06-13 19:00:00+00', false, 'Groepsfase Dag 3'),
  ('Duitsland',       'Curaçao',              '2026-06-14 17:00:00+00', false, 'Groepsfase Dag 4'),
  ('Nederland',       'Japan',                '2026-06-14 20:00:00+00', true,  'Groepsfase Dag 4 🇳🇱'),
  ('België',          'Egypte',               '2026-06-15 19:00:00+00', false, 'Groepsfase Dag 5'),
  ('Frankrijk',       'Senegal',              '2026-06-16 19:00:00+00', false, 'Groepsfase Dag 6'),
  ('Engeland',        'Kroatië',              '2026-06-17 20:00:00+00', false, 'Groepsfase Dag 7'),
  ('Oezbekistan',     'Colombia',             '2026-06-18 02:00:00+00', false, 'Groepsfase Dag 8'),
  ('Verenigde Staten','Australië',            '2026-06-19 19:00:00+00', false, 'Groepsfase Dag 9'),
  ('Nederland',       'Zweden',               '2026-06-20 17:00:00+00', true,  'Groepsfase Dag 10 🇳🇱'),
  ('Brazilië',        'Haïti',                '2026-06-20 00:30:00+00', false, 'Groepsfase Dag 10'),
  ('Spanje',          'Saoedi-Arabië',        '2026-06-21 16:00:00+00', false, 'Groepsfase Dag 11'),
  ('Argentinië',      'Oostenrijk',           '2026-06-22 17:00:00+00', false, 'Groepsfase Dag 12'),
  ('Colombia',        'Congo',                '2026-06-24 02:00:00+00', false, 'Groepsfase Dag 14'),
  ('Jordanië',        'Algerije',             '2026-06-23 03:00:00+00', false, 'Groepsfase Dag 13'),
  ('Curaçao',         'Ivoorkust',            '2026-06-25 20:00:00+00', false, 'Groepsfase Dag 15'),
  ('Tunesië',         'Nederland',            '2026-06-25 23:00:00+00', true,  'Groepsfase Dag 15 🇳🇱'),
  ('Noorwegen',       'Frankrijk',            '2026-06-26 19:00:00+00', false, 'Groepsfase Dag 16'),
  ('Uruguay',         'Spanje',               '2026-06-27 00:00:00+00', false, 'Groepsfase Dag 17'),
  ('Colombia',        'Portugal',             '2026-06-27 23:30:00+00', false, 'Groepsfase Dag 17');
