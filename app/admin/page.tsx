'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { PLAYERS, NL_SPELERS } from '@/lib/countries'
import type { User, Country, Match, GlobalState, ScheduledMatch } from '@/lib/types'
import { Settings, Trophy, Flag, Zap, Timer, RefreshCw } from 'lucide-react'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'klok2026'

type Tab = 'wout' | 'wedstrijden' | 'punten' | 'draft' | 'adwedstrijd' | 'nl_goals'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('wout')

  const [users, setUsers] = useState<User[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [scheduledMatches, setScheduledMatches] = useState<ScheduledMatch[]>([])
  const [globalState, setGlobalState] = useState<GlobalState | null>(null)

  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [score1, setScore1] = useState('0')
  const [score2, setScore2] = useState('0')
  const [isNl, setIsNl] = useState(false)
  const [matchMsg, setMatchMsg] = useState('')

  const [bonusCountryId, setBonusCountryId] = useState('')
  const [bonusMsg, setBonusMsg] = useState('')

  const [selectedMatch, setSelectedMatch] = useState('')
  const [validateMsg, setValidateMsg] = useState('')

  // Scheduled match scoring
  const [schedMatchId, setSchedMatchId] = useState('')
  const [schedScore1, setSchedScore1] = useState('0')
  const [schedScore2, setSchedScore2] = useState('0')
  const [schedMsg, setSchedMsg] = useState('')

  // NL tegendoelpunt
  const [nlTegenMsg, setNlTegenMsg] = useState('')

  // NL goals
  const [nlGoalMatchId, setNlGoalMatchId] = useState('')
  const [nlGoalScorer, setNlGoalScorer] = useState('')
  const [nlGoalMsg, setNlGoalMsg] = useState('')
  const [nlGoals, setNlGoals] = useState<{ id: number; match_id: number; scorer_name: string; scorer_position: string }[]>([])

  const [draftMsg, setDraftMsg] = useState('')
  const [adMsg, setAdMsg] = useState('')

  const fetchData = useCallback(async () => {
    const [u, c, m, sm, gs, ng] = await Promise.all([
      supabase.from('users').select('*').order('total_points', { ascending: false }),
      supabase.from('countries').select('*'),
      supabase.from('matches').select('*').order('created_at', { ascending: false }),
      supabase.from('scheduled_matches').select('*').order('match_date', { ascending: true }),
      supabase.from('global_state').select('*').single(),
      supabase.from('nl_goals').select('*').order('created_at', { ascending: false }),
    ])
    if (u.data) setUsers(u.data)
    if (c.data) setCountries(c.data)
    if (m.data) setMatches(m.data)
    if (sm.data) setScheduledMatches(sm.data)
    if (gs.data) setGlobalState(gs.data)
    if (ng.data) setNlGoals(ng.data)
  }, [])

  useEffect(() => {
    if (authed) {
      fetchData()
      const interval = setInterval(fetchData, 10000)
      return () => clearInterval(interval)
    }
  }, [authed, fetchData])

  const login = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else setPwError(true)
  }

  const setWout = async (status: 'idle' | 'subbed_in' | 'scored') => {
    await supabase.from('global_state').update({ wout_status: status }).eq('id', 1)
    await fetchData()
  }

  const saveMatch = async () => {
    if (!team1 || !team2) { setMatchMsg('Vul beide teamnamen in!'); return }
    const s1 = parseInt(score1), s2 = parseInt(score2)

    const { data: match } = await supabase
      .from('matches')
      .insert({ team1, team2, score1: s1, score2: s2, is_nl_match: isNl })
      .select().single()

    if (!match) { setMatchMsg('Fout bij opslaan!'); return }

    // Herlaad users voor actuele punten
    const { data: freshUsers } = await supabase.from('users').select('*')
    const currentUsers: User[] = freshUsers || []

    const winnerName = s1 > s2 ? team1 : s2 > s1 ? team2 : null
    const isDraw = s1 === s2
    let houseWon = false

    for (const country of countries) {
      if (country.name !== team1 && country.name !== team2) continue

      const isWinner = winnerName === country.name
      const pts = isWinner ? 3 : isDraw ? 1 : 0
      if (pts === 0) continue

      if (!country.owner_id) {
        // Huis-land wint
        if (isWinner) houseWon = true
        continue
      }

      const owner = currentUsers.find(u => u.id === country.owner_id)
      if (!owner) continue

      await supabase.from('users')
        .update({ total_points: owner.total_points + pts })
        .eq('id', owner.id)

      await supabase.from('point_events').insert({
        user_id: owner.id, points: pts,
        reason: `⚽ ${country.name} ${isWinner ? 'wint' : 'gelijkspel'} (${s1}-${s2})`,
      })
    }

    setMatchMsg(houseWon
      ? '✅ Opgeslagen! 🏠 HUIS-LAND WINT — IEDEREEN DRINKT EEN KLOKJE!'
      : '✅ Wedstrijd opgeslagen en punten verwerkt!')
    setTeam1(''); setTeam2(''); setScore1('0'); setScore2('0'); setIsNl(false)
    await fetchData()
    setTimeout(() => setMatchMsg(''), 5000)
  }

  const giveClubBonus = async () => {
    if (!bonusCountryId) { setBonusMsg('Kies een land!'); return }
    const country = countries.find(c => c.id === parseInt(bonusCountryId))
    if (!country?.owner_id) { setBonusMsg('Dit land heeft geen eigenaar!'); return }
    const owner = users.find(u => u.id === country.owner_id)
    if (!owner) return

    await supabase.from('users').update({ total_points: owner.total_points + 1 }).eq('id', owner.id)
    await supabase.from('point_events').insert({
      user_id: owner.id, points: 1,
      reason: `⭐ Club-bonus: Feyenoord/PSV/Groningen scoorde voor ${country.name}`,
    })
    setBonusMsg(`✅ +1 punt voor ${owner.name} (${country.flag_emoji} ${country.name})`)
    await fetchData()
    setTimeout(() => setBonusMsg(''), 3000)
  }

  const validatePredictions = async () => {
    if (!selectedMatch) { setValidateMsg('Kies een wedstrijd!'); return }
    const match = matches.find(m => m.id === parseInt(selectedMatch))
    if (!match || match.score1 === null) { setValidateMsg('Wedstrijd heeft nog geen uitslag!'); return }

    const { data: preds } = await supabase.from('predictions').select('*').eq('match_id', match.id)
    if (!preds?.length) { setValidateMsg('Geen voorspellingen gevonden!'); return }

    const { data: freshUsers } = await supabase.from('users').select('*')
    const currentUsers: User[] = freshUsers || []

    const actualResult = match.score1! > match.score2! ? 'W' : match.score1! < match.score2! ? 'L' : 'D'
    let count = 0

    for (const pred of preds) {
      const predResult = pred.predicted_score1 > pred.predicted_score2 ? 'W' :
        pred.predicted_score1 < pred.predicted_score2 ? 'L' : 'D'
      const exact = pred.predicted_score1 === match.score1 && pred.predicted_score2 === match.score2
      const pts = exact ? 5 : predResult === actualResult ? 3 : 0
      if (!pts) continue

      const user = currentUsers.find(u => u.id === pred.user_id)
      if (!user) continue

      await supabase.from('users').update({ total_points: user.total_points + pts }).eq('id', pred.user_id)
      await supabase.from('point_events').insert({
        user_id: pred.user_id, points: pts,
        reason: exact
          ? `🎯 Exact goed: ${match.team1}-${match.team2} (${match.score1}-${match.score2})`
          : `✅ Toto goed: ${match.team1}-${match.team2}`,
      })
      await supabase.from('predictions').update({ points_awarded: pts }).eq('id', pred.id)
      count++
    }

    setValidateMsg(`✅ ${count} voorspelling(en) beloond!`)
    await fetchData()
    setTimeout(() => setValidateMsg(''), 3000)
  }

  const resetDraft = async () => {
    if (!confirm('Weet je zeker dat je de hele draft wil resetten?')) return
    await supabase.from('countries').update({ owner_id: null }).neq('id', 0)
    await supabase.from('global_state').update({ draft_completed: false }).eq('id', 1)
    setDraftMsg('✅ Draft gereset!')
    await fetchData()
    setTimeout(() => setDraftMsg(''), 3000)
  }

  const startAdWedstrijd = async () => {
    await supabase.from('global_state').update({ ad_wedstrijd_active: true, ad_wedstrijd_winner_id: null }).eq('id', 1)
    setAdMsg('✅ Ad-wedstrijd gestart!')
    await fetchData()
  }

  const stopAdWedstrijd = async () => {
    await supabase.from('global_state').update({ ad_wedstrijd_active: false }).eq('id', 1)
    setAdMsg('⏹ Gestopt.')
    await fetchData()
  }

  const triggerNlTegenpunt = async () => {
    await supabase.from('global_state').update({ nl_tegenpunt_alert: true }).eq('id', 1)
    setNlTegenMsg('🔴 Alert verstuurd! Iedereen ADT!')
    await fetchData()
    setTimeout(() => setNlTegenMsg(''), 4000)
  }

  const scoreScheduledMatch = async () => {
    if (!schedMatchId) { setSchedMsg('Kies een wedstrijd!'); return }
    const match = scheduledMatches.find(m => m.id === parseInt(schedMatchId))
    if (!match) return

    const s1 = parseInt(schedScore1)
    const s2 = parseInt(schedScore2)
    if (isNaN(s1) || isNaN(s2)) { setSchedMsg('Voer geldige scores in!'); return }

    // Update match score and status
    await supabase
      .from('scheduled_matches')
      .update({ score1: s1, score2: s2, status: 'finished', predictions_locked: true })
      .eq('id', match.id)

    // Fetch all predictions for this match
    const { data: preds } = await supabase
      .from('scheduled_predictions')
      .select('*')
      .eq('match_id', match.id)
      .eq('points_awarded', 0) // only unscored

    if (!preds?.length) {
      setSchedMsg('✅ Scores opgeslagen. Geen openstaande voorspellingen.')
      await fetchData()
      setTimeout(() => setSchedMsg(''), 4000)
      return
    }

    const { data: freshUsers } = await supabase.from('users').select('*')
    const currentUsers: User[] = freshUsers || []

    const actualResult = s1 > s2 ? 'W' : s1 < s2 ? 'L' : 'D'
    const exactPts = match.is_nl_match ? 10 : 5
    const totoPts = match.is_nl_match ? 5 : 2
    let rewarded = 0

    for (const pred of preds) {
      const predResult = pred.predicted_score1 > pred.predicted_score2 ? 'W' :
        pred.predicted_score1 < pred.predicted_score2 ? 'L' : 'D'
      const isExact = pred.predicted_score1 === s1 && pred.predicted_score2 === s2
      const isToto = !isExact && predResult === actualResult
      const pts = isExact ? exactPts : isToto ? totoPts : 0

      // Always update points_awarded (even 0 = "processed")
      await supabase.from('scheduled_predictions')
        .update({ points_awarded: pts })
        .eq('id', pred.id)

      if (pts === 0) continue

      const user = currentUsers.find(u => u.id === pred.user_id)
      if (!user) continue

      await supabase.from('users')
        .update({ total_points: user.total_points + pts })
        .eq('id', pred.user_id)

      await supabase.from('point_events').insert({
        user_id: pred.user_id,
        points: pts,
        reason: isExact
          ? `🎯 Exact: ${match.team1} ${s1}–${s2} ${match.team2} (+${pts}p)`
          : `✅ Toto: ${match.team1} ${s1}–${s2} ${match.team2} (+${pts}p)`,
      })
      rewarded++
    }

    setSchedMsg(`✅ Verwerkt! ${rewarded}/${preds.length} speler(s) beloond.`)
    setSchedMatchId('')
    setSchedScore1('0')
    setSchedScore2('0')
    await fetchData()
    setTimeout(() => setSchedMsg(''), 5000)
  }

  const addNlGoal = async () => {
    if (!nlGoalMatchId || !nlGoalScorer) { setNlGoalMsg('Kies wedstrijd en scorer!'); return }
    const speler = NL_SPELERS.find(p => p.name === nlGoalScorer)
    if (!speler) return
    const matchId = parseInt(nlGoalMatchId)

    // Insert goal
    await supabase.from('nl_goals').insert({
      match_id: matchId,
      scorer_name: speler.name,
      scorer_position: speler.position,
    })

    // Award points to users who predicted this scorer for this match
    const positiePunten: Record<string, number> = { aanvaller: 1, middenvelder: 3, verdediger: 5 }
    const pts = positiePunten[speler.position] ?? 0

    const { data: preds } = await supabase
      .from('nl_scorer_predictions')
      .select('*')
      .eq('match_id', matchId)

    const { data: freshUsers } = await supabase.from('users').select('*')
    const currentUsers: User[] = freshUsers || []
    let rewarded = 0

    for (const pred of preds || []) {
      const scored1 = pred.scorer1_name === speler.name
      const scored2 = pred.scorer2_name === speler.name
      if (!scored1 && !scored2) continue

      const user = currentUsers.find(u => u.id === pred.user_id)
      if (!user) continue

      await supabase.from('users').update({ total_points: user.total_points + pts }).eq('id', pred.user_id)
      await supabase.from('nl_scorer_predictions').update({ points_awarded: pred.points_awarded + pts }).eq('id', pred.id)
      await supabase.from('point_events').insert({
        user_id: pred.user_id, points: pts,
        reason: `⚽ ${speler.name} scoort! (${speler.position}, +${pts}p)`,
      })
      rewarded++
    }

    setNlGoalMsg(`✅ Doelpunt van ${speler.name} verwerkt! ${rewarded} speler(s) beloond.`)
    setNlGoalScorer('')
    await fetchData()
    setTimeout(() => setNlGoalMsg(''), 5000)
  }

  const deleteNlGoal = async (goalId: number) => {
    if (!confirm('Doelpunt verwijderen? (punten worden NIET teruggedraaid)')) return
    await supabase.from('nl_goals').delete().eq('id', goalId)
    await fetchData()
  }

  // ─── LOGIN ───
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-3xl p-8" style={{ backgroundColor: '#006b3f' }}>
          <div className="text-center mb-6">
            <Settings className="w-12 h-12 mx-auto mb-2" style={{ color: '#D4AF37' }} />
            <h1 className="text-white text-2xl font-black" style={{ fontFamily: 'Arial Black, Arial' }}>ADMIN PANEEL</h1>
          </div>
          <input
            type="password" placeholder="Wachtwoord..." value={password}
            onChange={e => { setPassword(e.target.value); setPwError(false) }}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full rounded-xl px-4 py-3 text-lg mb-4 text-green-900 font-bold"
          />
          {pwError && <p className="text-red-300 text-sm text-center mb-3">Fout wachtwoord!</p>}
          <button onClick={login} className="w-full py-4 rounded-2xl text-lg font-black"
            style={{ backgroundColor: '#D4AF37', color: '#003322', fontFamily: 'Arial Black, Arial' }}>
            Inloggen
          </button>
          <a href="/" className="block text-center text-green-400 text-sm mt-4">← Terug</a>
        </div>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'wout', label: 'Wout', icon: <Zap className="w-4 h-4" /> },
    { key: 'wedstrijden', label: 'Wedstrijden', icon: <Flag className="w-4 h-4" /> },
    { key: 'nl_goals', label: '🇳🇱 Goals', icon: <span>⚽</span> },
    { key: 'punten', label: 'Punten', icon: <Trophy className="w-4 h-4" /> },
    { key: 'draft', label: 'Draft', icon: <RefreshCw className="w-4 h-4" /> },
    { key: 'adwedstrijd', label: 'Ad-wed', icon: <Timer className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-10 px-4 py-3" style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-yellow-400 font-black text-lg" style={{ fontFamily: 'Arial Black, Arial' }}>⚙️ ADMIN</h1>
          <a href="/dashboard" className="text-green-400 text-sm">← Dashboard</a>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0"
              style={{ backgroundColor: activeTab === t.key ? '#D4AF37' : '#003322', color: activeTab === t.key ? '#003322' : '#D4AF37' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4">

        {activeTab === 'wout' && (
          <div className="space-y-4">
            <h2 className="text-yellow-400 font-black text-xl" style={{ fontFamily: 'Arial Black, Arial' }}>⚽ WOUT WEGHORST</h2>
            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#006b3f' }}>
              <p className="text-green-300 text-sm mb-2">Huidige status:</p>
              <p className="text-white font-black text-2xl">
                {globalState?.wout_status === 'idle' && '😴 Niet actief'}
                {globalState?.wout_status === 'subbed_in' && '🟨 In het veld!'}
                {globalState?.wout_status === 'scored' && '⚽ SCOORT!!!'}
              </p>
            </div>
            <button onClick={() => setWout('subbed_in')} disabled={globalState?.wout_status === 'subbed_in'}
              className="w-full py-5 rounded-2xl text-xl font-black disabled:opacity-50 active:scale-95 transition-all"
              style={{ backgroundColor: '#F5D76E', color: '#003322', fontFamily: 'Arial Black, Arial' }}>
              🟨 WOUT IS ERIN!
            </button>
            <button onClick={() => setWout('scored')} disabled={globalState?.wout_status === 'idle'}
              className="w-full py-5 rounded-2xl text-xl font-black disabled:opacity-50 active:scale-95 transition-all"
              style={{ backgroundColor: '#D4AF37', color: '#003322', fontFamily: 'Arial Black, Arial' }}>
              ⚽ WOUT SCOORT!
            </button>
            <button onClick={() => setWout('idle')} disabled={globalState?.wout_status === 'idle'}
              className="w-full py-3 rounded-2xl font-bold disabled:opacity-40"
              style={{ backgroundColor: '#004d2e', color: '#aaa', border: '1px solid #006b3f' }}>
              Reset Wout
            </button>

            <div className="border-t pt-4" style={{ borderColor: '#006b3f' }}>
              <h3 className="text-yellow-400 font-black text-lg mb-3" style={{ fontFamily: 'Arial Black, Arial' }}>
                🇳🇱 NL TEGENDOELPUNT
              </h3>
              <p className="text-green-300 text-sm mb-3">Nederland krijgt een tegendoelpunt — iedereen moet ADT!</p>
              {nlTegenMsg && (
                <div className="rounded-xl p-3 text-center font-bold text-sm mb-3"
                  style={{ backgroundColor: '#CC0000', color: 'white' }}>
                  {nlTegenMsg}
                </div>
              )}
              <button onClick={triggerNlTegenpunt}
                className="w-full py-5 rounded-2xl text-xl font-black active:scale-95 transition-all"
                style={{ backgroundColor: '#CC0000', color: 'white', border: '2px solid #FF4444', fontFamily: 'Arial Black, Arial' }}>
                🔴 TEGENDOELPUNT!
              </button>
              <p className="text-green-700 text-xs text-center mt-2">
                Wordt automatisch gereset zodra iedereen geklikt heeft
              </p>
            </div>
          </div>
        )}

        {activeTab === 'wedstrijden' && (
          <div className="space-y-4">
            <h2 className="text-yellow-400 font-black text-xl" style={{ fontFamily: 'Arial Black, Arial' }}>⚽ WEDSTRIJD INVOEREN</h2>
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#006b3f' }}>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-green-300 text-xs mb-1 block">Thuisland</label>
                  <input value={team1} onChange={e => setTeam1(e.target.value)} placeholder="bijv. Nederland"
                    className="w-full rounded-xl px-3 py-2 text-green-900 font-bold" />
                </div>
                <div className="text-white font-black text-lg pb-2">vs</div>
                <div className="flex-1">
                  <label className="text-green-300 text-xs mb-1 block">Uitland</label>
                  <input value={team2} onChange={e => setTeam2(e.target.value)} placeholder="bijv. Duitsland"
                    className="w-full rounded-xl px-3 py-2 text-green-900 font-bold" />
                </div>
              </div>
              <div className="flex gap-3 items-center justify-center">
                <input type="number" min="0" max="20" value={score1} onChange={e => setScore1(e.target.value)}
                  className="w-20 h-14 text-center text-2xl font-bold rounded-xl text-green-900" />
                <span className="text-white text-2xl font-black">–</span>
                <input type="number" min="0" max="20" value={score2} onChange={e => setScore2(e.target.value)}
                  className="w-20 h-14 text-center text-2xl font-bold rounded-xl text-green-900" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isNl} onChange={e => setIsNl(e.target.checked)} className="w-5 h-5" />
                <span className="text-white font-bold">🇳🇱 Nederland-wedstrijd (voor voorspellingen)</span>
              </label>
            </div>
            {matchMsg && (
              <div className="rounded-xl p-3 text-center font-bold text-sm"
                style={{ backgroundColor: matchMsg.includes('HUIS') ? '#D4AF37' : '#004d2e', color: matchMsg.includes('HUIS') ? '#003322' : '#22c55e' }}>
                {matchMsg}
              </div>
            )}
            <button onClick={saveMatch} className="w-full py-4 rounded-2xl text-lg font-black active:scale-95 transition-all"
              style={{ backgroundColor: '#D4AF37', color: '#003322', fontFamily: 'Arial Black, Arial' }}>
              ✅ Verwerk Wedstrijd + Punten
            </button>

            <div className="rounded-2xl p-4 space-y-3 mt-2" style={{ backgroundColor: '#006b3f' }}>
              <h3 className="text-yellow-400 font-bold">🇳🇱 NL Voorspellingen Valideren (oud systeem)</h3>
              <select value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-green-900 font-bold">
                <option value="">Kies NL-wedstrijd met uitslag...</option>
                {matches.filter(m => m.is_nl_match && m.score1 !== null).map(m => (
                  <option key={m.id} value={m.id}>{m.team1} {m.score1}–{m.score2} {m.team2}</option>
                ))}
              </select>
              {validateMsg && <p className="text-green-300 font-bold text-sm">{validateMsg}</p>}
              <button onClick={validatePredictions} className="w-full py-3 rounded-xl font-bold"
                style={{ backgroundColor: '#D4AF37', color: '#003322' }}>
                Valideer & Ken punten toe
              </button>
            </div>

            {/* Scheduled match scoring */}
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#003322', border: '2px solid #D4AF37' }}>
              <h3 className="text-yellow-400 font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
                🎯 VOORSPELWEDSTRIJD AFSLUITEN
              </h3>
              <p className="text-green-400 text-xs">
                Kies een wedstrijd uit het voorspelsysteem, vul de eindstand in en ken punten toe.
                NL-wedstrijden: exact=10p / winnaar goed=5p. Overige: exact=5p / winnaar goed=2p.
              </p>
              <select
                value={schedMatchId}
                onChange={e => setSchedMatchId(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-green-900 font-bold"
              >
                <option value="">Kies wedstrijd...</option>
                {scheduledMatches
                  .filter(m => m.status !== 'finished')
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.is_nl_match ? '🇳🇱 ' : ''}{m.team1} vs {m.team2} — {m.round_name}
                    </option>
                  ))}
              </select>
              <div className="flex gap-3 items-center justify-center">
                <input
                  type="number" min="0" max="20"
                  value={schedScore1}
                  onChange={e => setSchedScore1(e.target.value)}
                  className="w-20 h-14 text-center text-2xl font-bold rounded-xl text-green-900"
                />
                <span className="text-white text-2xl font-black">–</span>
                <input
                  type="number" min="0" max="20"
                  value={schedScore2}
                  onChange={e => setSchedScore2(e.target.value)}
                  className="w-20 h-14 text-center text-2xl font-bold rounded-xl text-green-900"
                />
              </div>
              {schedMsg && (
                <div className="rounded-xl p-3 text-center font-bold text-sm"
                  style={{ backgroundColor: schedMsg.startsWith('✅') ? '#004d2e' : '#5c0000', color: schedMsg.startsWith('✅') ? '#4ade80' : '#fca5a5' }}>
                  {schedMsg}
                </div>
              )}
              <button
                onClick={scoreScheduledMatch}
                className="w-full py-4 rounded-xl font-black text-lg active:scale-95 transition-all"
                style={{ backgroundColor: '#D4AF37', color: '#001a0d', fontFamily: 'Arial Black, Arial' }}
              >
                ✅ Verwerk uitslag + ken punten toe
              </button>
            </div>
          </div>
        )}

        {activeTab === 'punten' && (
          <div className="space-y-4">
            <h2 className="text-yellow-400 font-black text-xl" style={{ fontFamily: 'Arial Black, Arial' }}>⭐ CLUB BONUS</h2>
            <p className="text-green-300 text-sm">Feyenoord / PSV / FC Groningen speler scoort? Kies het land van die speler.</p>
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#006b3f' }}>
              <select value={bonusCountryId} onChange={e => setBonusCountryId(e.target.value)}
                className="w-full rounded-xl px-3 py-3 text-green-900 font-bold">
                <option value="">Kies land van scorende speler...</option>
                {countries.filter(c => c.owner_id).map(c => {
                  const owner = users.find(u => u.id === c.owner_id)
                  return <option key={c.id} value={c.id}>{c.flag_emoji} {c.name} → {owner?.name}</option>
                })}
              </select>
              {bonusMsg && <p className="text-green-300 font-bold text-sm">{bonusMsg}</p>}
              <button onClick={giveClubBonus} className="w-full py-3 rounded-xl font-bold"
                style={{ backgroundColor: '#D4AF37', color: '#003322' }}>
                ⭐ Geef +1 Club Bonus
              </button>
            </div>
            <h3 className="text-yellow-400 font-bold">📊 Huidige Stand</h3>
            <div className="space-y-2">
              {users.map((u, i) => (
                <div key={u.id} className="rounded-xl p-3 flex justify-between items-center" style={{ backgroundColor: '#004d2e' }}>
                  <span className="text-white font-bold">{i + 1}. {u.name}</span>
                  <span className="text-yellow-400 font-black">{u.total_points}p</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'draft' && (
          <div className="space-y-4">
            <h2 className="text-yellow-400 font-black text-xl" style={{ fontFamily: 'Arial Black, Arial' }}>🎡 DRAFT BEHEER</h2>
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#006b3f' }}>
              <p className="text-white mb-2">Status: <strong className="text-yellow-400">
                {globalState?.draft_completed ? '✅ Afgerond' : '⏳ Bezig / Nog niet gestart'}
              </strong></p>
              <p className="text-green-300 text-sm mb-4">Landen toegewezen: {countries.filter(c => c.owner_id).length}/28</p>
              {draftMsg && <p className="text-green-300 font-bold text-sm mb-3">{draftMsg}</p>}
              <button onClick={resetDraft} className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ backgroundColor: '#c0392b', color: 'white' }}>
                🔄 Reset Draft (verwijdert alle picks!)
              </button>
            </div>
            <h3 className="text-yellow-400 font-bold">🏠 Huis-landen ({countries.filter(c => !c.owner_id).length})</h3>
            <div className="flex flex-wrap gap-2">
              {countries.filter(c => !c.owner_id).map(c => (
                <span key={c.id} className="rounded-lg px-2 py-1 text-sm" style={{ backgroundColor: '#004d2e', color: '#aaa' }}>
                  {c.flag_emoji} {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'adwedstrijd' && (
          <div className="space-y-4">
            <h2 className="text-yellow-400 font-black text-xl" style={{ fontFamily: 'Arial Black, Arial' }}>⏱️ AD-WEDSTRIJD</h2>
            <p className="text-green-300 text-sm">Bij gelijkspel in de finale: eerste die op "Klokje Op!" drukt wint!</p>
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#006b3f' }}>
              <p className="text-white mb-3">Status: <strong className="text-yellow-400">
                {globalState?.ad_wedstrijd_active ? '🔴 ACTIEF' : '⚫ Inactief'}
              </strong></p>
              {globalState?.ad_wedstrijd_winner_id && (
                <p className="text-yellow-400 font-black text-lg mb-3">
                  🏆 Winnaar: {users.find(u => u.id === globalState.ad_wedstrijd_winner_id)?.name}
                </p>
              )}
              {adMsg && <p className="text-green-300 font-bold text-sm mb-3">{adMsg}</p>}
              <div className="flex gap-3">
                <button onClick={startAdWedstrijd} disabled={globalState?.ad_wedstrijd_active}
                  className="flex-1 py-4 rounded-xl font-black disabled:opacity-50"
                  style={{ backgroundColor: '#D4AF37', color: '#003322', fontFamily: 'Arial Black, Arial' }}>
                  🟢 START!
                </button>
                <button onClick={stopAdWedstrijd} disabled={!globalState?.ad_wedstrijd_active}
                  className="flex-1 py-4 rounded-xl font-black disabled:opacity-50"
                  style={{ backgroundColor: '#c0392b', color: 'white', fontFamily: 'Arial Black, Arial' }}>
                  ⏹ STOP
                </button>
              </div>
            </div>
            <a href="/ad-wedstrijd" className="block w-full py-4 rounded-2xl text-center font-bold"
              style={{ backgroundColor: '#004d2e', color: '#D4AF37', border: '2px solid #D4AF37' }}>
              Ga naar Ad-Wedstrijd pagina →
            </a>
          </div>
        )}

        {activeTab === 'nl_goals' && (
          <div className="space-y-4">
            <h2 className="font-black text-xl" style={{ color: '#FF6600', fontFamily: 'Arial Black, Arial' }}>
              🇳🇱 NL DOELPUNTEN INVOEREN
            </h2>
            <p className="text-green-300 text-sm">
              Voer elk NL doelpunt apart in. Punten worden direct toegekend aan spelers die die scorer hadden voorspeld.
            </p>

            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#001a4d', border: '2px solid #FF6600' }}>
              <div>
                <label className="text-orange-300 text-xs mb-1 block">Wedstrijd</label>
                <select value={nlGoalMatchId} onChange={e => setNlGoalMatchId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-green-900 font-bold">
                  <option value="">Kies NL wedstrijd...</option>
                  {scheduledMatches.filter(m => m.is_nl_match).map(m => (
                    <option key={m.id} value={m.id}>{m.team1} vs {m.team2}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-orange-300 text-xs mb-1 block">Doelpuntenmaker</label>
                <select value={nlGoalScorer} onChange={e => setNlGoalScorer(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-green-900 font-bold">
                  <option value="">Kies speler...</option>
                  {(['verdediger', 'middenvelder', 'aanvaller'] as const).map(pos => (
                    <optgroup key={pos} label={`${pos.charAt(0).toUpperCase() + pos.slice(1)}s`}>
                      {NL_SPELERS.filter(p => p.position === pos).map(p => (
                        <option key={p.name} value={p.name}>
                          {p.name} ({pos === 'verdediger' ? '+5p' : pos === 'middenvelder' ? '+3p' : '+1p'})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              {nlGoalMsg && (
                <div className="rounded-xl p-3 text-center font-bold text-sm"
                  style={{ backgroundColor: nlGoalMsg.startsWith('✅') ? '#004d2e' : '#5c0000', color: nlGoalMsg.startsWith('✅') ? '#4ade80' : '#fca5a5' }}>
                  {nlGoalMsg}
                </div>
              )}
              <button onClick={addNlGoal}
                className="w-full py-4 rounded-xl font-black text-lg active:scale-95 transition-all"
                style={{ backgroundColor: '#FF6600', color: 'white', fontFamily: 'Arial Black, Arial' }}>
                ⚽ Voeg doelpunt toe & ken punten toe
              </button>
            </div>

            {/* Logged goals */}
            {nlGoals.length > 0 && (
              <div>
                <h3 className="text-orange-400 font-bold mb-2">Gelogde doelpunten</h3>
                <div className="space-y-2">
                  {nlGoals.map(g => {
                    const match = scheduledMatches.find(m => m.id === g.match_id)
                    return (
                      <div key={g.id} className="rounded-xl px-3 py-2 flex justify-between items-center"
                        style={{ backgroundColor: '#001a4d', border: '1px solid #003399' }}>
                        <div>
                          <span className="text-white text-sm font-bold">⚽ {g.scorer_name}</span>
                          <span className="text-blue-400 text-xs ml-2">({g.scorer_position})</span>
                          {match && <div className="text-blue-600 text-xs">{match.team1} vs {match.team2}</div>}
                        </div>
                        <button onClick={() => deleteNlGoal(g.id)} className="text-red-600 text-xs">✕</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
