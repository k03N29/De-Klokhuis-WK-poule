import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'De Klokhuis WK-Poule 2026 🍺',
  description: 'Het officiële poule-systeem van De Klokhuis — WK 2026',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl">
      <body className="min-h-full">
        <div className="max-w-lg mx-auto min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
