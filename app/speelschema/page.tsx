'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ScheduledMatch, Country } from '@/lib/types'

// Vlag emojis voor alle teams in de poule
const FLAG: Record<string, string> = {
  'Mexico': '🇲🇽',
  'Zuid-Afrika': '🇿🇦',
  'Canada': '🇨🇦',
  'Bosnië-Herzegovina': '🇧🇦',
  'Qatar': '🇶🇦',
  'Zwitserland': '🇨🇭',
  'Duitsland': '🇩🇪',
  'Curaçao': '🇨🇼',
  'Nederland': '🇳🇱',
  'Japan': '🇯🇵',
  'België': '🇧🇪',
  'Egypte': '🇪🇬',
  'Frankrijk': '🇫🇷',
  'Senegal': '🇸🇳',
  'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Kroatië': '🇭🇷',
  'Oezbekistan': '🇺🇿',
  'Colombia': '🇨🇴',
  'Verenigde Staten': '🇺🇸',
  'Australië': '🇦🇺',
  'Zweden': '🇸🇪',
  'Brazilië': '🇧🇷',
  'Haïti': '🇭🇹',
  'Spanje': '🇪🇸',
  'Saoedi-Arabië': '🇸🇦',
  'Argentinië': '🇦🇷',
  'Oostenrijk': '🇦🇹',
  'Congo': '🇨🇩',
  'Jordanië': '🇯🇴',
  'Algerije': '🇩🇿',
  'Ivoorkust': '🇨🇮',
  'Tunesië': '🇹🇳',
  'Noorwegen': '🇳🇴',
  'Uruguay': '🇺🇾',
  'Portugal': '🇵🇹',
  'Marokko': '🇲🇦',
  'Panama': '🇵🇦',
  'Zuid-Korea': '🇰🇷',
  'Irak': '🇮🇶',
}

function getNLTime(utcDateStr: string): string {
  return new Date(utcDateStr).toLocaleTimeString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getNLDateKey(utcDateStr: string): string {
  return new Date(utcDateStr).toLocaleDateString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function getNLHour(utcDateStr: string): number {
  return parseInt(new Date(utcDateStr).toLocaleTimeString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
  }))
}

