-- ============================================================
-- Correctie voorspel-wedstrijdtijden -> gelijk aan officieel speelschema (UTC)
-- Past ALLEEN match_date aan. Voorspellingen blijven intact (zelfde match-id).
-- Veilig om meerdere keren te draaien.
-- ============================================================

UPDATE scheduled_matches SET match_date = '2026-06-11 19:00:00+00' WHERE team1 = 'Mexico'            AND team2 = 'Zuid-Afrika';
UPDATE scheduled_matches SET match_date = '2026-06-12 19:00:00+00' WHERE team1 = 'Canada'            AND team2 = 'Bosnië-Herzegovina';
UPDATE scheduled_matches SET match_date = '2026-06-13 19:00:00+00' WHERE team1 = 'Qatar'             AND team2 = 'Zwitserland';
UPDATE scheduled_matches SET match_date = '2026-06-14 17:00:00+00' WHERE team1 = 'Duitsland'         AND team2 = 'Curaçao';
UPDATE scheduled_matches SET match_date = '2026-06-14 20:00:00+00' WHERE team1 = 'Nederland'         AND team2 = 'Japan';
UPDATE scheduled_matches SET match_date = '2026-06-15 19:00:00+00' WHERE team1 = 'België'            AND team2 = 'Egypte';
UPDATE scheduled_matches SET match_date = '2026-06-16 19:00:00+00' WHERE team1 = 'Frankrijk'         AND team2 = 'Senegal';
UPDATE scheduled_matches SET match_date = '2026-06-17 20:00:00+00' WHERE team1 = 'Engeland'          AND team2 = 'Kroatië';
UPDATE scheduled_matches SET match_date = '2026-06-18 02:00:00+00' WHERE team1 = 'Oezbekistan'       AND team2 = 'Colombia';
UPDATE scheduled_matches SET match_date = '2026-06-19 19:00:00+00' WHERE team1 = 'Verenigde Staten'  AND team2 = 'Australië';
UPDATE scheduled_matches SET match_date = '2026-06-20 17:00:00+00' WHERE team1 = 'Nederland'         AND team2 = 'Zweden';
UPDATE scheduled_matches SET match_date = '2026-06-20 00:30:00+00' WHERE team1 = 'Brazilië'          AND team2 = 'Haïti';
UPDATE scheduled_matches SET match_date = '2026-06-21 16:00:00+00' WHERE team1 = 'Spanje'            AND team2 = 'Saoedi-Arabië';
UPDATE scheduled_matches SET match_date = '2026-06-22 17:00:00+00' WHERE team1 = 'Argentinië'        AND team2 = 'Oostenrijk';
UPDATE scheduled_matches SET match_date = '2026-06-24 02:00:00+00' WHERE team1 = 'Colombia'          AND team2 = 'Congo';
UPDATE scheduled_matches SET match_date = '2026-06-23 03:00:00+00' WHERE team1 = 'Jordanië'          AND team2 = 'Algerije';
UPDATE scheduled_matches SET match_date = '2026-06-25 20:00:00+00' WHERE team1 = 'Curaçao'           AND team2 = 'Ivoorkust';
UPDATE scheduled_matches SET match_date = '2026-06-25 23:00:00+00' WHERE team1 = 'Tunesië'           AND team2 = 'Nederland';
UPDATE scheduled_matches SET match_date = '2026-06-26 19:00:00+00' WHERE team1 = 'Noorwegen'         AND team2 = 'Frankrijk';
UPDATE scheduled_matches SET match_date = '2026-06-27 00:00:00+00' WHERE team1 = 'Uruguay'           AND team2 = 'Spanje';
UPDATE scheduled_matches SET match_date = '2026-06-27 23:30:00+00' WHERE team1 = 'Colombia'          AND team2 = 'Portugal';

-- Controle: bekijk alle tijden na de correctie
SELECT team1, team2,
       to_char(match_date AT TIME ZONE 'Europe/Amsterdam', 'Dy DD-MM HH24:MI') AS nl_tijd,
       is_nl_match
FROM scheduled_matches
ORDER BY match_date;
