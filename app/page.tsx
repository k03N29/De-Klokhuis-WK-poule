'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Beer, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PLAYERS } from '@/lib/countries'
import type { User } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Als al ingelogd, doorsturen
  useEffect(() => {
    const saved = localStorage.getItem('klok_user')
    if (saved) {
      router.push('/dashboard')
    }
  }, [router])

  const handleLogin = async () => {
    if (!selected) {
      setError('Kies eerst je naam!')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('name', selected)
        .single()

      if (dbError || !data) {
        setError('Naam niet gevonden in de database. Check de setup!')
        setLoading(false)
        return
      }

      localStorage.setItem('klok_user', JSON.stringify(data as User))

      router.push('/dashboard')
    } catch {
      setError('Kan geen verbinding maken. Check je .env.local bestand!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-3 mb-4">
          <Beer className="w-12 h-12" style={{ color: '#D4AF37' }} />
          <Beer className="w-16 h-16" style={{ color: '#D4AF37' }} />
          <Beer className="w-12 h-12" style={{ color: '#D4AF37' }} />
        </div>
        <h1
          className="text-4xl font-black tracking-tight leading-tight"
          style={{
            fontFamily: 'Arial Black, Arial',
            color: '#D4AF37',
            textShadow: '2px 2px 0 #003322',
          }}
        >
          DE KLOKHUIS
        </h1>
        <h2
          className="text-2xl font-black mt-1"
          style={{
            fontFamily: 'Arial Black, Arial',
            color: 'white',
            textShadow: '1px 1px 0 #003322',
          }}
        >
          WK-POULE 2026 ⚽
        </h2>
        <p className="text-green-300 mt-2 text-sm">
          Gebaseerd op bier, landen en Wout Weghorst
        </p>
      </div>

      {/* Login kaart */}
      <div
        className="w-full max-w-sm rounded-3xl p-8 shadow-2xl"
        style={{ backgroundColor: '#006b3f' }}
      >
        <h3 className="text-white text-xl font-bold text-center mb-6">
          Wie ben jij? 👇
        </h3>

        {/* Dropdown */}
        <div className="relative mb-6">
          <select
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setError('') }}
            className="w-full appearance-none rounded-2xl px-5 py-4 text-lg font-bold pr-12 cursor-pointer"
            style={{
              backgroundColor: 'white',
              color: selected ? '#003322' : '#999',
              border: 'none',
              outline: 'none',
            }}
          >
            <option value="" disabled>Selecteer je naam...</option>
            {PLAYERS.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#006b3f' }}
          />
        </div>

        {error && (
          <p className="text-red-300 text-sm text-center mb-4">{error}</p>
        )}

        {/* Login knop */}
        <button
          onClick={handleLogin}
          disabled={loading || !selected}
          className="w-full py-4 rounded-2xl text-xl font-black transition-all active:scale-95 disabled:opacity-50"
          style={{
            backgroundColor: '#D4AF37',
            color: '#003322',
            fontFamily: 'Arial Black, Arial',
            boxShadow: '0 4px 0 #A88A1A',
          }}
        >
          {loading ? 'Even wachten...' : '🍺 Naar de Poule!'}
        </button>
      </div>

      {/* Admin link */}
      <div className="mt-8 text-center">
        <a
          href="/admin"
          className="text-green-400 text-sm underline opacity-60"
        >
          Admin paneel
        </a>
      </div>

      <p className="mt-6 text-green-600 text-xs text-center">
        Klok-Ratio™ powered by 🍺 De Klok
      </p>
    </div>
  )
}
