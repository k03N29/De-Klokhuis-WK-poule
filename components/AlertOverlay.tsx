'use client'

interface AlertOverlayProps {
  type: 'wout_in' | 'wout_scored' | 'adt_uitdeel' | 'nl_tegenpunt'
  byName?: string
  onDismiss?: () => void
}

const configs = {
  wout_in: {
    bg: '#006b3f',
    textColor: '#D4AF37',
    emoji: '🟨',
    title: 'WOUT IN HET VELD',
    sub: 'IEDEREEN ADTEN! 🍺',
  },
  wout_scored: {
    bg: '#D4AF37',
    textColor: '#003322',
    emoji: '⚽',
    title: 'WOUT SCOORT!!!',
    sub: 'DUBBELE ADT (2×)!!!',
  },
  adt_uitdeel: {
    bg: '#8B0000',
    textColor: '#FFD700',
    emoji: '💥',
    title: 'ADT UITGEDEELD!',
    sub: '',
  },
  nl_tegenpunt: {
    bg: '#CC0000',
    textColor: 'white',
    emoji: '🔴',
    title: 'TEGENDOELPUNT NEDERLAND',
    sub: 'IEDEREEN EEN ADT!!!',
  },
}

export default function AlertOverlay({ type, byName, onDismiss }: AlertOverlayProps) {
  const cfg = configs[type]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 cursor-pointer"
      style={{ backgroundColor: cfg.bg }}
      onClick={onDismiss}
    >
      <div className="wout-shake text-8xl mb-4">{cfg.emoji}</div>

      <div
        className="text-center"
        style={{ color: cfg.textColor, fontFamily: 'Arial Black, Arial' }}
      >
        <div className="text-3xl font-black leading-tight mb-3">
          {type === 'adt_uitdeel' && byName
            ? <>{byName}<br />deelt een ADT uit!</>
            : cfg.title}
        </div>
        <div
          className="text-2xl font-black py-4 px-8 rounded-2xl"
          style={{
            backgroundColor: 'rgba(0,0,0,0.25)',
            border: `2px solid ${cfg.textColor}`,
          }}
        >
          {type === 'adt_uitdeel' ? 'IEDEREEN ADTEN! 💥' : cfg.sub}
        </div>
      </div>

      <p className="mt-8 text-sm opacity-50" style={{ color: cfg.textColor }}>
        Tik om te sluiten
      </p>
    </div>
  )
}
