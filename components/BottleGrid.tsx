'use client'

import KlokFlesje from './KlokFlesje'

const KRAT_SIZE = 24

interface BottleGridProps {
  points: number
  bottleSize?: number
}

export default function BottleGrid({ points, bottleSize = 64 }: BottleGridProps) {
  const kratten = Math.floor(points / KRAT_SIZE)
  const losseFlessen = points % KRAT_SIZE
  const kratBottleSize = Math.round(bottleSize * 0.65)

  if (points === 0) {
    return <p className="text-gray-500 text-sm italic py-1">Nog geen punten...</p>
  }

  return (
    <div className="w-full">
      {/* Volle kratten */}
      {kratten > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {Array.from({ length: kratten }).map((_, ki) => (
            <div key={`krat-${ki}`} className="flex flex-col items-center">
              <div
                className="p-2 rounded-xl"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(6, ${Math.round(kratBottleSize * 0.42)}px)`,
                  gap: '3px',
                  backgroundColor: '#D4AF37',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                }}
              >
                {Array.from({ length: KRAT_SIZE }).map((_, bi) => (
                  <KlokFlesje key={bi} size={kratBottleSize} />
                ))}
              </div>
              <div
                className="text-sm font-black mt-1.5 px-3 py-0.5 rounded-full"
                style={{ backgroundColor: '#D4AF37', color: '#003322' }}
              >
                KRAT
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Losse flesjes */}
      {losseFlessen > 0 && (
        <div className="flex flex-wrap gap-2 items-end">
          {Array.from({ length: losseFlessen }).map((_, i) => (
            <KlokFlesje key={`los-${i}`} size={bottleSize} />
          ))}
        </div>
      )}
    </div>
  )
}
