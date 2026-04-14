'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getFlag } from '@/lib/countries'
import type { ScheduledMatch, ScheduledPrediction, User } from '@/lib/types'

export default function VoorspellingenPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [matches, setMatches] = useState<ScheduledMatch[]>([])
  const [myPredictions, setMyPredictions] = useState<ScheduledPrediction[]>([])
  const [inputs, setInputs] = useState<Record<number, { s1: string; s2: string }>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('klok_user')
    if (!stored) { router.push('/'); return }
    setCurrentUser(JSON.parse(stored))
  }, [router])

  const fetchData = useCallback(async () => {
    if (!currentUser) return
    const [matchesRes, predsRes] = await Promise.all([
      supabase
        .from('scheduled_matches')
        .select('*')
        .eq('is_nl_match', false)
        .order('match_date', { ascending: true }),
      supabase
        .from('scheduled_predictions')
        .select('*')
        .eq('user_id', currentUser.id),
    ])
    if (matchesRes.data) setMatches(matchesRes.data)
    if (predsRes.data) setMyPredictions(predsRes.data)
  }, [currentUser])

  useEffect(() => { fetchData() }, [fetchData])

  const getPred = (matchId: number) => myPredictions.find(p => p.match_id === matchId)
  const getInp = (matchId: number) => inputs[matchId] || { s1: '', s2: '' }

  const setInp = (matchId: number, key: 's1' | 's2', val: string) => {
    if (val !== '' && (isNaN(Number(val)) || Number(val) < 0)) return
    setInputs(prev => ({ ...prev, [matchId]: { ...getInp(matchId), [key]: val } }))
  }

  const submit = async (match: ScheduledMatch) => {
    if (!currentUser || saving !== null) return
    const inp = getInp(match.id)
    const s1 = parseInt(inp.s1)
    const s2 = parseInt(inp.s2)
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) return
    setSaving(match.id)
    const existing = getPred(match.id)
    if (existing) {
      await supabase
        .from('scheduled_predictions')
        .update({ predicted_score1: s1, predicted_score2: s2 })
        .eq('id', existing.id)
    } else {
      await supabase.from('scheduled_predictions').insert({
        user_id: currentUser.id,
        match_id: match.id,
        predicted_score1: s1,
        predicted_score2: s2,
        points_awarded: 0,
        adt_uitgedeeld: false,
      })
    }
    await fetchData()
    setSaving(null)
    setSaved(match.id)
    setTimeout(() => setSaved(null), 2000)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam',
    })
  }

  const getResultBadge = (match: ScheduledMatch, pred: ScheduledPrediction) => {
    if (match.status !== 'finished' || match.score1 === null || match.score2 === null) return null
    if (pred.points_awarded >= 5) return { text: `⚡ EXACT! +${pred.points_awarded}p`, color: '#D4AF37' }
    if (pred.points_awarded === 2) return { text: '✅ Toto goed! +2p', color: '#4ade80' }
    return { text: '❌ Fout — 0p', color: '#f87171' }
  }

  if (!currentUser) return null

  const upcoming = matches.filter(m => m.status === 'upcoming' || m.status === 'live')
  const finished = matches.filter(m => m.status === 'finished')
  const myPoints = myPredictions.reduce((sum, p) => sum + (p.points_awarded || 0), 0)

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: '#001a0d' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}
      >
        <button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5 text-yellow-400" />
        </button>
        <div className="flex-1">
          <div className="text-yellow-400 font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
            🎯 VOORSPELLINGEN
          </div>
          <div className="text-green-400 text-xs">uitslag exact goed=5p &bull; goed=2p &bull; fout=0p</div>
        </div>
        {myPoints > 0 && (
          <div className="text-right">
            <div className="text-yellow-400 font-black text-lg">{myPoints}p</div>
            <div className="text-green-600 text-xs">jouw score</div>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-6">

        {/* Upcoming / Live */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-yellow-400 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Komende wedstrijden
            </h2>
            <div className="space-y-3">
              {upcoming.map(match => {
                const pred = getPred(match.id)
                const inp = getInp(match.id)
                const locked = match.predictions_locked
                const justSaved = saved === match.id

                return (
                  <div
                    key={match.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#004d2e', border: '1px solid #006b3f' }}
                  >
                    {match.status === 'live' && (
                      <div
                        className="px-3 py-1 text-xs font-black text-center animate-pulse"
                        style={{ backgroundColor: '#8B0000', color: '#FFD700' }}
                      >
                        🔴 LIVE
                      </div>
                    )}
                    <div className="px-4 py-3">
                      <div className="text-green-500 text-xs mb-2">{match.round_name}</div>

                      {/* Teams */}
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="text-center flex-1">
                          <div className="text-3xl mb-0.5">{getFlag(match.team1)}</div>
                          <div className="text-white font-bold text-sm">{match.team1}</div>
                        </div>
                        <span className="text-yellow-400 font-black text-base">VS</span>
                        <div className="text-center flex-1">
                          <div className="text-3xl mb-0.5">{getFlag(match.team2)}</div>
                          <div className="text-white font-bold text-sm">{match.team2}</div>
                        </div>
                      </div>

                      <div className="text-green-600 text-xs text-center mb-3">
                        📅 {formatDate(match.match_date)}
                      </div>

                      {/* Input or locked */}
                      {locked ? (
                        <div className="text-center py-1">
                          {pred ? (
                            <div className="text-yellow-400 text-sm font-bold">
                              🔒 {pred.predicted_score1} – {pred.predicted_score2}
                            </div>
                          ) : (
                            <div className="text-red-400 text-sm flex items-center justify-center gap-1">
                              <Lock className="w-3.5 h-3.5" /> Gesloten — geen voorspelling
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {pred && !justSaved && (
                            <div className="text-green-500 text-xs text-center mb-2">
                              Huidig: {pred.predicted_score1} – {pred.predicted_score2}
                            </div>
                          )}
                          {justSaved && (
                            <div className="text-yellow-400 text-xs text-center mb-2 font-bold">
                              ✓ Opgeslagen!
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              type="number" inputMode="numeric" min="0" max="20"
                              value={inp.s1}
                              onChange={e => setInp(match.id, 's1', e.target.value)}
                              placeholder="0"
                              className="flex-1 text-center text-white font-black text-2xl py-3 rounded-xl outline-none"
                              style={{ backgroundColor: '#002211', border: '2px solid #006b3f' }}
                            />
                            <span className="text-yellow-400 font-black text-2xl">–</span>
                            <input
                              type="number" inputMode="numeric" min="0" max="20"
                              value={inp.s2}
                              onChange={e => setInp(match.id, 's2', e.target.value)}
                              placeholder="0"
                              className="flex-1 text-center text-white font-black text-2xl py-3 rounded-xl outline-none"
                              style={{ backgroundColor: '#002211', border: '2px solid #006b3f' }}
                            />
                            <button
                              onClick={() => submit(match)}
                              disabled={saving === match.id || inp.s1 === '' || inp.s2 === ''}
                              className="px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-40"
                              style={{ backgroundColor: '#D4AF37', color: '#001a0d', fontFamily: 'Arial Black, Arial', minWidth: 48 }}
                            >
                              {saving === match.id ? '...' : pred ? '✏️' : '✓'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Finished */}
        {finished.length > 0 && (
          <div>
            <h2 className="text-yellow-400 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" /> Gespeeld
            </h2>
            <div className="space-y-2">
              {finished.map(match => {
                const pred = getPred(match.id)
                const badge = pred ? getResultBadge(match, pred) : null
                return (
                  <div
                    key={match.id}
                    className="rounded-xl px-4 py-3"
                    style={{ backgroundColor: '#002211', border: '1px solid #003322' }}
                  >
                    <div className="text-green-800 text-xs mb-0.5">{match.round_name}</div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-white text-sm">
                        {getFlag(match.team1)} {match.team1}{' '}
                        <span className="text-yellow-400 font-black">{match.score1} – {match.score2}</span>{' '}
                        {match.team2} {getFlag(match.team2)}
                      </div>
                      {badge ? (
                        <span className="text-xs font-bold whitespace-nowrap" style={{ color: badge.color }}>
                          {badge.text}
                        </span>
                      ) : (
                        <span className="text-green-900 text-xs">—</span>
                      )}
                    </div>
                    {pred && (
                      <div className="text-green-800 text-xs mt-0.5">
                        Jij: {pred.predicted_score1} – {pred.predicted_score2}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {matches.length === 0 && (
          <div className="text-center py-16 text-green-800">
            <div className="text-5xl mb-3">🗓️</div>
            <div className="text-sm">Wedstrijden worden binnenkort ingeladen.</div>
            <div className="text-xs mt-1 opacity-60">WK start 11 juni 2026</div>
          </div>
        )}

      </div>
    </div>
  )
}
