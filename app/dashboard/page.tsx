'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Flag, LogOut, Camera, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import BottleGrid from '@/components/BottleGrid'
import AlertOverlay from '@/components/AlertOverlay'
import KlokFlesje from '@/components/KlokFlesje'
import type { User, Country, GlobalState, ScheduledPrediction, QuizQuestion, QuizAnswer, PointEvent } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [myCountries, setMyCountries] = useState<Country[]>([])
  const [globalState, setGlobalState] = useState<GlobalState | null>(null)
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({})
  const [beerLoading, setBeerLoading] = useState(false)
  const [adtLoading, setAdtLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [myPendingAdts, setMyPendingAdts] = useState<ScheduledPrediction[]>([])
  const [todayQuiz, setTodayQuiz] = useState<QuizQuestion | null>(null)
  const [myQuizAnswer, setMyQuizAnswer] = useState<QuizAnswer | null>(null)
  const [allCountries, setAllCountries] = useState<Country[]>([])
  const [myCountryPoints, setMyCountryPoints] = useState<PointEvent[]>([])
  const prevGsRef = useRef<GlobalState | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('klok_user')
    if (!saved) { router.push('/'); return }
    setCurrentUser(JSON.parse(saved))
  }, [router])

  const fetchData = useCallback(async () => {
    if (!currentUser) return
    const [usersRes, countriesRes, gsRes, predsRes] = await Promise.all([
      supabase.from('users').select('*').order('total_points', { ascending: false }),
      supabase.from('countries').select('*'),
      supabase.from('global_state').select('*').single(),
      supabase.from('scheduled_predictions')
        .select('*')
        .eq('user_id', currentUser.id)
        .in('points_awarded', [5, 10]) // exact non-NL=5p, exact NL=10p
        .eq('adt_uitgedeeld', false),
    ])
    if (usersRes.data) setAllUsers(usersRes.data)
    if (countriesRes.data) {
      setMyCountries(countriesRes.data.filter((c: Country) => c.owner_id === currentUser.id))
      setAllCountries(countriesRes.data)
    }
    if (gsRes.data) {
      const gs = gsRes.data as GlobalState
      if (!prevGsRef.current) {
        // First load — dismiss everything already active so login doesn't trigger old alerts
        setDismissed({
          wout_scored: gs.wout_status === 'scored',
          wout_in: gs.wout_status === 'subbed_in',
          nl_tegenpunt: gs.nl_tegenpunt_alert,
          adt_uitdeel: gs.adt_uitdeel_active,
        })
      } else {
        // Only show alert when something newly changes
        if (prevGsRef.current.wout_status !== 'scored' && gs.wout_status === 'scored')
          setDismissed(d => ({ ...d, wout_scored: false }))
        if (prevGsRef.current.wout_status === 'idle' && gs.wout_status === 'subbed_in')
          setDismissed(d => ({ ...d, wout_in: false }))
        if (!prevGsRef.current.nl_tegenpunt_alert && gs.nl_tegenpunt_alert)
          setDismissed(d => ({ ...d, nl_tegenpunt: false }))
        if (!prevGsRef.current.adt_uitdeel_active && gs.adt_uitdeel_active)
          setDismissed(d => ({ ...d, adt_uitdeel: false }))
      }
      prevGsRef.current = gs
      setGlobalState(gs)
    }
    if (predsRes.data) setMyPendingAdts(predsRes.data)

    // Landen punten (wedstrijdresultaten)
    const { data: pointsData } = await supabase
      .from('point_events')
      .select('*')
      .eq('user_id', currentUser.id)
      .like('reason', '⚽%')
    if (pointsData) setMyCountryPoints(pointsData)

    // Today's quiz question
    const today = new Date().toISOString().split('T')[0]
    const [quizRes, quizAnsRes] = await Promise.all([
      supabase.from('quiz_questions').select('*').eq('question_date', today).single(),
      supabase.from('quiz_answers').select('*').eq('user_id', currentUser.id),
    ])
    setTodayQuiz(quizRes.data ?? null)
    if (quizAnsRes.data && quizRes.data) {
      setMyQuizAnswer(quizAnsRes.data.find((a: QuizAnswer) => a.question_id === quizRes.data.id) ?? null)
    }

    const { data: fresh } = await supabase.from('users').select('*').eq('id', currentUser.id).single()
    if (fresh) { setCurrentUser(fresh); localStorage.setItem('klok_user', JSON.stringify(fresh)) }
  }, [currentUser])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const undoBeer = async () => {
    if (!currentUser || beerLoading || currentUser.beers_drunk <= 0) return
    setBeerLoading(true)
    await supabase.from('users').update({
      total_points: currentUser.total_points - 1,
      beers_drunk: currentUser.beers_drunk - 1,
    }).eq('id', currentUser.id)
    await fetchData()
    setBeerLoading(false)
  }

  const drinkBeer = async () => {
    if (!currentUser || beerLoading) return
    setBeerLoading(true)
    await supabase.from('users').update({
      total_points: currentUser.total_points + 1,
      beers_drunk: currentUser.beers_drunk + 1,
    }).eq('id', currentUser.id)
    await supabase.from('point_events').insert({ user_id: currentUser.id, points: 1, reason: '🍺 Klokje gedronken' })
    await fetchData()
    setBeerLoading(false)
  }

  const drinkAdt = async () => {
    if (!currentUser || adtLoading) return
    setAdtLoading(true)
    await supabase.from('users').update({
      total_points: currentUser.total_points + 2,
      adts_drunk: (currentUser.adts_drunk || 0) + 1,
    }).eq('id', currentUser.id)
    await supabase.from('point_events').insert({ user_id: currentUser.id, points: 2, reason: '💥 ADT gedronken' })
    await fetchData()
    setAdtLoading(false)
  }

  const deelAdtUit = async (predId: number) => {
    await supabase.from('global_state').update({
      adt_uitdeel_active: true,
      adt_uitdeel_by_user_id: currentUser?.id,
    }).eq('id', 1)
    await supabase.from('scheduled_predictions').update({ adt_uitgedeeld: true }).eq('id', predId)
    await fetchData()
  }

  const dismissAlert = async (key: string) => {
    setDismissed(d => ({ ...d, [key]: true }))
    // Reset in DB als het al lang genoeg actief was
    if (key === 'adt_uitdeel') await supabase.from('global_state').update({ adt_uitdeel_active: false, adt_uitdeel_by_user_id: null }).eq('id', 1)
    if (key === 'nl_tegenpunt') await supabase.from('global_state').update({ nl_tegenpunt_alert: false }).eq('id', 1)
  }

  const uploadAvatar = async (file: File) => {
    if (!currentUser || avatarUploading) return
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${currentUser.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        alert(`Foto upload mislukt: ${uploadError.message}`)
        return
      }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: updateError } = await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', currentUser.id)
      if (updateError) console.error('Avatar url update error:', updateError)
      await fetchData()
    } finally { setAvatarUploading(false) }
  }

  const logout = () => { localStorage.removeItem('klok_user'); router.push('/') }

  if (!currentUser) return null

  const gs = globalState

  // Welk alert tonen? Prioriteit: NL tegenpunt > ADT uitdeel > Wout
  const activeAlert = (() => {
    if (gs?.nl_tegenpunt_alert && !dismissed.nl_tegenpunt) return 'nl_tegenpunt'
    if (gs?.adt_uitdeel_active && !dismissed.adt_uitdeel) return 'adt_uitdeel'
    if (gs?.wout_status === 'scored' && !dismissed.wout_scored) return 'wout_scored'
    if (gs?.wout_status === 'subbed_in' && !dismissed.wout_in) return 'wout_in'
    return null
  })()

  const adtByUser = allUsers.find(u => u.id === gs?.adt_uitdeel_by_user_id)

  return (
    <div className="min-h-screen pb-8">
      {/* Overlays */}
      {activeAlert === 'nl_tegenpunt' && (
        <AlertOverlay type="nl_tegenpunt" onDismiss={() => dismissAlert('nl_tegenpunt')} />
      )}
      {activeAlert === 'adt_uitdeel' && (
        <AlertOverlay type="adt_uitdeel" byName={adtByUser?.name} onDismiss={() => dismissAlert('adt_uitdeel')} />
      )}
      {activeAlert === 'wout_scored' && (
        <AlertOverlay type="wout_scored" onDismiss={() => dismissAlert('wout_scored')} />
      )}
      {activeAlert === 'wout_in' && (
        <AlertOverlay type="wout_in" onDismiss={() => dismissAlert('wout_in')} />
      )}

      {/* MOTTO BANNER */}
      <div
        className="w-full py-3 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, #003322 0%, #006b3f 50%, #003322 100%)',
          borderBottom: '3px solid #D4AF37',
        }}
      >
        <p
          className="font-black text-lg tracking-wide leading-tight"
          style={{
            fontFamily: 'Arial Black, Arial',
            background: 'linear-gradient(90deg, #D4AF37, #F5D76E, #D4AF37)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          WINNEN IS DRINKEN
        </p>
        <p
          className="font-black text-lg tracking-wide leading-tight"
          style={{
            fontFamily: 'Arial Black, Arial',
            background: 'linear-gradient(90deg, #D4AF37, #F5D76E, #D4AF37)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          DRINKEN IS WINNEN
        </p>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}>
        <div>
          <div className="text-yellow-400 font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
            🍺 DE KLOKHUIS
          </div>
          <div className="text-green-400 text-xs">WK-Poule 2026</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-white font-bold text-sm">{currentUser.name}</div>
            <div className="text-yellow-400 text-xs font-black">{currentUser.total_points}p totaal</div>
          </div>
          <button onClick={logout}><LogOut className="w-5 h-5 text-green-500" /></button>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {/* ADT uitdelen knop (als je een exacte voorspelling had) */}
        {myPendingAdts.length > 0 && (
          <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: '#8B0000', border: '2px solid #FFD700' }}>
            <p className="text-yellow-300 font-black text-center">🎯 Exacte voorspelling! Deel een ADT uit:</p>
            {myPendingAdts.map(pred => (
              <button key={pred.id} onClick={() => deelAdtUit(pred.id)}
                className="w-full py-3 rounded-xl font-black text-lg active:scale-95 transition-all"
                style={{ backgroundColor: '#FFD700', color: '#3D0000', fontFamily: 'Arial Black, Arial' }}>
                💥 DEEL ADT UIT AAN IEDEREEN!
              </button>
            ))}
          </div>
        )}

        {/* Wout alert banner (klikbaar voor overlay) */}
        {gs?.wout_status !== 'idle' && (
          <div className="rounded-2xl p-3 text-center font-black animate-pulse cursor-pointer"
            style={{ backgroundColor: gs?.wout_status === 'scored' ? '#D4AF37' : '#006b3f', color: gs?.wout_status === 'scored' ? '#003322' : '#D4AF37', border: '2px solid #D4AF37' }}
            onClick={() => setDismissed(d => ({ ...d, wout_in: false, wout_scored: false }))}>
            {gs?.wout_status === 'scored' ? '⚽ WOUT SCOORT — DUBBELE ADT!' : '🟨 WOUT IN HET VELD — ADTEN!'}
          </div>
        )}

        {/* Drink knoppen */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={drinkBeer} disabled={beerLoading}
            className="py-5 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-60 flex flex-col items-center gap-1"
            style={{ backgroundColor: '#006b3f', border: '2px solid #D4AF37', color: 'white', fontFamily: 'Arial Black, Arial', boxShadow: '0 4px 0 #004d2e' }}>
            <KlokFlesje size={40} />
            <span>{beerLoading ? '...' : '+1 KLOKJE'}</span>
            <span className="text-xs font-normal text-green-300">+1 punt</span>
          </button>
          <button onClick={drinkAdt} disabled={adtLoading}
            className="py-5 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-60 flex flex-col items-center gap-1"
            style={{ backgroundColor: '#8B0000', border: '2px solid #FFD700', color: '#FFD700', fontFamily: 'Arial Black, Arial', boxShadow: '0 4px 0 #5c0000' }}>
            <span className="text-4xl">💥</span>
            <span>{adtLoading ? '...' : '+1 ADT'}</span>
            <span className="text-xs font-normal text-red-300">+2 punten</span>
          </button>
        </div>
        {/* Undo misklikt */}
        <div className="flex justify-center -mt-1">
          <button onClick={undoBeer} disabled={beerLoading || currentUser.beers_drunk <= 0}
            className="text-xs py-1 px-3 rounded-lg active:scale-95 transition-all disabled:opacity-30"
            style={{ backgroundColor: '#002211', color: '#4ade80' }}>
            🧒 kleine speler — −1 biertje
          </button>
        </div>
        <p className="text-green-600 text-xs text-center -mt-1">
          🍺 {currentUser.beers_drunk} klokjes • 💥 {currentUser.adts_drunk || 0} adtjes — alleen tijdens het WK
        </p>

        {/* Quiz banner — toont alleen als er een vraag is vandaag */}
        {todayQuiz && (
          <a href="/quiz"
            className="block rounded-2xl p-4 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1a0a2e, #2d1a4d)', border: '2px solid #7c3aed' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-300 font-black text-sm" style={{ fontFamily: 'Arial Black, Arial' }}>
                  🧠 VRAAG VAN DE DAG!
                </div>
                <div className="text-white text-xs mt-0.5 leading-snug line-clamp-2">
                  {todayQuiz.question}
                </div>
              </div>
              <div className="flex-shrink-0 ml-3 text-right">
                {myQuizAnswer ? (
                  <div className="text-green-400 font-black text-xs">✓ Beantwoord</div>
                ) : (
                  <div className="text-yellow-400 font-black text-sm animate-pulse">+1p →</div>
                )}
              </div>
            </div>
          </a>
        )}

        {/* Draft knop (alleen als draft nog niet klaar is) */}
        {!globalState?.draft_completed && (
          <a href="/draft"
            className="block text-center py-4 rounded-2xl font-black text-lg transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #004d2e, #006b3f)',
              border: '2px solid #D4AF37',
              color: '#D4AF37',
              fontFamily: 'Arial Black, Arial',
              boxShadow: '0 4px 0 #A88A1A',
            }}>
            🎡 LANDEN DRAFT — Doe mee!
          </a>
        )}

        {/* Snelkoppelingen */}
        <div className="grid grid-cols-2 gap-2">
          <a href="/voorspellingen" className="py-3 rounded-xl text-center text-sm font-bold"
            style={{ backgroundColor: '#004d2e', color: '#D4AF37', border: '1px solid #006b3f' }}>
            🎯 Voorspellen
          </a>
          <a href="/nl-voorspelling" className="py-3 rounded-xl text-center text-sm font-bold"
            style={{ backgroundColor: '#003322', color: '#FF8833', border: '2px solid #FF6600' }}>
            🇳🇱 Nederland
          </a>
          <a href="/quiz" className="py-3 rounded-xl text-center text-sm font-bold"
            style={{ backgroundColor: '#1a0a2e', color: '#a78bfa', border: '1px solid #7c3aed' }}>
            🧠 Quiz
          </a>
          <a href="/wk-winnaar" className="py-3 rounded-xl text-center text-sm font-bold"
            style={{ backgroundColor: '#003d22', color: '#D4AF37', border: '1px solid #D4AF37' }}>
            🏆 WK Winnaar
          </a>
          <a href="/speelschema" className="py-3 rounded-xl text-center text-sm font-bold"
            style={{ backgroundColor: '#003322', color: '#4ade80', border: '1px solid #006b3f' }}>
            📅 Speelschema
          </a>
          <a href="/spelregels" className="py-3 rounded-xl text-center text-sm font-bold col-span-2"
            style={{ backgroundColor: '#002211', color: '#6b7280', border: '1px solid #1f2937' }}>
            📋 Spelregels
          </a>
        </div>
        <a href="/ad-wedstrijd" className="block text-center text-xs text-green-800 py-1">
          ⏱️ ADT-wedstrijd
        </a>

        {/* RANGLIJST */}
        <div>
          <h2 className="text-yellow-400 font-black text-lg mb-3 flex items-center gap-2"
            style={{ fontFamily: 'Arial Black, Arial' }}>
            <Trophy className="w-5 h-5" /> BIERKONING(IN) RANGLIJST
          </h2>
          <div className="space-y-4">
            {allUsers.map((user, index) => {
              const isMe = user.id === currentUser.id
              const medals = ['🥇', '🥈', '🥉']
              const klokScore = user.beers_drunk
              const adtScore = (user.adts_drunk || 0) * 2
              const wedstrijdScore = user.total_points - klokScore - adtScore
              return (
                <div key={user.id} className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: isMe ? '#006b3f' : '#004d2e', border: isMe ? '2px solid #D4AF37' : '2px solid #003322' }}>
                  {/* Foto + naam */}
                  <div className="flex" style={{ minHeight: 90 }}>
                    <div className="relative flex-shrink-0" style={{ width: 90, minHeight: 90 }}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" style={{ minHeight: 90 }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                          style={{ backgroundColor: '#002211', minHeight: 90 }}>
                          {user.name.slice(0, 1)}
                        </div>
                      )}
                      {isMe && (
                        <label className="absolute inset-0 flex items-end justify-center pb-1 cursor-pointer"
                          style={{ background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.65))' }}>
                          <input type="file" accept="image/*" capture="user" className="hidden"
                            onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                          <span className="text-white text-xs flex items-center gap-0.5">
                            <Camera className="w-3 h-3" />{avatarUploading ? '...' : 'foto'}
                          </span>
                        </label>
                      )}
                    </div>
                    <div className="flex-1 px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{medals[index] || `${index + 1}.`}</span>
                          <span className={`font-black text-base ${isMe ? 'text-yellow-400' : 'text-white'}`}>{user.name}</span>
                        </div>
                        <div className="flex gap-2 mt-0.5 text-xs flex-wrap">
                          <span className="text-green-300">🍺 {klokScore}p</span>
                          <span className="text-red-300">💥 {adtScore}p</span>
                          {wedstrijdScore > 0 && <span className="text-blue-300">⚽ {wedstrijdScore}p</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-black text-2xl">{user.total_points}</div>
                        <div className="text-green-500 text-xs">punten</div>
                      </div>
                    </div>
                  </div>
                  {/* Flesjes */}
                  <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <BottleGrid points={user.total_points} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Jouw landen */}
        {myCountries.length > 0 && (
          <div>
            <h2 className="text-yellow-400 font-black text-lg mb-3 flex items-center gap-2"
              style={{ fontFamily: 'Arial Black, Arial' }}>
              <Flag className="w-5 h-5" /> JOUW LANDEN
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {myCountries.map(country => {
                const countryEvents = myCountryPoints.filter(e =>
                  e.reason.includes(country.name)
                )
                const totalPts = countryEvents.reduce((sum, e) => sum + e.points, 0)
                return (
                  <div key={country.id} className="rounded-2xl p-4"
                    style={{ backgroundColor: '#006b3f', border: '1px solid #00804a' }}>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{country.flag_emoji}</div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-base">{country.name}</div>
                        {countryEvents.length > 0 ? (
                          <div className="mt-1 space-y-0.5">
                            {countryEvents.map(e => (
                              <div key={e.id} className="flex justify-between items-center text-xs">
                                <span className="text-green-300">{e.reason.replace('⚽ ', '')}</span>
                                <span className="text-yellow-400 font-black ml-2">+{e.points}p</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-green-600 text-xs mt-1">Nog geen wedstrijden gespeeld</div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-yellow-400 font-black text-xl">{totalPts}</div>
                        <div className="text-green-500 text-xs">punten</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Alle picks — ieders landen */}
        {globalState?.draft_completed && allCountries.some(c => c.owner_id) && (
          <div>
            <h2 className="text-yellow-400 font-black text-lg mb-3 flex items-center gap-2"
              style={{ fontFamily: 'Arial Black, Arial' }}>
              🌍 ALLE PICKS
            </h2>
            <div className="space-y-2">
              {allUsers.map(user => {
                const picks = allCountries.filter(c => c.owner_id === user.id)
                if (picks.length === 0) return null
                const isMe = user.id === currentUser.id
                return (
                  <div key={user.id} className="rounded-2xl px-4 py-3"
                    style={{
                      backgroundColor: isMe ? '#006b3f' : '#004d2e',
                      border: isMe ? '1px solid #D4AF37' : '1px solid transparent',
                    }}>
                    <div className="text-sm font-bold mb-2"
                      style={{ color: isMe ? '#D4AF37' : 'white' }}>
                      {isMe ? '⭐ ' : ''}{user.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {picks.map(c => (
                        <span key={c.id} className="rounded-lg px-2 py-1 text-sm flex items-center gap-1"
                          style={{ backgroundColor: '#003322', color: 'white' }}>
                          {c.flag_emoji} {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
