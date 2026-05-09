// ============================================================
// FIFA WK 2026 — Volledige speellijst, alle 72 groepswedstrijden
// Tijden in UTC — de app toont ze in NL-tijd (CEST = UTC+2)
// Bronnen: FIFA.com, Sky Sports BST-tijden (BST=UTC+1→UTC), NBC Sports ET-tijden (EDT=UTC+4)
// Mexico-stadions: UTC-6 (Mexico heeft zomertijd afgeschaft in 2022)
// ============================================================

export interface WkWedstrijd {
  id: string
  groep: string
  utcDatum: string   // ISO 8601, bijv. "2026-06-11T19:00:00Z"
  thuis: string
  uit: string
  stadion: string
  stad: string
  isNL?: boolean
}

export const WK2026: WkWedstrijd[] = [
  // ── GROEP A ── Mexico · Zuid-Korea · Tsjechië · Zuid-Afrika
  { id:'A1', groep:'A', utcDatum:'2026-06-11T19:00:00Z', thuis:'Mexico',        uit:'Zuid-Afrika',       stadion:'Estadio Azteca',             stad:'Mexico-Stad' },
  { id:'A2', groep:'A', utcDatum:'2026-06-12T02:00:00Z', thuis:'Zuid-Korea',    uit:'Tsjechië',          stadion:'Estadio Akron',               stad:'Zapopan' },
  { id:'A3', groep:'A', utcDatum:'2026-06-18T16:00:00Z', thuis:'Tsjechië',      uit:'Zuid-Afrika',       stadion:'Mercedes-Benz Stadium',       stad:'Atlanta' },
  { id:'A4', groep:'A', utcDatum:'2026-06-19T01:00:00Z', thuis:'Mexico',        uit:'Zuid-Korea',        stadion:'Estadio Akron',               stad:'Zapopan' },
  { id:'A5', groep:'A', utcDatum:'2026-06-25T01:00:00Z', thuis:'Tsjechië',      uit:'Mexico',            stadion:'Estadio Azteca',              stad:'Mexico-Stad' },
  { id:'A6', groep:'A', utcDatum:'2026-06-25T01:00:00Z', thuis:'Zuid-Afrika',   uit:'Zuid-Korea',        stadion:'Estadio BBVA',                stad:'Monterrey' },

  // ── GROEP B ── Canada · Bosnië-Herzegovina · Qatar · Zwitserland
  { id:'B1', groep:'B', utcDatum:'2026-06-12T19:00:00Z', thuis:'Canada',              uit:'Bosnië-Herzegovina', stadion:'BMO Field',              stad:'Toronto' },
  { id:'B2', groep:'B', utcDatum:'2026-06-13T19:00:00Z', thuis:'Qatar',               uit:'Zwitserland',        stadion:"Levi's Stadium",         stad:'Santa Clara' },
  { id:'B3', groep:'B', utcDatum:'2026-06-18T19:00:00Z', thuis:'Zwitserland',         uit:'Bosnië-Herzegovina', stadion:'SoFi Stadium',           stad:'Los Angeles' },
  { id:'B4', groep:'B', utcDatum:'2026-06-18T22:00:00Z', thuis:'Canada',              uit:'Qatar',              stadion:'BC Place',               stad:'Vancouver' },
  { id:'B5', groep:'B', utcDatum:'2026-06-24T19:00:00Z', thuis:'Zwitserland',         uit:'Canada',             stadion:'BC Place',               stad:'Vancouver' },
  { id:'B6', groep:'B', utcDatum:'2026-06-24T19:00:00Z', thuis:'Bosnië-Herzegovina',  uit:'Qatar',              stadion:'Lumen Field',            stad:'Seattle' },

  // ── GROEP C ── Brazilië · Marokko · Haïti · Schotland
  { id:'C1', groep:'C', utcDatum:'2026-06-13T22:00:00Z', thuis:'Brazilië',   uit:'Marokko',   stadion:'MetLife Stadium',              stad:'East Rutherford' },
  { id:'C2', groep:'C', utcDatum:'2026-06-14T01:00:00Z', thuis:'Haïti',      uit:'Schotland', stadion:'Gillette Stadium',             stad:'Foxborough' },
  { id:'C3', groep:'C', utcDatum:'2026-06-19T22:00:00Z', thuis:'Schotland',  uit:'Marokko',   stadion:'Gillette Stadium',             stad:'Foxborough' },
  { id:'C4', groep:'C', utcDatum:'2026-06-20T00:30:00Z', thuis:'Brazilië',   uit:'Haïti',     stadion:'Lincoln Financial Field',      stad:'Philadelphia' },
  { id:'C5', groep:'C', utcDatum:'2026-06-24T22:00:00Z', thuis:'Schotland',  uit:'Brazilië',  stadion:'Hard Rock Stadium',            stad:'Miami Gardens' },
  { id:'C6', groep:'C', utcDatum:'2026-06-24T22:00:00Z', thuis:'Marokko',    uit:'Haïti',     stadion:'Mercedes-Benz Stadium',        stad:'Atlanta' },

  // ── GROEP D ── Verenigde Staten · Paraguay · Australië · Turkije
  { id:'D1', groep:'D', utcDatum:'2026-06-13T01:00:00Z', thuis:'Verenigde Staten', uit:'Paraguay',  stadion:'SoFi Stadium',        stad:'Los Angeles' },
  { id:'D2', groep:'D', utcDatum:'2026-06-14T04:00:00Z', thuis:'Australië',        uit:'Turkije',   stadion:'BC Place',            stad:'Vancouver' },
  { id:'D3', groep:'D', utcDatum:'2026-06-19T19:00:00Z', thuis:'Verenigde Staten', uit:'Australië', stadion:'Lumen Field',         stad:'Seattle' },
  { id:'D4', groep:'D', utcDatum:'2026-06-20T03:00:00Z', thuis:'Turkije',          uit:'Paraguay',  stadion:"Levi's Stadium",      stad:'Santa Clara' },
  { id:'D5', groep:'D', utcDatum:'2026-06-26T02:00:00Z', thuis:'Turkije',          uit:'Verenigde Staten', stadion:'SoFi Stadium', stad:'Los Angeles' },
  { id:'D6', groep:'D', utcDatum:'2026-06-26T02:00:00Z', thuis:'Paraguay',         uit:'Australië', stadion:"Levi's Stadium",      stad:'Santa Clara' },

  // ── GROEP E ── Duitsland · Curaçao · Ivoorkust · Ecuador
  { id:'E1', groep:'E', utcDatum:'2026-06-14T17:00:00Z', thuis:'Duitsland',  uit:'Curaçao',   stadion:'NRG Stadium',                 stad:'Houston' },
  { id:'E2', groep:'E', utcDatum:'2026-06-14T23:00:00Z', thuis:'Ivoorkust',  uit:'Ecuador',   stadion:'Lincoln Financial Field',     stad:'Philadelphia' },
  { id:'E3', groep:'E', utcDatum:'2026-06-20T20:00:00Z', thuis:'Duitsland',  uit:'Ivoorkust', stadion:'BMO Field',                   stad:'Toronto' },
  { id:'E4', groep:'E', utcDatum:'2026-06-21T00:00:00Z', thuis:'Ecuador',    uit:'Curaçao',   stadion:'Arrowhead Stadium',           stad:'Kansas City' },
  { id:'E5', groep:'E', utcDatum:'2026-06-25T20:00:00Z', thuis:'Curaçao',    uit:'Ivoorkust', stadion:'Lincoln Financial Field',     stad:'Philadelphia' },
  { id:'E6', groep:'E', utcDatum:'2026-06-25T20:00:00Z', thuis:'Ecuador',    uit:'Duitsland', stadion:'MetLife Stadium',             stad:'East Rutherford' },

  // ── GROEP F ── Nederland · Japan · Zweden · Tunesië  ← NL-groep
  { id:'F1', groep:'F', utcDatum:'2026-06-14T20:00:00Z', thuis:'Nederland', uit:'Japan',    stadion:"AT&T Stadium",      stad:'Arlington TX', isNL:true },
  { id:'F2', groep:'F', utcDatum:'2026-06-15T02:00:00Z', thuis:'Zweden',    uit:'Tunesië',  stadion:'Estadio BBVA',      stad:'Monterrey' },
  { id:'F3', groep:'F', utcDatum:'2026-06-20T17:00:00Z', thuis:'Nederland', uit:'Zweden',   stadion:'NRG Stadium',       stad:'Houston',      isNL:true },
  { id:'F4', groep:'F', utcDatum:'2026-06-21T04:00:00Z', thuis:'Tunesië',   uit:'Japan',    stadion:'Estadio BBVA',      stad:'Monterrey' },
  { id:'F5', groep:'F', utcDatum:'2026-06-25T23:00:00Z', thuis:'Japan',     uit:'Zweden',   stadion:"AT&T Stadium",      stad:'Arlington TX' },
  { id:'F6', groep:'F', utcDatum:'2026-06-25T23:00:00Z', thuis:'Tunesië',   uit:'Nederland',stadion:'Arrowhead Stadium', stad:'Kansas City',  isNL:true },

  // ── GROEP G ── België · Egypte · Iran · Nieuw-Zeeland
  { id:'G1', groep:'G', utcDatum:'2026-06-15T19:00:00Z', thuis:'België',        uit:'Egypte',       stadion:'Lumen Field',         stad:'Seattle' },
  { id:'G2', groep:'G', utcDatum:'2026-06-16T01:00:00Z', thuis:'Iran',          uit:'Nieuw-Zeeland',stadion:'SoFi Stadium',        stad:'Los Angeles' },
  { id:'G3', groep:'G', utcDatum:'2026-06-21T19:00:00Z', thuis:'België',        uit:'Iran',         stadion:'SoFi Stadium',        stad:'Los Angeles' },
  { id:'G4', groep:'G', utcDatum:'2026-06-22T01:00:00Z', thuis:'Nieuw-Zeeland', uit:'Egypte',       stadion:'BC Place',            stad:'Vancouver' },
  { id:'G5', groep:'G', utcDatum:'2026-06-27T03:00:00Z', thuis:'Egypte',        uit:'Iran',         stadion:'Lumen Field',         stad:'Seattle' },
  { id:'G6', groep:'G', utcDatum:'2026-06-27T03:00:00Z', thuis:'Nieuw-Zeeland', uit:'België',       stadion:'BC Place',            stad:'Vancouver' },

  // ── GROEP H ── Spanje · Kaapverdië · Saoedi-Arabië · Uruguay
  { id:'H1', groep:'H', utcDatum:'2026-06-15T16:00:00Z', thuis:'Spanje',        uit:'Kaapverdië',   stadion:'Mercedes-Benz Stadium',stad:'Atlanta' },
  { id:'H2', groep:'H', utcDatum:'2026-06-15T22:00:00Z', thuis:'Saoedi-Arabië', uit:'Uruguay',      stadion:'Hard Rock Stadium',    stad:'Miami Gardens' },
  { id:'H3', groep:'H', utcDatum:'2026-06-21T16:00:00Z', thuis:'Spanje',        uit:'Saoedi-Arabië',stadion:'Mercedes-Benz Stadium',stad:'Atlanta' },
  { id:'H4', groep:'H', utcDatum:'2026-06-21T22:00:00Z', thuis:'Uruguay',       uit:'Kaapverdië',   stadion:'Hard Rock Stadium',    stad:'Miami Gardens' },
  { id:'H5', groep:'H', utcDatum:'2026-06-27T00:00:00Z', thuis:'Kaapverdië',    uit:'Saoedi-Arabië',stadion:'NRG Stadium',          stad:'Houston' },
  { id:'H6', groep:'H', utcDatum:'2026-06-27T00:00:00Z', thuis:'Uruguay',       uit:'Spanje',       stadion:'Estadio Akron',        stad:'Zapopan' },

  // ── GROEP I ── Frankrijk · Senegal · Noorwegen · Irak
  { id:'I1', groep:'I', utcDatum:'2026-06-16T19:00:00Z', thuis:'Frankrijk', uit:'Senegal',  stadion:'MetLife Stadium',         stad:'East Rutherford' },
  { id:'I2', groep:'I', utcDatum:'2026-06-16T22:00:00Z', thuis:'Irak',      uit:'Noorwegen',stadion:'Gillette Stadium',        stad:'Foxborough' },
  { id:'I3', groep:'I', utcDatum:'2026-06-22T21:00:00Z', thuis:'Frankrijk', uit:'Irak',     stadion:'Lincoln Financial Field', stad:'Philadelphia' },
  { id:'I4', groep:'I', utcDatum:'2026-06-23T00:00:00Z', thuis:'Noorwegen', uit:'Senegal',  stadion:'MetLife Stadium',         stad:'East Rutherford' },
  { id:'I5', groep:'I', utcDatum:'2026-06-26T19:00:00Z', thuis:'Noorwegen', uit:'Frankrijk',stadion:'Gillette Stadium',        stad:'Foxborough' },
  { id:'I6', groep:'I', utcDatum:'2026-06-26T19:00:00Z', thuis:'Senegal',   uit:'Irak',     stadion:'BMO Field',               stad:'Toronto' },

  // ── GROEP J ── Argentinië · Algerije · Oostenrijk · Jordanië
  { id:'J1', groep:'J', utcDatum:'2026-06-17T01:00:00Z', thuis:'Argentinië', uit:'Algerije', stadion:'Arrowhead Stadium',  stad:'Kansas City' },
  { id:'J2', groep:'J', utcDatum:'2026-06-17T04:00:00Z', thuis:'Oostenrijk', uit:'Jordanië', stadion:"Levi's Stadium",     stad:'Santa Clara' },
  { id:'J3', groep:'J', utcDatum:'2026-06-22T17:00:00Z', thuis:'Argentinië', uit:'Oostenrijk',stadion:"AT&T Stadium",      stad:'Arlington TX' },
  { id:'J4', groep:'J', utcDatum:'2026-06-23T03:00:00Z', thuis:'Jordanië',   uit:'Algerije', stadion:"Levi's Stadium",     stad:'Santa Clara' },
  { id:'J5', groep:'J', utcDatum:'2026-06-28T02:00:00Z', thuis:'Algerije',   uit:'Oostenrijk',stadion:'Arrowhead Stadium', stad:'Kansas City' },
  { id:'J6', groep:'J', utcDatum:'2026-06-28T02:00:00Z', thuis:'Jordanië',   uit:'Argentinië',stadion:"AT&T Stadium",      stad:'Arlington TX' },

  // ── GROEP K ── Portugal · Congo · Oezbekistan · Colombia
  { id:'K1', groep:'K', utcDatum:'2026-06-17T17:00:00Z', thuis:'Portugal',    uit:'Congo',      stadion:'NRG Stadium',              stad:'Houston' },
  { id:'K2', groep:'K', utcDatum:'2026-06-18T02:00:00Z', thuis:'Oezbekistan', uit:'Colombia',   stadion:'Estadio Azteca',           stad:'Mexico-Stad' },
  { id:'K3', groep:'K', utcDatum:'2026-06-23T17:00:00Z', thuis:'Portugal',    uit:'Oezbekistan',stadion:'NRG Stadium',              stad:'Houston' },
  { id:'K4', groep:'K', utcDatum:'2026-06-24T02:00:00Z', thuis:'Colombia',    uit:'Congo',      stadion:'Estadio Akron',            stad:'Zapopan' },
  { id:'K5', groep:'K', utcDatum:'2026-06-27T23:30:00Z', thuis:'Colombia',    uit:'Portugal',   stadion:'Hard Rock Stadium',        stad:'Miami Gardens' },
  { id:'K6', groep:'K', utcDatum:'2026-06-27T23:30:00Z', thuis:'Congo',       uit:'Oezbekistan',stadion:'Mercedes-Benz Stadium',    stad:'Atlanta' },

  // ── GROEP L ── Engeland · Kroatië · Ghana · Panama
  { id:'L1', groep:'L', utcDatum:'2026-06-17T20:00:00Z', thuis:'Engeland', uit:'Kroatië', stadion:"AT&T Stadium",              stad:'Arlington TX' },
  { id:'L2', groep:'L', utcDatum:'2026-06-17T23:00:00Z', thuis:'Ghana',    uit:'Panama',  stadion:'BMO Field',                 stad:'Toronto' },
  { id:'L3', groep:'L', utcDatum:'2026-06-23T20:00:00Z', thuis:'Engeland', uit:'Ghana',   stadion:'Gillette Stadium',          stad:'Foxborough' },
  { id:'L4', groep:'L', utcDatum:'2026-06-23T23:00:00Z', thuis:'Panama',   uit:'Kroatië', stadion:'BMO Field',                 stad:'Toronto' },
  { id:'L5', groep:'L', utcDatum:'2026-06-27T21:00:00Z', thuis:'Panama',   uit:'Engeland',stadion:'MetLife Stadium',           stad:'East Rutherford' },
  { id:'L6', groep:'L', utcDatum:'2026-06-27T21:00:00Z', thuis:'Kroatië',  uit:'Ghana',   stadion:'Lincoln Financial Field',   stad:'Philadelphia' },
]

