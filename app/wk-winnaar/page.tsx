'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { WK_COUNTRIES } from '@/lib/countries'
import type { User, WkWinnerPrediction, GlobalState } from '@/lib/types'

export default function WkWinnaarPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [myPrediction, setMyPrediction] = useState<WkWinnerPrediction | null>(null)
  const [allPredictions, setAllPredictions] = useState<WkWinnerPrediction[]>([])
  const [globalState, setGlobalState] = useState<GlobalState | null>(null)
  const [selected, setSelected] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem('klok_user')
    if (!s) { router.push('/'); return }
    setCurrentUser(JSON.parse(s))
  }, [router])

  const fetchData = useCallback(async () => {
    if (!currentUser) return
    const [usersRes, predsRes, gsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('wk_winner_predictions').select('*'),
      supabase.from('global_state').select('*').single(),
    ])
    if (usersRes.data) setAllUsers(usersRes.data)
    if (predsRes.data) {
      setAllPredictions(predsRes.data)
      const mine = predsRes.data.find((p: WkWinnerPrediction) => p.user_id === currentUser.id)
      if (mine) {
        setMyPrediction(mine)
        setSelected(mine.predicted_country)
      }
    }
    if (gsRes.data) setGlobalState(gsRes.data)
  }, [currentUser])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const save = async () => {
    if (!currentUser || !selected || saving) return
    setSaving(true)
    setSaved(false)

    if (myPrediction) {
      // Update bestaande voorspelling
      await supabase
        .from('wk_winner_predictions')
        .update({ predicted_country: selected, updated_at: new Date().toISOString() })
        .eq('id', myPrediction.id)
    } else {
      // Nieuwe voorspelling
      await supabase
        .from('wk_winner_predictions')
        .insert({ user_id: currentUser.id, predicted_country: selected })
    }

    await fetchData()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const wkWinner = globalState?.wk_winner

  const getFlag = (countryName: string) => {
    return WK_COUNTRIES.find(c => c.name === countryName)?.flag ?? '🏳️'
  }

  if (!currentUser) return null

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
            🏆 WK WINNAAR
          </div>
          <div className="text-green-400 text-xs">Voorspel de kampioen — +30p als je gelijk hebt!</div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-5">

        {/* Als WK-winnaar al bekend is */}
        {wkWinner && (
          <div className="rounded-2xl p-5 text-center"
            style={{ background: 'linear-gradient(135deg, #003322, #006b3f)', border: '3px solid #D4AF37' }}>
            <div className="text-6xl mb-2">{getFlag(wkWinner)}</div>
            <div className="text-yellow-400 font-black text-xl" style={{ fontFamily: 'Arial Black, Arial' }}>
              🏆 WK WINNAAR: {wkWinner.toUpperCase()}!
            </div>
            {myPrediction?.predicted_country === wkWinner ? (
              <div className="mt-3 rounded-xl py-2 px-4 inline-block"
                style={{ backgroundColor: '#D4AF37', color: '#003322' }}>
                <span className="font-black">🎉 JIJ HAD HET GOED! +30p!</span>
              </div>
            ) : myPrediction ? (
              <div className="mt-2 text-green-400 text-sm">
                Jij voorspelde: {getFlag(myPrediction.predicted_country)} {myPrediction.predicted_country}
              </div>
            ) : null}
          </div>
        )}

        {/* Jouw voorspelling */}
        <div className="rounded-2xl p-5"
          style={{ backgroundColor: '#006b3f', border: '2px solid #D4AF37' }}>
          <h2 className="text-yellow-400 font-black text-base mb-1" style={{ fontFamily: 'Arial Black, Arial' }}>
            🎯 JOUW VOORSPELLING
          </h2>
          <p className="text-green-300 text-xs mb-4">
            Kies het land dat jij denkt dat het WK 2026 gaat winnen.
            Als je goed zit, verdien je <strong className="text-yellow-400">+30 punten</strong>!
            Je kunt je voorspelling wijzigen totdat het toernooi begint.
          </p>

          {myPrediction && !wkWinner && (
            <div className="rounded-xl p-3 mb-4 text-center"
              style={{ backgroundColor: '#004d2e', border: '1px solid #D4AF37' }}>
              <div className="text-3xl">{getFlag(myPrediction.predicted_country)}</div>
              <div className="text-white font-bold">{myPrediction.predicted_country}</div>
              <div className="text-green-400 text-xs mt-1">Huidige keuze — je kunt nog wijzigen</div>
            </div>
          )}

          {!wkWinner && (
            <>
              <div className="relative mb-3">
                <select
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                  className="w-full appearance-none rounded-xl px-4 py-3 font-bold text-base pr-10"
                  style={{ backgroundColor: '#003322', color: selected ? 'white' : '#888', border: '1px solid #006b3f', outline: 'none' }}
                >
                  <option value="" disabled>Kies een land...</option>
                  {WK_COUNTRIES.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-yellow-400">▾</span>
              </div>

              <button
                onClick={save}
                disabled={saving || !selected || selected === myPrediction?.predicted_country}
                className="w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: saved ? '#006b3f' : '#D4AF37',
                  color: saved ? 'white' : '#003322',
                  fontFamily: 'Arial Black, Arial',
                  boxShadow: '0 4px 0 #A88A1A',
                }}
              >
                {saving ? 'Opslaan...' : saved ? '✓ Opgeslagen!' : myPrediction ? '🔄 Wijzig voorspelling' : '🏆 Sla voorspelling op'}
              </button>
            </>
          )}
        </div>

        {/* Alle voorspellingen */}
        <div>
          <h2 className="text-yellow-400 font-black text-lg mb-3 flex items-center gap-2"
            style={{ fontFamily: 'Arial Black, Arial' }}>
            <Trophy className="w-5 h-5" /> IEDERS VOORSPELLING
          </h2>
          <div className="space-y-2">
            {allUsers.map(user => {
              const pred = allPredictions.find(p => p.user_id === user.id)
              const isMe = user.id === currentUser.id
              const isWinner = pred && wkWinner && pred.predicted_country === wkWinner
              return (
                <div key={user.id} className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{
                    backgroundColor: isWinner ? '#D4AF37' : isMe ? '#006b3f' : '#004d2e',
                    border: isMe ? '1px solid #D4AF37' : '1px solid transparent',
                    color: isWinner ? '#003322' : 'white',
                  }}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{user.name}</span>
                    {isMe && <span className="text-xs opacity-60">(jij)</span>}
                  </div>
                  <div className="text-right">
                    {pred ? (
                      <div className="flex items-center gap-2">
                        {isWinner && <span className="font-black text-sm">🎉 +30p</span>}
                        <span className="text-lg">{getFlag(pred.predicted_country)}</span>
                        <span className="font-bold text-sm">{pred.predicted_country}</span>
                      </div>
                    ) : (
                      <span className="text-xs opacity-50 italic">Nog niet ingevuld</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