export default function SpeelschemaPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<ScheduledMatch[]>([])
  const [myCountryNames, setMyCountryNames] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const saved = localStorage.getItem('klok_user')
    if (!saved) { router.push('/'); return }
    const user = JSON.parse(saved)

    const [matchesRes, countriesRes] = await Promise.all([
      supabase.from('scheduled_matches').select('*').order('match_date', { ascending: true }),
      supabase.from('countries').select('*').eq('owner_id', user.id),
    ])

    if (matchesRes.data) setMatches(matchesRes.data)
    if (countriesRes.data) {
      setMyCountryNames(new Set((countriesRes.data as Country[]).map(c => c.name)))
    }
    setLoading(false)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  // Groepeer wedstrijden per NL datum
  const grouped: Record<string, ScheduledMatch[]> = {}
  for (const m of matches) {
    if (!m.match_date) continue
    const key = getNLDateKey(m.match_date)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }

  const nlMatchCount = matches.filter(m => m.is_nl_match).length
  const myMatchCount = matches.filter(m =>
    m.team1 && m.team2 &&
    (myCountryNames.has(m.team1) || myCountryNames.has(m.team2))
  ).length

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#001a0d' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}>
        <button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5 text-yellow-400" />
        </button>
        <div className="flex-1">
          <div className="text-yellow-400 font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
            📅 SPEELSCHEMA
          </div>
          <div className="text-green-400 text-xs">21 poulewedstrijden · tijden in NL (CEST)</div>
        </div>
        <Clock className="w-5 h-5 text-green-500" />
      </div>

      {/* Legenda */}
      <div className="px-4 pt-4 pb-2 flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-lg font-bold" style={{ backgroundColor: '#003366', color: '#60a5fa', border: '1px solid #1d4ed8' }}>
          🇳🇱 NL-wedstrijd
        </span>
        {myCountryNames.size > 0 && (
          <span className="px-2 py-1 rounded-lg font-bold" style={{ backgroundColor: '#3d2200', color: '#D4AF37', border: '1px solid #D4AF37' }}>
            ⭐ Jouw land speelt
          </span>
        )}
        <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: '#1a0a00', color: '#9ca3af', border: '1px solid #374151' }}>
          🌙 Na middernacht NL
        </span>
      </div>

      {loading && (
        <div className="text-center py-12 text-green-600">laden...</div>
      )}

      <div className="px-4 space-y-5 pt-2">
        {Object.entries(grouped).map(([dateLabel, dayMatches]) => (
          <div key={dateLabel}>
            {/* Datum header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1" style={{ backgroundColor: '#004d2e' }} />
              <span className="text-green-400 font-bold text-xs uppercase tracking-wide px-2">
                {dateLabel}
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: '#004d2e' }} />
            </div>

            {/* Wedstrijden van deze dag */}
            <div className="space-y-2">
              {dayMatches.map(match => {
                const isNL = match.is_nl_match
                const isMine = myCountryNames.has(match.team1) || myCountryNames.has(match.team2)
                const hour = match.match_date ? getNLHour(match.match_date) : 12
                const isLate = hour >= 0 && hour < 6
                const isFinished = match.status === 'finished'
                const isLive = match.status === 'live'

                let borderColor = '#003322'
                let bgColor = '#002211'
                if (isNL) { bgColor = '#001a3d'; borderColor = '#2563eb' }
                if (isMine) { bgColor = '#2a1500'; borderColor = '#D4AF37' }
                if (isNL && isMine) { bgColor = '#1a0a2e'; borderColor = '#D4AF37' }

                return (
                  <div key={match.id} className="rounded-2xl p-3"
                    style={{ backgroundColor: bgColor, border: `2px solid ${borderColor}` }}>
                    <div className="flex items-center justify-between gap-2">

                      {/* Team 1 */}
                      <div className="flex-1 text-right">
                        <div className="text-xl">{FLAG[match.team1] ?? '🏳️'}</div>
                        <div className="text-white text-xs font-bold leading-tight mt-0.5">
                          {match.team1}
                        </div>
                        {myCountryNames.has(match.team1) && (
                          <div className="text-yellow-400 text-xs">⭐</div>
                        )}
                      </div>

                      {/* Midden: score of tijd */}
                      <div className="flex-shrink-0 text-center px-1" style={{ minWidth: 70 }}>
                        {isFinished && match.score1 !== null && match.score2 !== null ? (
                          <>
                            <div className="text-white font-black text-xl">{match.score1} – {match.score2}</div>
                            <div className="text-green-600 text-xs">eindstand</div>
                          </>
                        ) : isLive ? (
                          <>
                            <div className="text-red-400 font-black text-sm animate-pulse">🔴 LIVE</div>
                          </>
                        ) : (
                          <>
                            <div className="font-black text-base" style={{ color: isNL ? '#60a5fa' : isMine ? '#D4AF37' : '#D4AF37' }}>
                              {match.match_date ? getNLTime(match.match_date) : '??:??'}
                            </div>
                            {isLate && <div className="text-gray-500 text-xs">🌙</div>}
                          </>
                        )}
                        {isNL && (
                          <div className="text-blue-400 text-xs font-bold mt-0.5">🇳🇱</div>
                        )}
                      </div>

                      {/* Team 2 */}
                      <div className="flex-1 text-left">
                        <div className="text-xl">{FLAG[match.team2] ?? '🏳️'}</div>
                        <div className="text-white text-xs font-bold leading-tight mt-0.5">
                          {match.team2}
                        </div>
                        {myCountryNames.has(match.team2) && (
                          <div className="text-yellow-400 text-xs">⭐</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {!loading && matches.length === 0 && (
          <div className="text-center py-12 text-green-600">Geen wedstrijden gevonden</div>
        )}

        {/* Samenvatting */}
        {!loading && matches.length > 0 && (
          <div className="rounded-2xl p-4 text-center space-y-1"
            style={{ backgroundColor: '#003322', border: '1px solid #006b3f' }}>
            <p className="text-green-400 text-sm">
              <span className="font-bold">{matches.length}</span> poulewedstrijden totaal
            </p>
            <p className="text-blue-400 text-sm">
              <span className="font-bold">{nlMatchCount}</span> × Oranje 🇳🇱
            </p>
            {myCountryNames.size > 0 && (
              <p className="text-yellow-400 text-sm">
                <span className="font-bold">{myMatchCount}</span> × jouw landen ⭐
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
