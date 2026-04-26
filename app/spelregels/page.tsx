'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function SpelregelsPage() {
  const router = useRouter()

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
            📋 SPELREGELS
          </div>
          <div className="text-green-400 text-xs">De Klokhuis WK-Poule 2026</div>
        </div>
      </div>

      {/* Hero banner */}
      <div className="py-8 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #003322 0%, #006b3f 50%, #003322 100%)', borderBottom: '4px solid #D4AF37' }}>
        <div className="text-5xl mb-3">🍺🏆🍺</div>
        <h1 className="font-black text-2xl leading-tight mb-2"
          style={{
            fontFamily: 'Arial Black, Arial',
            background: 'linear-gradient(90deg, #D4AF37, #F5D76E, #D4AF37)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
          DE KLOKHUIS<br />WK-POULE 2026
        </h1>
        <p className="text-green-300 text-sm font-bold mb-4">
          Waar geen enkele voetbalkennis nodig is.
        </p>
        <div className="inline-block rounded-2xl px-5 py-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '2px solid #D4AF37' }}>
          <p className="text-yellow-300 font-black text-sm" style={{ fontFamily: 'Arial Black, Arial' }}>
            Hoe meer je drinkt → hoe meer punten<br />
            Hoe meer punten → hoe groter de kans om te winnen<br />
            Hoe win je? <span style={{ color: '#D4AF37' }}>DRINKEN.</span>
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-5">

        {/* Q1: Hoe win je? */}
        <Section emoji="🏆" title="HOE WIN JE?" color="#D4AF37">
          <BigRule>
            Degene met de <strong>meeste punten</strong> op het einde van het WK wordt de{' '}
            <span style={{ color: '#D4AF37' }}>🍺 BIERKONING(IN)</span> van De Klokhuis.
          </BigRule>
          <p className="text-green-300 text-sm text-center italic mt-2">
            "Winnen is Drinken, Drinken is Winnen"
          </p>
        </Section>

        {/* Drinken = punten */}
        <Section emoji="🍺" title="DRINKEN = PUNTEN" color="#006b3f">
          <ScoreRow emoji="🍺" label="Klokje drinken" points="+1p" desc="Gewoon een De Klok pakken en drinken. Druk op de groene knop." />
          <ScoreRow emoji="💥" label="ADT drinken" points="+2p" desc="Ad Fundum — in één teug leegdrinken. Druk op de rode knop." />
          <p className="text-green-600 text-xs text-center mt-2 italic">
            * telt alleen tijdens het WK (11 juni – 19 juli 2026)
          </p>
        </Section>

        {/* Landen */}
        <Section emoji="🌍" title="JOUW LANDEN" color="#004d2e">
          <p className="text-green-300 text-sm mb-3">
            Elke speler krijgt via de draft <strong className="text-white">3 WK-landen</strong> toegewezen.
            Als jouw land iets doet, verdien jij punten — automatisch, zonder iets te doen.
          </p>
          <ScoreRow emoji="🏆" label="Jouw land wint een wedstrijd" points="+3p" />
          <ScoreRow emoji="🤝" label="Jouw land speelt gelijk" points="+1p" />
          <ScoreRow emoji="⭐" label="Feyenoord/PSV/Groningen-speler scoort voor jouw land" points="+1p" desc="Club-bonus, toegekend door Grote Koen." />
        </Section>

        {/* Voorspellingen */}
        <Section emoji="🎯" title="WEDSTRIJDEN VOORSPELLEN" color="#003d22">
          <p className="text-green-300 text-sm mb-3">
            Elke speeldag staat er een wedstrijd klaar om te voorspellen.
            Vul de stand in vóór de wedstrijd begint.
          </p>
          <ScoreRow emoji="⚡" label="Uitslag exact goed" points="+5p" desc="+ je mag een ADT uitdelen aan iedereen!" />
          <ScoreRow emoji="✅" label="Winnaar goed (maar stand klopt niet)" points="+2p" />
          <ScoreRow emoji="❌" label="Fout" points="0p" />
        </Section>

        {/* NL voorspellingen */}
        <Section emoji="🇳🇱" title="NEDERLAND VOORSPELLEN" color="#001a4d" borderColor="#FF6600">
          <p className="text-blue-300 text-sm mb-3">
            Nederland-wedstrijden tellen zwaarder. Hogere inzet, hoger risico, meer bier.
          </p>
          <ScoreRow emoji="⚡" label="Exact goed (juiste stand)" points="+10p" color="#FF8833" />
          <ScoreRow emoji="✅" label="Winnaar goed" points="+5p" color="#FF8833" />
          <ScoreRow emoji="❌" label="Fout" points="0p" />
          <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: '#001433', border: '1px solid #FF6600' }}>
            <p className="text-orange-400 font-bold text-xs mb-2">⚽ BONUS: 2 DOELPUNTENMAKERS</p>
            <p className="text-blue-300 text-xs mb-2">
              Voorspel ook 2 NL-spelers die scoren. Per doelpunt dat zij maken:
            </p>
            <ScoreRow emoji="🛡️" label="Verdediger scoort" points="+5p/doel" />
            <ScoreRow emoji="⚙️" label="Middenvelder scoort" points="+3p/doel" />
            <ScoreRow emoji="⚡" label="Aanvaller scoort" points="+1p/doel" />
          </div>
        </Section>

        {/* Quiz */}
        <Section emoji="🧠" title="DAGELIJKSE QUIZ" color="#1a0a2e" borderColor="#7c3aed">
          <p className="text-purple-300 text-sm mb-3">
            Elke speeldag verschijnt er een vraag over de wedstrijd van die dag.
            Verrassend weinig voetbalkennis vereist.
          </p>
          <ScoreRow emoji="✅" label="Juiste antwoord" points="+1p" color="#a78bfa" />
          <ScoreRow emoji="❌" label="Fout antwoord" points="0p" />
          <p className="text-purple-600 text-xs mt-2 italic">
            Je kunt maar één keer antwoorden. Denk goed na.
          </p>
        </Section>

        {/* Speciale events */}
        <Section emoji="🟨" title="WOUT WEGHORST" color="#003322">
          <p className="text-green-300 text-sm mb-3">
            Als Wout Weghorst invalt bij de Oranje-wedstrijd, gaat de hele kamer in actie.
          </p>
          <ScoreRow emoji="🟨" label="Wout invallen" points="ADT!" desc="Iedereen adtet zodra hij het veld betreedt." />
          <ScoreRow emoji="⚽" label="Wout scoort" points="2× ADT!" desc="Dubbele ADT voor iedereen in het huis." />
        </Section>

        <Section emoji="🔴" title="NL TEGENDOELPUNT" color="#3d0000" borderColor="#CC0000">
          <BigRule>
            Als Nederland een tegendoelpunt krijgt: <strong style={{ color: '#FF4444' }}>IEDEREEN ADT.</strong>
          </BigRule>
          <p className="text-red-400 text-xs text-center mt-1 italic">
            Grote Koen kan dit triggeren → overlay verschijnt op ieders scherm.
          </p>
        </Section>

        <Section emoji="💥" title="ADT UITDELEN" color="#3d0000" borderColor="#FFD700">
          <p className="text-yellow-300 text-sm mb-2">
            Heb je een wedstrijd <strong>exact goed voorspeld?</strong> Dan mag jij een ADT uitdelen aan iedereen.
          </p>
          <p className="text-yellow-600 text-xs">
            Een overlay verschijnt op ieders scherm met jouw naam. Iedereen adtet, jij lacht.
          </p>
        </Section>

        <Section emoji="⏱️" title="GELIJKE STAND = ADT-WEDSTRIJD" color="#003322">
          <BigRule>
            Eindigt een wedstrijd gelijk? Dan <strong style={{ color: '#D4AF37' }}>ADT voor iedereen.</strong>
          </BigRule>
          <p className="text-green-600 text-xs text-center mt-2 italic">
            Gaat toch niet gebeuren.
          </p>
        </Section>

        {/* Samenvatting */}
        <div className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #003322, #006b3f)', border: '3px solid #D4AF37' }}>
          <h2 className="text-yellow-400 font-black text-lg text-center mb-4"
            style={{ fontFamily: 'Arial Black, Arial' }}>
            ⚡ SAMENVATTING PUNTEN
          </h2>
          <div className="space-y-2">
            {[
              { label: '🍺 Klokje drinken', pts: '+1p' },
              { label: '💥 ADT drinken', pts: '+2p' },
              { label: '🌍 Land wint', pts: '+3p' },
              { label: '🤝 Land gelijkspel', pts: '+1p' },
              { label: '⭐ Club-bonus', pts: '+1p' },
              { label: '🎯 Voorspelling exact', pts: '+5p' },
              { label: '✅ Voorspelling goed (winnaar)', pts: '+2p' },
              { label: '🇳🇱 NL exact', pts: '+10p' },
              { label: '🇳🇱 NL winnaar', pts: '+5p' },
              { label: '🛡️ Verdediger scoort (NL)', pts: '+5p/doel' },
              { label: '⚙️ Middenvelder scoort (NL)', pts: '+3p/doel' },
              { label: '⚡ Aanvaller scoort (NL)', pts: '+1p/doel' },
              { label: '🧠 Quiz juist antwoord', pts: '+1p' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center py-1"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-white text-sm">{r.label}</span>
                <span className="text-yellow-400 font-black text-sm">{r.pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer motto */}
        <div className="text-center py-4">
          <p className="font-black text-xl"
            style={{
              fontFamily: 'Arial Black, Arial',
              background: 'linear-gradient(90deg, #D4AF37, #F5D76E, #D4AF37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            WINNEN IS DRINKEN
          </p>
          <p className="font-black text-xl"
            style={{
              fontFamily: 'Arial Black, Arial',
              background: 'linear-gradient(90deg, #D4AF37, #F5D76E, #D4AF37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            DRINKEN IS WINNEN
          </p>
        </div>

      </div>
    </div>
  )
}

function Section({ emoji, title, color, borderColor, children }: {
  emoji: string
  title: string
  color: string
  borderColor?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: color, border: `2px solid ${borderColor ?? '#006b3f'}` }}>
      <h2 className="font-black text-sm mb-3 flex items-center gap-2"
        style={{ fontFamily: 'Arial Black, Arial', color: borderColor ?? '#D4AF37' }}>
        {emoji} {title}
      </h2>
      {children}
    </div>
  )
}

function BigRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-3 text-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-white font-bold text-sm leading-snug">{children}</p>
    </div>
  )
}

function ScoreRow({ emoji, label, points, desc, color }: {
  emoji: string
  label: string
  points: string
  desc?: string
  color?: string
}) {
  return (
    <div className="py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex justify-between items-center">
        <span className="text-white text-sm">{emoji} {label}</span>
        <span className="font-black text-sm ml-2 flex-shrink-0" style={{ color: color ?? '#D4AF37' }}>{points}</span>
      </div>
      {desc && <p className="text-green-600 text-xs mt-0.5">{desc}</p>}
    </div>
  )
}
