'use client'

interface WoutOverlayProps {
  status: 'subbed_in' | 'scored'
  onDismiss?: () => void
}

export default function WoutOverlay({ status, onDismiss }: WoutOverlayProps) {
  const isScored = status === 'scored'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{
        backgroundColor: isScored ? 'rgba(212, 175, 55, 0.97)' : 'rgba(0, 107, 63, 0.97)',
      }}
      onClick={onDismiss}
    >
      {/* Wout avatar */}
      <div className="wout-shake mb-6 text-center">
        <div className="text-9xl">⚽</div>
        <div
          className="text-8xl font-black mt-2 tracking-tighter"
          style={{
            fontFamily: 'Arial Black, Arial',
            color: isScored ? '#003322' : '#D4AF37',
            textShadow: isScored
              ? '3px 3px 0 #A88A1A'
              : '3px 3px 0 #002211',
          }}
        >
          WOUT
        </div>
      </div>

      {/* Bericht */}
      <div
        className="text-center px-6 max-w-sm"
        style={{ color: isScored ? '#003322' : 'white' }}
      >
        <div
          className="text-2xl font-black leading-tight mb-4"
          style={{ fontFamily: 'Arial Black, Arial' }}
        >
          {isScored
            ? '🎉 WOUT SCOORT 🎉'
            : '🟨 WOUT IN HET VELD 🟨'}
        </div>
        <div
          className="text-xl font-bold py-4 px-6 rounded-2xl"
          style={{
            backgroundColor: isScored ? '#003322' : '#D4AF37',
            color: isScored ? '#D4AF37' : '#003322',
          }}
        >
          {isScored
            ? 'DUBBELE ADT (2×)!!!'
            : 'IEDEREEN ADTEN! 🍺'}
        </div>
      </div>

      <div
        className="mt-8 text-sm opacity-60"
        style={{ color: isScored ? '#003322' : 'white' }}
      >
        Tik om te sluiten
      </div>
    </div>
  )
}
