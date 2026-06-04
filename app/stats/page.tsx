'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User, PointEvent } from '@/lib/types'

interface SpelerStat {
  user: User
  klokjes: number
  adts: number
  voorspel: number   // punten uit 🎯 + ✅
  exact: number      // aantal exacte voorspellingen
  quiz: number       // quizpunten
  voetbal: number    // punten uit ⚽ (landen + scorers)
}

export default function StatsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<PointEvent[]>([])

  const fetchData = useCallback(async () => {
    const [uRes, eRes] = await Promise.all([
      supabase.from('users').select('*').order('total_points', { ascending: false }),
      supabase.from('point_events').select('*'),
    ])
    if (uRes.data) setUsers(uRes.data)
    if (eRes.data) setEvents(eRes.data)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  // ── Bereken per speler ──
  const stats: SpelerStat[] = users.map(user => {
    const mine = events.filter(e => e.user_id === user.id)
    const sumWhere = (pred: (r: string) => boolean) =>
      mine.filter(e => pred(e.reason)).reduce((s, e) => s + e.points, 0)
    const countWhere = (pred: (r: string) => boolean) =>
      mine.filter(e => pred(e.reason)).length
    return {
      user,
      klokjes: user.beers_drunk || 0,
      adts: user.adts_drunk || 0,
      voorspel: sumWhere(r => r.startsWith('🎯') || r.startsWith('✅')),
      exact: countWhere(r => r.startsWith('🎯')),
      quiz: sumWhere(r => r.startsWith('🧠')),
      voetbal: sumWhere(r => r.startsWith('⚽')),
    }
  })

  // ── Groepstotalen ──
  const totKlokjes = stats.reduce((s, x) => s + x.klokjes, 0)
  const totAdts = stats.reduce((s, x) => s + x.adts, 0)
  const totVoorspel = stats.reduce((s, x) => s + x.voorspel, 0)
  const totExact = stats.reduce((s, x) => s + x.exact, 0)

  // ── Award-winnaar bepalen ──
  const leider = <K extends keyof SpelerStat>(key: K): SpelerStat | null => {
    if (stats.length === 0) return null
    const best = [...stats].sort((a, b) => (b[key] as number) - (a[key] as number))[0]
    if ((best[key] as number) <= 0) return null
    return best
  }

  const koning = stats.length > 0
    ? (() => { const b = [...stats].sort((a, b) => b.user.total_points - a.user.total_points)[0]; return b.user.total_points > 0 ? b : null })()
    : null

  const awards = [
    { titel: '👑 Koning Klok', sub: 'meeste punten totaal', stat: koning, waarde: (s: SpelerStat) => `${s.user.total_points}p`, kleur: '#D4AF37' },
    { titel: '🍺 Bierkoning(in)', sub: 'meeste klokjes', stat: leider('klokjes'), waarde: (s: SpelerStat) => `${s.klokjes}×`, kleur: '#4ade80' },
    { titel: '💥 WK-ADT Koning(in)', sub: 'meeste adtjes', stat: leider('adts'), waarde: (s: SpelerStat) => `${s.adts}×`, kleur: '#f87171' },
    { titel: '🔮 Het Orakel', sub: 'meeste exacte voorspellingen', stat: leider('exact'), waarde: (s: SpelerStat) => `${s.exact}×`, kleur: '#60a5fa' },
    { titel: '🧠 Quizmaster', sub: 'meeste quizpunten', stat: leider('quiz'), waarde: (s: SpelerStat) => `${s.quiz}p`, kleur: '#a78bfa' },
    { titel: '⚽ Bondscoach', sub: 'meeste voetbalpunten', stat: leider('voetbal'), waarde: (s: SpelerStat) => `${s.voetbal}p`, kleur: '#fb923c' },
  ]

  // ── Klok-momentje: leuk roterend feitje (op basis van de dag) ──
  const liters = (totKlokjes * 0.25 + totAdts * 0.33).toFixed(1)
  const momentjes = [
    `Met z'n allen al 🍺 ${totKlokjes} klokjes weggewerkt — dat is zo'n ${liters} liter bier!`,
    `💥 ${totAdts} adtjes in totaal. De lever doet overuren.`,
    `🎯 Er zijn al ${totExact} wedstrijden exact goed voorspeld door de groep.`,
    `🔮 Samen ${totVoorspel} punten verdiend met voorspellen.`,
    totKlokjes + totAdts > 0
      ? `🕰️ Gemiddeld ${((totKlokjes + totAdts) / Math.max(users.length, 1)).toFixed(1)} drankjes per speler. Proost!`
      : `🕰️ Het WK kan beginnen — nog geen klokje gedronken. Dat gaat veranderen!`,
  ]
  const dag = new Date().getDate()
  const momentje = momentjes[dag % momentjes.length]

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#001a0d' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}>
        <button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5 text-yellow-400" />
        </button>
        <div>
          <div className="text-yellow-400 font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
            📊 STATS & AWARDS
          </div>
          <div className="text-green-400 text-xs">wie is de echte Klokhuis-kampioen?</div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">

        {/* Klok-momentje */}
        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg, #003322, #006b3f)', border: '2px solid #D4AF37' }}>
          <div className="text-yellow-400 font-black text-xs uppercase tracking-widest mb-1">🕰️ Klok-momentje</div>
          <p className="text-white font-bold text-sm leading-snug">{momentje}</p>
        </div>

        {/* Awards */}
        <div>
          <h2 className="text-yellow-400 font-black text-lg mb-3 flex items-center gap-2"
            style={{ fontFamily: 'Arial Black, Arial' }}>
            <Trophy className="w-5 h-5" /> KLOKHUIS AWARDS
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {awards.map(a => (
              <div key={a.titel} className="rounded-2xl px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: '#004d2e', border: `1px solid ${a.stat ? a.kleur : '#003322'}` }}>
                <div>
                  <div className="font-black text-sm" style={{ color: a.kleur }}>{a.titel}</div>
                  <div className="text-green-600 text-xs">{a.sub}</div>
                </div>
                <div className="text-right">
                  {a.stat ? (
                    <>
                      <div className="text-white font-bold text-sm">{a.stat.user.name}</div>
                      <div className="font-black text-base" style={{ color: a.kleur }}>{a.waarde(a.stat)}</div>
                    </>
                  ) : (
                    <div className="text-green-700 text-xs italic">nog niemand</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volledige statstabel */}
        <div>
          <h2 className="text-yellow-400 font-black text-lg mb-3" style={{ fontFamily: 'Arial Black, Arial' }}>
            📋 ALLE CIJFERS
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #003322' }}>
            <div className="grid grid-cols-6 gap-1 px-2 py-2 text-xs font-black"
              style={{ backgroundColor: '#003322', color: '#D4AF37' }}>
              <span className="col-span-2">Speler</span>
              <span className="text-center">🍺</span>
              <span className="text-center">💥</span>
              <span className="text-center">🎯</span>
              <span className="text-center">Tot</span>
            </div>
            {[...stats].sort((a, b) => b.user.total_points - a.user.total_points).map((s, i) => (
              <div key={s.user.id} className="grid grid-cols-6 gap-1 px-2 py-2.5 text-xs items-center"
                style={{ backgroundColor: i % 2 === 0 ? '#004d2e' : '#003d24' }}>
                <span className="col-span-2 text-white font-bold truncate">{i + 1}. {s.user.name}</span>
                <span className="text-center text-green-300">{s.klokjes}</span>
                <span className="text-center text-red-300">{s.adts}</span>
                <span className="text-center text-blue-300">{s.exact}</span>
                <span className="text-center text-yellow-400 font-black">{s.user.total_points}</span>
              </div>
            ))}
          </div>
          <p className="text-green-700 text-xs text-center mt-2">
            🍺 klokjes · 💥 adtjes · 🎯 exacte voorspellingen · Tot = totaalpunten
          </p>
        </div>

      </div>
    </div>
  )
}
