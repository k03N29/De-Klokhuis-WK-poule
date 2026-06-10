-- ============================================================
-- BACKUP van alle voorspellingen — draai per blok en klik "Download CSV"
-- Zo heb je alles veilig op je eigen computer, los van de app.
-- ============================================================

-- 1) STAND-VOORSPELLINGEN (gewone wedstrijden + NL)
SELECT u.name AS speler, m.team1, m.team2, m.round_name,
       p.predicted_score1 AS voorspeld_thuis,
       p.predicted_score2 AS voorspeld_uit,
       p.points_awarded AS punten
FROM scheduled_predictions p
JOIN users u ON u.id = p.user_id
JOIN scheduled_matches m ON m.id = p.match_id
ORDER BY u.name, m.match_date;

-- 2) NEDERLAND DOELPUNTENMAKERS
SELECT u.name AS speler, m.team1, m.team2,
       sp.scorer1_name, sp.scorer1_position,
       sp.scorer2_name, sp.scorer2_position,
       sp.points_awarded AS punten
FROM nl_scorer_predictions sp
JOIN users u ON u.id = sp.user_id
JOIN scheduled_matches m ON m.id = sp.match_id
ORDER BY u.name, m.match_date;

-- 3) WK-WINNAAR VOORSPELLINGEN
SELECT u.name AS speler, w.predicted_country AS voorspelde_kampioen, w.points_awarded AS punten
FROM wk_winner_predictions w
JOIN users u ON u.id = w.user_id
ORDER BY u.name;

-- 4) DRAFT — wie heeft welke landen
SELECT u.name AS speler, c.name AS land, c.flag_emoji
FROM countries c
JOIN users u ON u.id = c.owner_id
WHERE c.owner_id IS NOT NULL
ORDER BY u.name, c.name;

-- 5) HUIDIGE STAND (punten per speler)
SELECT name AS speler, total_points AS punten, beers_drunk AS klokjes, adts_drunk AS adtjes
FROM users
ORDER BY total_points DESC;
