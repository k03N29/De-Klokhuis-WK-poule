-- ============================================================
-- Quiz vragen v2 — klok/bier/cultuur thema
-- Verwijder eerst de oude vragen, dan nieuwe invoegen
-- ============================================================

DELETE FROM quiz_answers;
DELETE FROM quiz_questions;

INSERT INTO quiz_questions (question_date, match_reference, question, option_a, option_b, option_c, correct_option) VALUES

('2026-06-11', 'Mexico vs Zuid-Afrika',
 'Als de wedstrijd Mexico-Zuid-Afrika om 21:00 NL-tijd begint, hoe laat is het dan in Mexico City?',
 '12:00 uur (middag)',
 '14:00 uur',
 '16:00 uur',
 'B'),

('2026-06-12', 'Canada vs Bosnië-Herzegovina',
 'Canada is een reusachtig land met veel tijdzones. Hoeveel tijdzones telt Canada?',
 '4 tijdzones',
 '5 tijdzones',
 '6 tijdzones',
 'C'),

('2026-06-13', 'Qatar vs Zwitserland',
 'Zwitserland is het horlogeland van de wereld. Welk Zwitsers merk staat bekend als het duurste en meest exclusieve horloge ter wereld?',
 'Rolex',
 'Patek Philippe',
 'Omega',
 'B'),

('2026-06-14', 'Nederland vs Japan',
 'De wedstrijd NL-Japan begint om 20:00 NL-tijd. Japanse fans kijken dan om... hoe laat live mee?',
 '01:00 ''s nachts',
 '03:00 ''s nachts',
 '05:00 ''s ochtends',
 'B'),

('2026-06-15', 'België vs Egypte',
 'België staat wereldwijd bekend om zijn bier. Hoeveel verschillende erkende Belgische biersoorten zijn er bij benadering?',
 'Zo''n 300 soorten',
 'Zo''n 750 soorten',
 'Meer dan 1.000 soorten',
 'C'),

('2026-06-16', 'Frankrijk vs Senegal',
 'Cartier is een Frans luxemerk dat ook horloges maakt. In welk jaar maakte Cartier het eerste polshorloge ooit — voor een Braziliaanse luchtvaartpionier?',
 '1898',
 '1904',
 '1912',
 'B'),

('2026-06-17', 'Engeland vs Kroatië',
 'Big Ben is de beroemde klok van Londen. ''Big Ben'' is echter de naam van de klok zelf — hoe heet de toren officieel?',
 'Victoria Tower',
 'Elizabeth Tower',
 'Westminster Tower',
 'B'),

('2026-06-18', 'Oezbekistan vs Colombia',
 'Colombia''s populairste biermerk heet Águila. Wat betekent ''Águila'' in het Spaans?',
 'Adelaar',
 'Bier',
 'Goud',
 'A'),

('2026-06-19', 'Verenigde Staten vs Australië',
 'Foster''s is het bekendste Australische exportbier ter wereld. Maar hoe populair is het bier in Australië zelf?',
 'Het meest gedronken bier Down Under',
 'Nauwelijks populair — Australiërs drinken het zelf bijna niet',
 'Alleen verkrijgbaar in toeristische gebieden',
 'B'),

('2026-06-20', 'Nederland vs Zweden',
 'Zweden heeft een staatsmonopolie op alcohol: de Systembolaget. Geldt dat ook voor gewoon pils?',
 'Ja, ook pils mag je alleen daar kopen',
 'Nee, bier tot 3,5% mag gewoon in de supermarkt',
 'Nee, Zweden heeft het monopolie afgeschaft',
 'B'),

('2026-06-21', 'Spanje vs Saoedi-Arabië',
 'De wedstrijd Spanje-Saoedi-Arabië begint om 23:00 NL-tijd. Hoe laat is het dan in Riyadh?',
 '22:00 uur',
 '00:00 uur (middernacht)',
 '02:00 uur',
 'B'),

('2026-06-22', 'Argentinië vs Oostenrijk',
 'Argentijnen staan bekend om hun late avondcultuur. Hoe laat eet een gemiddelde Argentijn het avondeten?',
 'Om 19:00 uur, net als Nederlanders',
 'Om 21:00-22:00 uur',
 'Pas om 23:00 uur of later',
 'C'),

('2026-06-23', 'Jordanië vs Algerije',
 'Algerije heeft een biermerk dat ''Tango'' heet. Maar in welk Europees land is ''Tango'' juist bekend als een populaire frisdrank?',
 'Nederland',
 'Engeland',
 'Duitsland',
 'B'),

('2026-06-25', 'Tunesië vs Nederland',
 'Heineken heeft zijn hoofdkantoor in Amsterdam. In welk jaar werd Heineken opgericht door Gerard Adriaan Heineken?',
 '1864',
 '1873',
 '1886',
 'B'),

('2026-06-26', 'Noorwegen vs Frankrijk',
 'Als wij de WK-wedstrijden kijken in juni, hoe laat wordt het dan donker in Noord-Noorwegen?',
 'Om 23:00 uur',
 'Het wordt helemaal niet donker — middernachtzon!',
 'Om 01:00 ''s nachts',
 'B'),

('2026-06-27', 'Uruguay vs Spanje',
 'Uruguay''s nationale drank is geen bier maar iets heel anders. Wat drinken Uruguayanen het liefst?',
 'Pisco',
 'Mate (kruidenthee uit een kalebas)',
 'Cachaça',
 'B'),

('2026-06-28', 'Colombia vs Portugal',
 'Portugal en Spanje delen het Iberisch schiereiland maar hebben verschillende tijdzones. Hoeveel uur loopt Portugal achter op Spanje?',
 'Geen verschil, zelfde tijdzone',
 '1 uur — Portugal loopt achter',
 '2 uur verschil',
 'B');