// Vlaggen voor alle 48 WK-landen
export const VLAG: Record<string, string> = {
  'Mexico': '🇲🇽', 'Zuid-Afrika': '🇿🇦', 'Zuid-Korea': '🇰🇷', 'Tsjechië': '🇨🇿',
  'Canada': '🇨🇦', 'Bosnië-Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Zwitserland': '🇨🇭',
  'Brazilië': '🇧🇷', 'Marokko': '🇲🇦', 'Haïti': '🇭🇹', 'Schotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Verenigde Staten': '🇺🇸', 'Paraguay': '🇵🇾', 'Australië': '🇦🇺', 'Turkije': '🇹🇷',
  'Duitsland': '🇩🇪', 'Curaçao': '🇨🇼', 'Ivoorkust': '🇨🇮', 'Ecuador': '🇪🇨',
  'Nederland': '🇳🇱', 'Japan': '🇯🇵', 'Zweden': '🇸🇪', 'Tunesië': '🇹🇳',
  'België': '🇧🇪', 'Egypte': '🇪🇬', 'Iran': '🇮🇷', 'Nieuw-Zeeland': '🇳🇿',
  'Spanje': '🇪🇸', 'Kaapverdië': '🇨🇻', 'Saoedi-Arabië': '🇸🇦', 'Uruguay': '🇺🇾',
  'Frankrijk': '🇫🇷', 'Senegal': '🇸🇳', 'Irak': '🇮🇶', 'Noorwegen': '🇳🇴',
  'Argentinië': '🇦🇷', 'Algerije': '🇩🇿', 'Oostenrijk': '🇦🇹', 'Jordanië': '🇯🇴',
  'Portugal': '🇵🇹', 'Congo': '🇨🇩', 'Oezbekistan': '🇺🇿', 'Colombia': '🇨🇴',
  'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Kroatië': '🇭🇷', 'Ghana': '🇬🇭', 'Panama': '🇵🇦',
}
