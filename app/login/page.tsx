'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    router.push(profile?.role === 'coach' ? '/dashboard' : '/log')
  }

  return (
    <div className="min-h-screen mustang-gradient hero-gradient flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background — team photo at top, fading into dark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-72"
          style={{ backgroundImage: 'url(/murrah-team.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top' }}
        />
        <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-black/50 to-[#08091a]" />
        {/* Side strips on desktop */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-48 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/murrah-team.jpg)', backgroundSize: 'cover', backgroundPosition: 'left center' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-[#08091a]" />
        </div>
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-48 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/murrah-team.jpg)', backgroundSize: 'cover', backgroundPosition: 'right center' }} />
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-[#08091a]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#08091a] to-transparent" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-slide-up">
        {/* Logo block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl glass-blue mb-4 shadow-2xl" style={{boxShadow:'0 0 40px rgba(29,78,216,0.4)'}}>
            <span className="text-5xl">🐴</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">MURRAH</h1>
          <p className="shimmer-text text-lg font-bold tracking-widest mt-0.5">MUSTANGS</p>
          <p className="text-slate-400 text-sm mt-2 font-medium">MustangUp 💪</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <h2 className="text-white font-bold text-xl mb-5">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all text-base placeholder-slate-600"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all text-base placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-blue w-full text-white font-bold rounded-xl py-3.5 text-base disabled:opacity-50 mt-2"
            >
              {loading ? '🐴 Loading…' : 'Let\'s Go Mustangs →'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">Murrah High School · Jackson, MS</p>
      </div>
    </div>
  )
}
