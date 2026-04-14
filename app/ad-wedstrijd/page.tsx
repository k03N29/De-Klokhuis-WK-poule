'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, GlobalState } from '@/lib/types'

export default function AdWedstrijdPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [globalState, setGlobalState] = useState<GlobalState | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [hasClicked, setHasClicked] = useState(false)
  const [clicking, setClicking] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('klok_user')
    if (!saved) { router.push('/'); return }
    setCurrentUser(JSON.parse(saved))
  }, [router])

  const fetchData = useCallback(async () => {
    const [gs, u] = await Promise.all([
      supabase.from('global_state').select('*').single(),
      supabase.from('users').select('*'),
    ])
    if (gs.data) setGlobalState(gs.data)
    if (u.data) setUsers(u.data)
  }, [])

  // Start timer wanneer actief
  useEffect(() => {
    if (globalState?.ad_wedstrijd_active && !timerRef.current) {
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) setElapsed(Date.now() - startTimeRef.current)
      }, 10)
    }
    if (!globalState?.ad_wedstrijd_active && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [globalState?.ad_wedstrijd_active])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => {
      clearInterval(interval)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchData])

  const handleClick = async () => {
    if (!currentUser || !globalState?.ad_wedstrijd_active || globalState?.ad_wedstrijd_winner_id || clicking) return
    setClicking(true)
    setHasClicked(true)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

    // Race condition: alleen eerste schrijft wint
    await supabase.from('global_state')
      .update({ ad_wedstrijd_winner_id: currentUser.id, ad_wedstrijd_active: false })
      .eq('id', 1)
      .is('ad_wedstrijd_winner_id', null)

    await fetchData()
    setClicking(false)
  }

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const c = Math.floor((ms % 1000) / 10)
    return `${s}.${c.toString().padStart(2, '0')}s`
  }

  const winner = users.find(u => u.id === globalState?.ad_wedstrijd_winner_id)
  const isWinner = winner?.id === currentUser?.id
  const isActive = globalState?.ad_wedstrijd_active === true
  const isDone = !isActive && !!winner

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}>
        <h1 className="text-yellow-400 font-black text-lg" style={{ fontFamily: 'Arial Black, Arial' }}>
          ⏱️ AD-WEDSTRIJD
        </h1>
        <a href="/dashboard" className="text-green-400 text-sm">← Back</a>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">

        {/* Wachten */}
        {!isActive && !isDone && (
          <div className="text-center space-y-6">
            <div className="text-8xl">⏳</div>
            <h2 className="text-white font-black text-2xl" style={{ fontFamily: 'Arial Black, Arial' }}>
              Wachten op admin...
            </h2>
            <p className="text-green-300 text-sm">De admin start de ad-wedstrijd als er gelijkstand is in de finale.</p>
            <p className="text-green-600 text-xs animate-pulse">Ververst automatisch elke 3 seconden</p>
          </div>
        )}

        {/* Actief */}
        {isActive && (
          <div className="w-full text-center space-y-6">
            <div className="rounded-2xl py-6 px-4 text-center"
              style={{ backgroundColor: '#004d2e', border: '2px solid #D4AF37' }}>
              <p className="text-green-300 text-sm mb-1">Tijd verstreken</p>
              <p className="font-black text-5xl tabular-nums"
                style={{ color: '#D4AF37', fontFamily: 'Arial Black, Arial' }}>
                {formatTime(elapsed)}
              </p>
            </div>

            <p className="text-white font-bold text-xl animate-pulse">Wie is het snelst?! 🍺</p>

            {!hasClicked ? (
              <button
                onClick={handleClick}
                disabled={clicking}
                className="w-full py-16 rounded-3xl font-black transition-all active:scale-90"
                style={{
                  backgroundColor: '#D4AF37',
                  color: '#003322',
                  fontFamily: 'Arial Black, Arial',
                  boxShadow: '0 8px 0 #A88A1A',
                  fontSize: '2.5rem',
                  lineHeight: '1.2',
                }}
              >
                🍺<br />KLOKJE OP!
              </button>
            ) : (
              <div className="w-full py-12 rounded-3xl text-center"
                style={{ backgroundColor: '#006b3f', border: '2px solid #D4AF37' }}>
                <p className="text-white font-black text-2xl">Wachten op uitslag...</p>
                <p className="text-green-300 text-sm mt-2">Jouw tijd: {formatTime(elapsed)}</p>
              </div>
            )}
          </div>
        )}

        {/* Klaar */}
        {isDone && (
          <div className="w-full text-center space-y-6">
            {isWinner ? (
              <div>
                <div className="text-8xl mb-4">🏆</div>
                <div className="rounded-3xl py-8 px-6"
                  style={{ backgroundColor: '#D4AF37', color: '#003322' }}>
                  <p className="font-black text-3xl" style={{ fontFamily: 'Arial Black, Arial' }}>JIJ WINT!!!</p>
                  <p className="text-lg font-bold mt-2">De Ad-Wedstrijd is van {winner?.name}!</p>
                  <p className="text-4xl mt-3">🍺🍺🍺</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-8xl mb-4">😢</div>
                <div className="rounded-3xl py-8 px-6"
                  style={{ backgroundColor: '#004d2e', border: '2px solid #D4AF37' }}>
                  <p className="text-yellow-400 font-black text-3xl" style={{ fontFamily: 'Arial Black, Arial' }}>
                    🏆 {winner?.name}
                  </p>
                  <p className="text-white font-bold text-lg mt-2">wint de Ad-Wedstrijd!</p>
                  <p className="text-green-300 text-sm mt-3">Te traag, {currentUser?.name}! Neem een slok 🍺</p>
                </div>
              </div>
            )}
            <a href="/dashboard" className="block w-full py-4 rounded-2xl text-center font-bold"
              style={{ backgroundColor: '#006b3f', color: '#D4AF37' }}>
              ← Terug naar Dashboard
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
