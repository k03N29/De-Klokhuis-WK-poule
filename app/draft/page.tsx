'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PLAYERS, TOTAL_PICKS, LANDS_PER_SPELER } from '@/lib/countries'
import type { User, Country, GlobalState } from '@/lib/types'

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export default function DraftPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [globalState, setGlobalState] = useState<GlobalState | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [displayCountry, setDisplayCountry] = useState<Country | null>(null)
  const [justPicked, setJustPicked] = useState<Country | null>(null)
  const [spinDone, setSpinDone] = useState(false)
  const spinRef = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem('klok_user')
    if (!saved) { router.push('/'); return }
    setCurrentUser(JSON.parse(saved))
  }, [router])

  const fetchData = useCallback(async () => {
    const [usersRes, countriesRes, gsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('countries').select('*'),
      supabase.from('global_state').select('*').single(),
    ])
    if (usersRes.data) setUsers(usersRes.data)
    if (countriesRes.data) setCountries(countriesRes.data)
    if (gsRes.data) {
      setGlobalState(gsRes.data)
      if (gsRes.data.draft_completed) router.push('/dashboard')
    }
  }, [router])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Hoeveel picks zijn er al?
  const assignedCount = countries.filter(c => c.owner_id !== null).length
  const currentRound = Math.floor(assignedCount / PLAYERS.length) + 1
  const currentPlayerIndex = assignedCount % PLAYERS.length
  const currentPlayerName = PLAYERS[currentPlayerIndex]
  const draftDone = assignedCount >= TOTAL_PICKS

  const currentPlayerUser = users.find(u => u.name === currentPlayerName)
  const isMyTurn = currentUser?.name === currentPlayerName
  const isAdmin = currentUser?.name === users[0]?.name // eerste gebruiker als admin fallback

  const available = countries.filter(c => c.owner_id === null)

  const spin = async () => {
    if (spinRef.current || available.length === 0 || draftDone) return
    spinRef.current = true
    setIsSpinning(true)
    setSpinDone(false)
    setJustPicked(null)

    // Kies random land
    const target = available[Math.floor(Math.random() * available.length)]

    // Slot machine animatie
    const steps = 30
    for (let i = 0; i < steps; i++) {
      const rand = available[Math.floor(Math.random() * available.length)]
      setDisplayCountry(rand)
      const delay = i < 20 ? 40 + i * 8 : 200 + (i - 20) * 150
      await sleep(delay)
    }

    // Stop op het gekozen land
    setDisplayCountry(target)
    await sleep(800)

    // Sla op in de database
    if (currentPlayerUser) {
      await supabase
        .from('countries')
        .update({ owner_id: currentPlayerUser.id })
        .eq('id', target.id)
    }

    setJustPicked(target)
    setIsSpinning(false)
    setSpinDone(true)
    spinRef.current = false

    // Check of draft klaar is
    if (assignedCount + 1 >= TOTAL_PICKS) {
      await supabase
        .from('global_state')
        .update({ draft_completed: true })
        .eq('id', 1)
      setTimeout(() => router.push('/dashboard'), 3000)
    } else {
      await sleep(2000)
      setSpinDone(false)
      setDisplayCountry(null)
      setJustPicked(null)
      await fetchData()
    }
  }

  // Groepeer toegewezen landen per speler
  const picksPerPlayer: Record<string, Country[]> = {}
  PLAYERS.forEach(name => { picksPerPlayer[name] = [] })
  countries.forEach(c => {
    if (c.owner_id) {
      const owner = users.find(u => u.id === c.owner_id)
      if (owner) {
        picksPerPlayer[owner.name] = [...(picksPerPlayer[owner.name] || []), c]
      }
    }
  })

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 text-center"
        style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}
      >
        <h1
          className="text-yellow-400 font-black text-xl"
          style={{ fontFamily: 'Arial Black, Arial' }}
        >
          🎡 KLOK-RAD DRAFT
        </h1>
        <p className="text-green-300 text-xs">
          Pick {assignedCount}/{TOTAL_PICKS} • Ronde {Math.min(currentRound, LANDS_PER_SPELER)}/4
        </p>
      </div>

      <div className="px-4 pt-6 space-y-6">

        {/* Huidig aan de beurt */}
        {!draftDone && (
          <div
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: '#006b3f', border: '2px solid #D4AF37' }}
          >
            <p className="text-green-300 text-sm mb-1">Nu aan de beurt:</p>
            <p
              className="text-yellow-400 text-3xl font-black"
              style={{ fontFamily: 'Arial Black, Arial' }}
            >
              {currentPlayerName}
            </p>
            {isMyTurn && (
              <p className="text-white text-sm mt-1 animate-pulse">
                Jij bent aan de beurt! 👇
              </p>
            )}
          </div>
        )}

        {/* Spin wiel */}
        {!draftDone && (
          <div className="text-center">
            {/* Display venster */}
            <div
              className="rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden"
              style={{
                width: '100%',
                height: 140,
                backgroundColor: '#003322',
                border: '3px solid #D4AF37',
              }}
            >
              {displayCountry ? (
                <div className={isSpinning ? 'transition-none' : 'transition-all duration-500'}>
                  <div className="text-7xl">{displayCountry.flag_emoji}</div>
                  <div className="text-white font-bold text-lg mt-1">{displayCountry.name}</div>
                </div>
              ) : (
                <div className="text-green-700 text-lg">
                  {available.length} landen beschikbaar
                </div>
              )}
            </div>

            {/* Uitslag banner */}
            {spinDone && justPicked && (
              <div
                className="rounded-2xl p-3 mb-4 text-center"
                style={{ backgroundColor: '#D4AF37', color: '#003322' }}
              >
                <p className="font-black text-xl">🎉 {currentPlayerName} pakt:</p>
                <p className="text-3xl font-black">{justPicked.flag_emoji} {justPicked.name}</p>
              </div>
            )}

            {/* Spin knop */}
            {(isMyTurn || isAdmin) && !isSpinning && !spinDone && (
              <button
                onClick={spin}
                disabled={isSpinning || draftDone}
                className="w-full py-5 rounded-3xl text-2xl font-black transition-all active:scale-95"
                style={{
                  backgroundColor: '#D4AF37',
                  color: '#003322',
                  fontFamily: 'Arial Black, Arial',
                  boxShadow: '0 6px 0 #A88A1A',
                }}
              >
                🎡 SPIN!
              </button>
            )}

            {!isMyTurn && !isAdmin && !isSpinning && !spinDone && (
              <div
                className="rounded-2xl py-4 text-center text-green-300"
                style={{ backgroundColor: '#004d2e' }}
              >
                Wachten op {currentPlayerName}...
              </div>
            )}

            {isSpinning && (
              <div className="text-yellow-400 font-black text-xl animate-pulse py-4">
                🎡 Draaien...
              </div>
            )}
          </div>
        )}

        {/* Draft klaar */}
        {draftDone && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: '#D4AF37', color: '#003322' }}
          >
            <div className="text-5xl mb-2">🏆</div>
            <p className="font-black text-xl" style={{ fontFamily: 'Arial Black, Arial' }}>
              DRAFT AFGEROND!
            </p>
            <p className="text-sm mt-1">Doorsturen naar dashboard...</p>
          </div>
        )}

        {/* Overzicht picks per speler */}
        <div>
          <h3 className="text-yellow-400 font-bold mb-3">Picks tot nu toe:</h3>
          <div className="space-y-2">
            {PLAYERS.map(name => {
              const picks = picksPerPlayer[name] || []
              const isActive = name === currentPlayerName && !draftDone
              return (
                <div
                  key={name}
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: isActive ? '#006b3f' : '#004d2e',
                    border: isActive ? '1px solid #D4AF37' : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold text-sm">
                      {isActive && '▶ '}{name}
                    </span>
                    <span className="text-green-400 text-xs">
                      {picks.length}/{LANDS_PER_SPELER}
                    </span>
                  </div>
                  {picks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {picks.map(c => (
                        <span key={c.id} className="text-sm">
                          {c.flag_emoji} {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Huis-landen (na draft) */}
        {draftDone && (
          <div>
            <h3 className="text-yellow-400 font-bold mb-3">🏠 Huis-landen:</h3>
            <div className="flex flex-wrap gap-2">
              {countries.filter(c => !c.owner_id).map(c => (
                <span
                  key={c.id}
                  className="rounded-lg px-2 py-1 text-sm"
                  style={{ backgroundColor: '#004d2e', color: '#aaa' }}
                >
                  {c.flag_emoji} {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
