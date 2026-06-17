'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Sign in failed')
      setLoading(false)
      return
    }

    // Store email in localStorage for session
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userId', data.userId)

    // Redirect
    router.push(data.redirectTo || '/log')
  }

  return (
    <div className="min-h-screen mustang-gradient hero-gradient flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-800/15 rounded-full blur-3xl" />
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
              {loading ? '🐴 Signing in…' : 'Let\'s Go Mustangs →'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">Murrah High School · Jackson, MS</p>
      </div>
    </div>
  )
}
