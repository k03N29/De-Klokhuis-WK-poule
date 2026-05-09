'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { WK2026, VLAG, type WkWedstrijd } from '@/lib/wk2026-schema'
import type { Country } from '@/lib/types'

// ── helpers ──────────────────────────────────────────────────
function nlTijd(utc: string) {
  return new Date(utc).toLocaleTimeString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit', minute: '2-digit',
  })
}

function nlDatumLabel(utc: string) {
  return new Date(utc).toLocaleDateString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function nlDatumKey(utc: string) {
  // yyyy-mm-dd in NL timezone — voor groepering
  const d = new Date(utc)
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' })
}

function isNacht(utc: string) {
  const h = parseInt(new Date(utc).toLocaleTimeString('nl-NL', {
    timeZone: 'Europe/Amsterdam', hour: '2-digit',
  }))
  return h >= 0 && h < 6
}

// ── component ────────────────────────────────────────────────
export default function SpeelschemaPage() {
  const router = useRouter()
  const [mijnLanden, setMijnLanden] = useState<Set<string>>(new Set())
  const [zoek, setZoek] = useState('')
  const [filterGroep, setFilterGroep] = useState<string>('Alles')

  const laadLanden = useCallback(async () => {
    const opgeslagen = localStorage.getItem('klok_user')
    if (!opgeslagen) return
    const user = JSON.parse(opgeslagen)
    const { data } = await supabase.from('countries').select('name').eq('owner_id', user.id)
    if (data) setMijnLanden(new Set((data as Pick<Country,'name'>[]).map(c => c.name)))
  }, [])

  useEffect(() => { laadLanden() }, [laadLanden])

  // Filter + zoek
  const gefilterd = WK2026.filter(w => {
    if (filterGroep !== 'Alles' && w.groep !== filterGroep) return false
    if (zoek) {
      const q = zoek.toLowerCase()
      if (!w.thuis.toLowerCase().includes(q) && !w.uit.toLowerCase().includes(q)) return false
    }
    return true
  })

  // Groepeer op NL-datum
  const perDag: Record<string, { label: string; wedstrijden: WkWedstrijd[] }> = {}
  for (const w of gefilterd) {
    const key = nlDatumKey(w.utcDatum)
    if (!perDag[key]) perDag[key] = { label: nlDatumLabel(w.utcDatum), wedstrijden: [] }
    perDag[key].wedstrijden.push(w)
  }

  const aantalMijn = WK2026.filter(w => mijnLanden.has(w.thuis) || mijnLanden.has(w.uit)).length

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#001a0d' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-3"
        style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-5 h-5 text-yellow-400" />
          </button>
          <div className="flex-1">
            <div className="text-yellow-400 font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
              📅 WK 2026 SPEELSCHEMA
            </div>
            <div className="text-green-400 text-xs">
              72 groepswedstrijden · tijden in NL-tijd (CEST)
            </div>
          </div>
        </div>

        {/* Zoekbalk */}
        <input
          type="text"
          placeholder="🔍 Zoek land..."
          value={zoek}
          onChange={e => setZoek(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none"
          style={{ backgroundColor: '#003322', border: '1px solid #006b3f' }}
        />
      </div>

      {/* Groepsfilter */}
      <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar">
        {['Alles','A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
          <button key={g}
            onClick={() => setFilterGroep(g)}
            className="flex-shrink-0 rounded-lg px-3 py-1 text-xs font-bold"
            style={{
              backgroundColor: filterGroep === g ? '#D4AF37' : '#003322',
              color: filterGroep === g ? '#000' : '#D4AF37',
              border: '1px solid #D4AF37',
            }}>
            {g === 'Alles' ? 'Alles' : `Groep ${g}`}
          </button>
        ))}
      </div>

      {/* Legenda */}
      <div className="px-4 pt-2 pb-1 flex flex-wrap gap-2 text-xs">
        {mijnLanden.size > 0 && (
          <span className="px-2 py-1 rounded-lg font-bold"
            style={{ backgroundColor: '#2a1500', color: '#D4AF37', border: '1px solid #D4AF37' }}>
            ⭐ Jouw land ({aantalMijn}×)
          </span>
        )}
        <span className="px-2 py-1 rounded-lg font-bold"
          style={{ backgroundColor: '#001a3d', color: '#60a5fa', border: '1px solid #2563eb' }}>
          🇳🇱 Nederland
        </span>
        <span className="px-2 py-1 rounded-lg"
          style={{ backgroundColor: '#111', color: '#6b7280', border: '1px solid #374151' }}>
          🌙 na middernacht NL
        </span>
      </div>

      {/* Wedstrijden per dag */}
      <div className="px-4 pt-2 space-y-4">
        {Object.entries(perDag).sort(([a],[b]) => a.localeCompare(b)).map(([key, dag]) => (
          <div key={key}>
            {/* Datum header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1" style={{ backgroundColor: '#004d2e' }} />
              <span className="text-green-400 font-bold text-xs uppercase tracking-wide px-1">
                {dag.label}
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: '#004d2e' }} />
            </div>

            <div className="space-y-2">
              {dag.wedstrijden.map(w => {
                const isNL = w.isNL ?? false
                const isMijn = mijnLanden.has(w.thuis) || mijnLanden.has(w.uit)
                const nacht = isNacht(w.utcDatum)

                let bg = '#002211'
                let rand = '#003322'
                if (isNL) { bg = '#001433'; rand = '#2563eb' }
                if (isMijn) { bg = '#2a1500'; rand = '#D4AF37' }
                if (isNL && isMijn) { bg = '#1a0a2e'; rand = '#D4AF37' }

                return (
                  <div key={w.id} className="rounded-2xl px-3 py-2.5"
                    style={{ backgroundColor: bg, border: `2px solid ${rand}` }}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#003322', color: '#4ade80' }}>
                        Gr. {w.groep}
                      </span>
                      {isNL && <span className="text-xs font-bold text-blue-400">🇳🇱 NL</span>}
                      {isMijn && <span className="text-xs font-bold text-yellow-400">⭐ jouw land</span>}
                      <span className="ml-auto text-xs" style={{ color: nacht ? '#6b7280' : (isMijn ? '#D4AF37' : isNL ? '#60a5fa' : '#D4AF37') }}>
                        {nacht && '🌙 '}{nlTijd(w.utcDatum)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Thuis */}
                      <div className="flex-1 text-right flex flex-col items-end gap-0.5">
                        <span className="text-2xl leading-none">{VLAG[w.thuis] ?? '🏳️'}</span>
                        <span className="text-white text-xs font-bold leading-tight text-right">{w.thuis}</span>
                        {mijnLanden.has(w.thuis) && <span className="text-yellow-400 text-xs">⭐</span>}
                      </div>

                      {/* vs */}
                      <div className="flex-shrink-0 text-green-600 font-black text-sm px-2">vs</div>

                      {/* Uit */}
                      <div className="flex-1 text-left flex flex-col items-start gap-0.5">
                        <span className="text-2xl leading-none">{VLAG[w.uit] ?? '🏳️'}</span>
                        <span className="text-white text-xs font-bold leading-tight">{w.uit}</span>
                        {mijnLanden.has(w.uit) && <span className="text-yellow-400 text-xs">⭐</span>}
                      </div>
                    </div>

                    <div className="mt-1 text-right">
                      <span className="text-green-700 text-xs">{w.stadion}, {w.stad}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {Object.keys(perDag).length === 0 && (
          <div className="text-center py-12 text-green-700">Geen wedstrijden gevonden</div>
        )}
      </div>
    </div>
  )
}
