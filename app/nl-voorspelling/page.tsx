'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getFlag, NL_SPELERS, NL_POSITIE_PUNTEN, NL_POSITIE_EMOJI } from '@/lib/countries'
import type { ScheduledMatch, ScheduledPrediction, NlScorerPrediction, User } from '@/lib/types'

export default function NlVoorspellingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [matches, setMatches] = useState<ScheduledMatch[]>([])
  const [myPredictions, setMyPredictions] = useState<ScheduledPrediction[]>([])
  const [myScorerPreds, setMyScorerPreds] = useState<NlScorerPrediction[]>([])
  const [scoreInputs, setScoreInputs] = useState<Record<number, { s1: string; s2: string }>>({})
  const [scorerInputs, setScorerInputs] = useState<Record<number, { s1: string; s2: string }>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [savingScorer, setSavingScorer] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [savedScorer, setSavedScorer] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('klok_user')
    if (!stored) { router.push('/'); return }
    setCurrentUser(JSON.parse(stored))
  }, [router])

  const fetchData = useCallback(async () => {
    if (!currentUser) return
    const [matchesRes, predsRes, scorerRes] = await Promise.all([
      supabase.from('scheduled_matches').select('*').eq('is_nl_match', true).order('match_date', { ascending: true }),
      supabase.from('scheduled_predictions').select('*').eq('user_id', currentUser.id),
      supabase.from('nl_scorer_predictions').select('*').eq('user_id', currentUser.id),
    ])
    if (matchesRes.data) setMatches(matchesRes.data)
    if (predsRes.data) setMyPredictions(predsRes.data)
    if (scorerRes.data) setMyScorerPreds(scorerRes.data)
  }, [currentUser])

  useEffect(() => { fetchData() }, [fetchData])

  const getPred = (matchId: number) => myPredictions.find(p => p.match_id === matchId)
  const getScorerPred = (matchId: number) => myScorerPreds.find(p => p.match_id === matchId)

  const getScoreInp = (matchId: number) => scoreInputs[matchId] || { s1: '', s2: '' }
  const getScorerInp = (matchId: number) => scorerInputs[matchId] || { s1: '', s2: '' }

  const setScoreInp = (matchId: number, key: 's1' | 's2', val: string) => {
    if (val !== '' && (isNaN(Number(val)) || Number(val) < 0)) return
    setScoreInputs(prev => ({ ...prev, [matchId]: { ...getScoreInp(matchId), [key]: val } }))
  }

  const submitScore = async (match: ScheduledMatch) => {
    if (!currentUser || saving !== null) return
    const inp = getScoreInp(match.id)
    const s1 = parseInt(inp.s1)
    const s2 = parseInt(inp.s2)
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) return
    setSaving(match.id)
    const existing = getPred(match.id)
    if (existing) {
      await supabase.from('scheduled_predictions').update({ predicted_score1: s1, predicted_score2: s2 }).eq('id', existing.id)
    } else {
      await supabase.from('scheduled_predictions').insert({
        user_id: currentUser.id, match_id: match.id,
        predicted_score1: s1, predicted_score2: s2,
        points_awarded: 0, adt_uitgedeeld: false,
      })
    }
    await fetchData()
    setSaving(null)
    setSaved(match.id)
    setTimeout(() => setSaved(null), 2000)
  }

  const submitScorers = async (match: ScheduledMatch) => {
    if (!currentUser || savingScorer !== null) return
    const inp = getScorerInp(match.id)
    if (!inp.s1 || !inp.s2) return
    const p1 = NL_SPELERS.find(p => p.name === inp.s1)
    const p2 = NL_SPELERS.find(p => p.name === inp.s2)
    if (!p1 || !p2) return
    setSavingScorer(match.id)
    const existing = getScorerPred(match.id)
    if (existing) {
      await supabase.from('nl_scorer_predictions').update({
        scorer1_name: p1.name, scorer1_position: p1.position,
        scorer2_name: p2.name, scorer2_position: p2.position,
      }).eq('id', existing.id)
    } else {
      await supabase.from('nl_scorer_predictions').insert({
        user_id: currentUser.id, match_id: match.id,
        scorer1_name: p1.name, scorer1_position: p1.position,
        scorer2_name: p2.name, scorer2_position: p2.position,
        points_awarded: 0,
      })
    }
    await fetchData()
    setSavingScorer(null)
    setSavedScorer(match.id)
    setTimeout(() => setSavedScorer(null), 2000)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam',
    })
  }

  const getOpponent = (match: ScheduledMatch) => {
    return match.team1 === 'Nederland'
      ? { nlFirst: true, opp: match.team2 }
      : { nlFirst: false, opp: match.team1 }
  }

  const getScoreBadge = (match: ScheduledMatch, pred: ScheduledPrediction) => {
    if (match.status !== 'finished' || match.score1 === null) return null
    if (pred.points_awarded >= 10) return { text: `⚡ EXACT! +${pred.points_awarded}p`, color: '#FFD700' }
    if (pred.points_awarded === 5) return { text: '✅ Winnaar goed! +5p', color: '#4ade80' }
    return { text: '❌ Fout — 0p', color: '#f87171' }
  }

  if (!currentUser) return null

  const upcoming = matches.filter(m => m.status === 'upcoming' || m.status === 'live')
  const finished = matches.filter(m => m.status === 'finished')
  const scorePts = myPredictions.filter(p => matches.some(m => m.id === p.match_id)).reduce((s, p) => s + p.points_awarded, 0)
  const scorerPts = myScorerPreds.reduce((s, p) => s + p.points_awarded, 0)

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: '#001433' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#003399', borderBottom: '3px solid #FF6600' }}>
        <button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5 text-orange-400" />
        </button>
        <div className="flex-1">
          <div className="text-white font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
            🇳🇱 NL VOORSPELLINGEN
          </div>
          <div className="text-orange-300 text-xs">exact=10p • winnaar=5p • scorers: 🛡️5p ⚙️3p ⚡1p per doel</div>
        </div>
        {(scorePts + scorerPts) > 0 && (
          <div className="text-right">
            <div className="text-orange-400 font-black text-lg">{scorePts + scorerPts}p</div>
            <div className="text-blue-400 text-xs">totaal</div>
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="py-5 px-4 text-center"
        style={{ background: 'linear-gradient(180deg, #003399 0%, #001a66 100%)', borderBottom: '3px solid #FF6600' }}>
        <div className="text-5xl mb-1">🇳🇱</div>
        <div className="font-black text-2xl text-white" style={{ fontFamily: 'Arial Black, Arial' }}>
          NEDERLAND
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs max-w-xs mx-auto">
          <div className="rounded-lg py-1.5 font-bold text-center" style={{ backgroundColor: '#FF6600', color: 'white' }}>
            ⚡ Exact<br />10p
          </div>
          <div className="rounded-lg py-1.5 font-bold text-center" style={{ backgroundColor: '#003399', color: 'white', border: '1px solid #FF6600' }}>
            ✅ Winnaar<br />5p
          </div>
          <div className="rounded-lg py-1.5 font-bold text-center" style={{ backgroundColor: '#001a66', color: '#FF8833', border: '1px solid #FF6600' }}>
            ⚽ Scorer<br />positie×p
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-400">
          🛡️ Verdediger=5p/doel &nbsp;⚙️ Middenvelder=3p/doel &nbsp;⚡ Aanvaller=1p/doel
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">

        {upcoming.map(match => {
          const pred = getPred(match.id)
          const scorerPred = getScorerPred(match.id)
          const scoreInp = getScoreInp(match.id)
          const scorerInp = getScorerInp(match.id)
          const locked = match.predictions_locked
          const { nlFirst, opp } = getOpponent(match)

          return (
            <div key={match.id} className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#002266', border: '2px solid #FF6600' }}>

              {match.status === 'live' && (
                <div className="px-3 py-1.5 text-sm font-black text-center animate-pulse"
                  style={{ backgroundColor: '#CC0000', color: 'white' }}>
                  🔴 NEDERLAND SPEELT NU!
                </div>
              )}

              <div className="px-4 py-4">
                <div className="text-orange-400 text-xs text-center mb-3">{match.round_name}</div>

                {/* Teams */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="text-center flex-1">
                    <div className="text-4xl">{nlFirst ? '🇳🇱' : getFlag(opp)}</div>
                    <div className="text-white font-black text-sm mt-0.5">{nlFirst ? 'Nederland' : opp}</div>
                  </div>
                  <span className="text-orange-400 font-black text-xl">VS</span>
                  <div className="text-center flex-1">
                    <div className="text-4xl">{nlFirst ? getFlag(opp) : '🇳🇱'}</div>
                    <div className="text-white font-black text-sm mt-0.5">{nlFirst ? opp : 'Nederland'}</div>
                  </div>
                </div>

                <div className="text-blue-400 text-xs text-center mb-4">📅 {formatDate(match.match_date)}</div>

                {/* ─── SCORE VOORSPELLING ─── */}
                <div className="rounded-xl p-3 mb-4"
                  style={{ backgroundColor: '#001a4d', border: '1px solid #003399' }}>
                  <div className="text-orange-300 text-xs font-bold mb-2 text-center">⚽ STAND VOORSPELLEN</div>
                  {locked ? (
                    <div className="text-center">
                      {pred ? (
                        <div className="text-orange-400 font-black text-lg">
                          🔒 {pred.predicted_score1} – {pred.predicted_score2}
                        </div>
                      ) : (
                        <div className="text-red-400 text-sm flex items-center justify-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Gesloten
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {pred && saved !== match.id && (
                        <div className="text-blue-400 text-xs text-center mb-2">
                          Huidig: {pred.predicted_score1} – {pred.predicted_score2}
                        </div>
                      )}
                      {saved === match.id && (
                        <div className="text-orange-400 text-xs text-center mb-2 font-black">✓ Opgeslagen!</div>
                      )}
                      <div className="flex items-center gap-2">
                        <input type="number" inputMode="numeric" min="0" max="20"
                          value={scoreInp.s1} onChange={e => setScoreInp(match.id, 's1', e.target.value)}
                          placeholder="0"
                          className="flex-1 text-center text-white font-black text-3xl py-3 rounded-xl outline-none"
                          style={{ backgroundColor: '#001433', border: '2px solid #FF6600' }} />
                        <span className="text-orange-400 font-black text-2xl">–</span>
                        <input type="number" inputMode="numeric" min="0" max="20"
                          value={scoreInp.s2} onChange={e => setScoreInp(match.id, 's2', e.target.value)}
                          placeholder="0"
                          className="flex-1 text-center text-white font-black text-3xl py-3 rounded-xl outline-none"
                          style={{ backgroundColor: '#001433', border: '2px solid #FF6600' }} />
                        <button onClick={() => submitScore(match)}
                          disabled={saving === match.id || scoreInp.s1 === '' || scoreInp.s2 === ''}
                          className="px-4 py-3 rounded-xl font-black transition-all active:scale-95 disabled:opacity-40"
                          style={{ backgroundColor: '#FF6600', color: 'white', minWidth: 48 }}>
                          {saving === match.id ? '...' : pred ? '✏️' : '✓'}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* ─── DOELPUNTENMAKERS ─── */}
                <div className="rounded-xl p-3"
                  style={{ backgroundColor: '#001a4d', border: '1px solid #003399' }}>
                  <div className="text-orange-300 text-xs font-bold mb-2 text-center">⚽ 2 DOELPUNTENMAKERS VOORSPELLEN</div>

                  {locked ? (
                    scorerPred ? (
                      <div className="space-y-2">
                        {[
                          { name: scorerPred.scorer1_name, pos: scorerPred.scorer1_position },
                          { name: scorerPred.scorer2_name, pos: scorerPred.scorer2_position },
                        ].map((s, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2"
                            style={{ backgroundColor: '#002266' }}>
                            <span className="text-white text-sm">🔒 {s.name}</span>
                            <span className="text-orange-400 text-xs font-bold">
                              {NL_POSITIE_EMOJI[s.pos as keyof typeof NL_POSITIE_EMOJI]} {s.pos} (+{NL_POSITIE_PUNTEN[s.pos as keyof typeof NL_POSITIE_PUNTEN]}p/doel)
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm text-center flex items-center justify-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Geen scorers ingediend
                      </div>
                    )
                  ) : (
                    <>
                      {scorerPred && savedScorer !== match.id && (
                        <div className="text-blue-400 text-xs text-center mb-2">
                          Huidig: {scorerPred.scorer1_name} &amp; {scorerPred.scorer2_name}
                        </div>
                      )}
                      {savedScorer === match.id && (
                        <div className="text-orange-400 text-xs text-center mb-2 font-black">✓ Scorers opgeslagen!</div>
                      )}
                      <div className="space-y-2 mb-3">
                        {(['s1', 's2'] as const).map((key, i) => {
                          const val = scorerInp[key] || ''
                          const speler = NL_SPELERS.find(p => p.name === val)
                          return (
                            <div key={key}>
                              <div className="text-blue-500 text-xs mb-1">Doelpuntenmaker {i + 1}:</div>
                              <div className="flex gap-2 items-center">
                                <select
                                  value={val}
                                  onChange={e => setScorerInputs(prev => ({ ...prev, [match.id]: { ...getScorerInp(match.id), [key]: e.target.value } }))}
                                  className="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold outline-none"
                                  style={{ backgroundColor: '#001433', color: 'white', border: `2px solid ${val ? '#FF6600' : '#003399'}` }}
                                >
                                  <option value="">Kies speler...</option>
                                  {(['verdediger', 'middenvelder', 'aanvaller'] as const).map(pos => (
                                    <optgroup key={pos} label={`${NL_POSITIE_EMOJI[pos]} ${pos.charAt(0).toUpperCase() + pos.slice(1)}s (+${NL_POSITIE_PUNTEN[pos]}p/doel)`}>
                                      {NL_SPELERS.filter(p => p.position === pos).map(p => (
                                        <option key={p.name} value={p.name}>{p.name}</option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                                {speler && (
                                  <span className="text-orange-400 text-xs font-bold whitespace-nowrap">
                                    {NL_POSITIE_EMOJI[speler.position]}
                                    +{NL_POSITIE_PUNTEN[speler.position]}p
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <button
                        onClick={() => submitScorers(match)}
                        disabled={savingScorer === match.id || !scorerInp.s1 || !scorerInp.s2}
                        className="w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-40"
                        style={{ backgroundColor: '#FF6600', color: 'white', fontFamily: 'Arial Black, Arial' }}>
                        {savingScorer === match.id ? 'Opslaan...' : scorerPred ? '✏️ Scorers aanpassen' : '⚽ Scorers opslaan'}
                      </button>
                    </>
                  )}

                  {scorerPred && scorerPred.points_awarded > 0 && (
                    <div className="mt-2 text-center text-orange-400 font-black text-sm">
                      ⚽ +{scorerPred.points_awarded}p via doelpuntenmakers!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Finished */}
        {finished.length > 0 && (
          <div>
            <h2 className="text-orange-400 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" /> Gespeeld
            </h2>
            <div className="space-y-3">
              {finished.map(match => {
                const pred = getPred(match.id)
                const scorerPred = getScorerPred(match.id)
                const badge = pred ? getScoreBadge(match, pred) : null
                const { nlFirst, opp } = getOpponent(match)
                return (
                  <div key={match.id} className="rounded-2xl px-4 py-4"
                    style={{ backgroundColor: '#001a4d', border: '1px solid #002266' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>{nlFirst ? '🇳🇱' : getFlag(opp)}</span>
                      <span className="text-white font-bold text-sm">
                        {match.team1} <span className="text-orange-400 font-black">{match.score1}–{match.score2}</span> {match.team2}
                      </span>
                      <span>{nlFirst ? getFlag(opp) : '🇳🇱'}</span>
                    </div>
                    {pred && (
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-500">Stand: {pred.predicted_score1}–{pred.predicted_score2}</span>
                        {badge && <span className="font-bold" style={{ color: badge.color }}>{badge.text}</span>}
                      </div>
                    )}
                    {scorerPred && (
                      <div className="text-xs text-blue-600 mt-1">
                        Scorers: {scorerPred.scorer1_name} &amp; {scorerPred.scorer2_name}
                        {scorerPred.points_awarded > 0 && (
                          <span className="text-orange-400 font-bold ml-1">+{scorerPred.points_awarded}p</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {matches.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🇳🇱</div>
            <div className="text-blue-600 text-sm">Nederland speelt voor het eerst op</div>
            <div className="text-white font-bold mt-1">14 juni 2026</div>
          </div>
        )}
      </div>
    </div>
  )
}
