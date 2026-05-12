'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/types'

export default function BeheerPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [status, setStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.from('users').select('*').order('name').then(({ data }) => {
      if (data) setUsers(data)
    })
  }, [])

  const uploadFoto = async (user: User, file: File) => {
    setUploading(user.id)
    setStatus(s => ({ ...s, [user.id]: '⏳ uploaden...' }))
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setStatus(s => ({ ...s, [user.id]: `❌ ${uploadError.message}` }))
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)

      setUsers(u => u.map(u2 => u2.id === user.id ? { ...u2, avatar_url: urlData.publicUrl } : u2))
      setStatus(s => ({ ...s, [user.id]: '✅ opgeslagen!' }))
    } finally {
      setUploading(null)
    }
  }

  const verwijderFoto = async (user: User) => {
    await supabase.from('users').update({ avatar_url: null }).eq('id', user.id)
    setUsers(u => u.map(u2 => u2.id === user.id ? { ...u2, avatar_url: null } : u2))
    setStatus(s => ({ ...s, [user.id]: '🗑️ verwijderd' }))
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#001a0d' }}>
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#004d2e', borderBottom: '2px solid #D4AF37' }}>
        <button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5 text-yellow-400" />
        </button>
        <div>
          <div className="text-yellow-400 font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
            🖼️ FOTO BEHEER
          </div>
          <div className="text-green-400 text-xs">Profielfoto's instellen per speler</div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {users.map(user => (
          <div key={user.id} className="rounded-2xl p-4 flex items-center gap-4"
            style={{ backgroundColor: '#004d2e', border: '1px solid #006b3f' }}>

            {/* Foto preview */}
            <div className="flex-shrink-0 rounded-xl overflow-hidden"
              style={{ width: 72, height: 72, backgroundColor: '#002211' }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">
                  {user.name.slice(0, 1)}
                </div>
              )}
            </div>

            {/* Naam + knoppen */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-base mb-2">{user.name}</div>

              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-xl px-3 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: uploading === user.id ? '#003322' : '#006b3f' }}>
                  <input type="file" accept="image/*" className="hidden"
                    disabled={uploading === user.id}
                    onChange={e => e.target.files?.[0] && uploadFoto(user, e.target.files[0])} />
                  📷 {uploading === user.id ? 'bezig...' : 'Foto kiezen'}
                </label>

                {user.avatar_url && (
                  <button onClick={() => verwijderFoto(user)}
                    className="rounded-xl px-3 py-2 text-sm font-bold text-red-400"
                    style={{ backgroundColor: '#3d0000', border: '1px solid #660000' }}>
                    🗑️ Verwijder
                  </button>
                )}
              </div>

              {status[user.id] && (
                <div className="text-xs mt-1.5" style={{ color: status[user.id].startsWith('✅') ? '#4ade80' : status[user.id].startsWith('❌') ? '#f87171' : '#D4AF37' }}>
                  {status[user.id]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-4">
        <p className="text-green-700 text-xs text-center">
          Foto's worden direct zichtbaar voor iedereen in de ranglijst.
        </p>
      </div>
    </div>
  )
}
