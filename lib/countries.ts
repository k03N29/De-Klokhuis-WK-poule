export const WK_COUNTRIES = [
  // Hosts CONCACAF
  { name: 'Amerika',        flag: '🇺🇸' },
  { name: 'Mexico',         flag: '🇲🇽' },
  { name: 'Canada',         flag: '🇨🇦' },
  // UEFA (16)
  { name: 'Duitsland',      flag: '🇩🇪' },
  { name: 'Spanje',         flag: '🇪🇸' },
  { name: 'Frankrijk',      flag: '🇫🇷' },
  { name: 'Engeland',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Portugal',       flag: '🇵🇹' },
  { name: 'Nederland',      flag: '🇳🇱' },
  { name: 'België',         flag: '🇧🇪' },
  { name: 'Kroatië',        flag: '🇭🇷' },
  { name: 'Zwitserland',    flag: '🇨🇭' },
  { name: 'Denemarken',     flag: '🇩🇰' },
  { name: 'Polen',          flag: '🇵🇱' },
  { name: 'Oostenrijk',     flag: '🇦🇹' },
  { name: 'Servië',         flag: '🇷🇸' },
  { name: 'Hongarije',      flag: '🇭🇺' },
  { name: 'Turkije',        flag: '🇹🇷' },
  { name: 'Oekraïne',       flag: '🇺🇦' },
  // CONMEBOL (6)
  { name: 'Brazilië',       flag: '🇧🇷' },
  { name: 'Argentinië',     flag: '🇦🇷' },
  { name: 'Uruguay',        flag: '🇺🇾' },
  { name: 'Colombia',       flag: '🇨🇴' },
  { name: 'Ecuador',        flag: '🇪🇨' },
  { name: 'Chili',          flag: '🇨🇱' },
  // CONCACAF extra (3)
  { name: 'Costa Rica',     flag: '🇨🇷' },
  { name: 'Panama',         flag: '🇵🇦' },
  { name: 'Honduras',       flag: '🇭🇳' },
  // CAF (9)
  { name: 'Marokko',        flag: '🇲🇦' },
  { name: 'Senegal',        flag: '🇸🇳' },
  { name: 'Nigeria',        flag: '🇳🇬' },
  { name: 'Kameroen',       flag: '🇨🇲' },
  { name: 'Egypte',         flag: '🇪🇬' },
  { name: 'Algerije',       flag: '🇩🇿' },
  { name: 'Zuid-Afrika',    flag: '🇿🇦' },
  { name: 'Ghana',          flag: '🇬🇭' },
  { name: 'Ivoorkust',      flag: '🇨🇮' },
  // AFC (8)
  { name: 'Japan',          flag: '🇯🇵' },
  { name: 'Zuid-Korea',     flag: '🇰🇷' },
  { name: 'Iran',           flag: '🇮🇷' },
  { name: 'Saoedi-Arabië',  flag: '🇸🇦' },
  { name: 'Australië',      flag: '🇦🇺' },
  { name: 'Qatar',          flag: '🇶🇦' },
  { name: 'Irak',           flag: '🇮🇶' },
  { name: 'Jordanië',       flag: '🇯🇴' },
  // OFC (1)
  { name: 'Nieuw-Zeeland',  flag: '🇳🇿' },
  // Playoffs (2)
  { name: 'Venezuela',      flag: '🇻🇪' },
  { name: 'Slovenië',       flag: '🇸🇮' },
]

export const PLAYERS = [
  'Grote Koen',
  'Cleine Coen',
  'Eva',
  'Tess',
  'Jaïro',
  'Elena',
  'Kadia',
]

export const LANDS_PER_SPELER = 3
export const TOTAL_PICKS = PLAYERS.length * LANDS_PER_SPELER // 21

// Ronde 1: elke speler krijgt een van deze top 7 kanshebbers (bookmakers WK 2026)
export const TOP_KANSHEBBERS = [
  'Brazilië',
  'Frankrijk',
  'Engeland',
  'Spanje',
  'Argentinië',
  'Duitsland',
  'Portugal',
]

export const CLUB_BONUS_CLUBS = ['Feyenoord', 'PSV', 'FC Groningen']

// Flag lookup for all teams in scheduled matches (including non-WK-pool teams)
export const FLAG_MAP: Record<string, string> = {
  ...Object.fromEntries(WK_COUNTRIES.map(c => [c.name, c.flag])),
  'Amerika': '🇺🇸',
  'Verenigde Staten': '🇺🇸',
  'Bosnië-Herzegovina': '🇧🇦',
  'Curaçao': '🇨🇼',
  'Oezbekistan': '🇺🇿',
  'Zweden': '🇸🇪',
  'Haïti': '🇭🇹',
  'Congo': '🇨🇩',
  'Tunesië': '🇹🇳',
  'Noorwegen': '🇳🇴',
}

export const getFlag = (team: string): string => FLAG_MAP[team] ?? '🏳️'

export type NlPositie = 'aanvaller' | 'middenvelder' | 'verdediger'

export const NL_SPELERS: { name: string; position: NlPositie }[] = [
  // Verdedigers
  { name: 'Virgil van Dijk',   position: 'verdediger' },
  { name: 'Nathan Aké',        position: 'verdediger' },
  { name: 'Matthijs de Ligt',  position: 'verdediger' },
  { name: 'Denzel Dumfries',   position: 'verdediger' },
  { name: 'Jurriën Timber',    position: 'verdediger' },
  { name: 'Stefan de Vrij',    position: 'verdediger' },
  // Middenvelders
  { name: 'Frenkie de Jong',   position: 'middenvelder' },
  { name: 'Tijjani Reijnders', position: 'middenvelder' },
  { name: 'Teun Koopmeiners',  position: 'middenvelder' },
  { name: 'Xavi Simons',       position: 'middenvelder' },
  { name: 'Ryan Gravenberch',  position: 'middenvelder' },
  { name: 'Joey Veerman',      position: 'middenvelder' },
  // Aanvallers
  { name: 'Memphis Depay',     position: 'aanvaller' },
  { name: 'Cody Gakpo',        position: 'aanvaller' },
  { name: 'Donyell Malen',     position: 'aanvaller' },
  { name: 'Brian Brobbey',     position: 'aanvaller' },
  { name: 'Wout Weghorst',     position: 'aanvaller' },
  { name: 'Steven Bergwijn',   position: 'aanvaller' },
]

export const NL_POSITIE_PUNTEN: Record<NlPositie, number> = {
  verdediger: 5,
  middenvelder: 3,
  aanvaller: 1,
}

export const NL_POSITIE_EMOJI: Record<NlPositie, string> = {
  verdediger: '🛡️',
  middenvelder: '⚙️',
  aanvaller: '⚡',
}
