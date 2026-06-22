'use client'

import { useState, useEffect } from 'react'
import { X, Trophy, Send, ChevronDown } from 'lucide-react'

type Submission = {
  id: string
  value: number
  video_url: string | null
  note: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type Challenge = {
  id: string
  title: string
  description: string | null
  goal_type: string
  goal_total: number
  unit: string
  reward: string | null
  scope: string
  position_group: string | null
  start_date: string
  end_date: string
  approvedTotal: number
  myApproved: number
  pendingCount: number
  mySubmissions: Submission[]
}

export default function ChallengeCard() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Challenge | null>(null)
  const [showSubmit, setShowSubmit] = useState(false)
  const [value, setValue] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetch('/api/challenges')
      .then(r => r.json())
      .then(d => { setChallenges(d.challenges ?? []); setLoading(false) })
  }, [])

  async function submit() {
    if (!active || !value) return
    setSubmitting(true)
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: active.id, value: parseFloat(value), video_url: videoUrl || null, note: note || null }),
    })
    const { data } = await res.json()
    if (data) {
      // Optimistically update
      const updated = challenges.map(c => c.id === active.id ? {
        ...c,
        pendingCount: c.pendingCount + 1,
        mySubmissions: [{ ...data, value: parseFloat(value) }, ...c.mySubmissions],
      } : c)
      setChallenges(updated)
      setActive(updated.find(c => c.id === active.id) ?? null)
    }
    setShowSubmit(false)
    setValue('')
    setVideoUrl('')
    setNote('')
    setSubmitting(false)
  }

  function daysLeft(endDate: string) {
    const end = new Date(endDate + 'T23:59:59')
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  if (loading || challenges.length === 0) return null

  return (
    <>
      {challenges.map(c => {
        const pct = Math.min(Math.round((c.approvedTotal / c.goal_total) * 100), 100)
        const myPct = Math.min(Math.round((c.myApproved / c.goal_total) * 100), 100)
        const days = daysLeft(c.end_date)
        const complete = pct >= 100

        return (
          <div
            key={c.id}
            className="glass rounded-2xl p-4 border border-yellow-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.07) 0%, rgba(234,179,8,0.02) 100%)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-white text-sm leading-tight">{c.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.scope === 'team' ? '🏈 Team challenge' : `📍 ${c.position_group} group`}
                    {' · '}
                    {complete ? <span className="text-green-400 font-bold">Complete! 🎉</span> : <span className={days <= 2 ? 'text-red-400 font-bold' : 'text-slate-500'}>{days}d left</span>}
                  </p>
                </div>
              </div>
              {c.reward && (
                <div className="glass rounded-xl px-2 py-1 shrink-0">
                  <p className="text-xs text-yellow-400 font-bold">🎁 {c.reward}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {c.description && <p className="text-xs text-slate-400 mb-3 leading-relaxed">{c.description}</p>}

            {/* Team progress */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Team Progress</p>
                <p className="text-xs font-bold" style={{ color: complete ? '#22c55e' : '#facc15' }}>
                  {c.approvedTotal.toLocaleString()} / {c.goal_total.toLocaleString()} {c.unit}
                </p>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: complete ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#ca8a04,#facc15)',
                    boxShadow: complete ? '0 0 10px rgba(34,197,94,0.5)' : '0 0 10px rgba(250,204,21,0.4)',
                  }}
                />
              </div>
              <p className="text-right text-xs text-slate-600 mt-0.5">{pct}% complete</p>
            </div>

            {/* My contribution */}
            <div className="glass rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Your contribution</p>
                <p className="text-sm font-black text-white">{c.myApproved.toLocaleString()} {c.unit} approved</p>
                {c.pendingCount > 0 && (
                  <p className="text-xs text-yellow-400 mt-0.5">⏳ {c.pendingCount} submission{c.pendingCount > 1 ? 's' : ''} pending review</p>
                )}
              </div>
              {myPct > 0 && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">Your share</p>
                  <p className="text-sm font-bold text-blue-400">{myPct}%</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {!complete && (
                <button
                  onClick={() => { setActive(c); setShowSubmit(true) }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg,#ca8a04,#facc15)', boxShadow: '0 0 14px rgba(250,204,21,0.3)' }}
                >
                  <Send size={13} /> Log My Reps
                </button>
              )}
              {c.mySubmissions.length > 0 && (
                <button
                  onClick={() => { setActive(c); setShowHistory(true) }}
                  className="py-2.5 px-3 rounded-xl glass text-xs text-slate-400 hover:text-white transition-colors"
                >
                  History
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Submit modal */}
      {showSubmit && active && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowSubmit(false)}>
          <div className="w-full rounded-t-3xl p-5 space-y-4 animate-slide-up" style={{ background: '#0d1433', border: '1px solid rgba(250,204,21,0.3)', borderBottom: 'none' }}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" /> Log Your Contribution
              </h3>
              <button onClick={() => setShowSubmit(false)} className="glass rounded-xl p-2 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-400">{active.title}</p>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                How many {active.unit}? *
              </label>
              <input
                type="number" min="1" value={value} onChange={e => setValue(e.target.value)}
                placeholder={`Enter ${active.unit}…`}
                className="w-full glass border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500/50 placeholder-slate-600 text-center font-bold text-2xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Video Proof Link *
              </label>
              <input
                type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="YouTube or Google Drive link…"
                className="w-full glass border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500/50 placeholder-slate-600 text-sm"
              />
              <p className="text-xs text-slate-600 mt-1">Record on your phone → upload to YouTube (unlisted) or Google Drive → paste the link</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Note (optional)</label>
              <input
                type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. done after morning practice…"
                className="w-full glass border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500/50 placeholder-slate-600 text-sm"
              />
            </div>

            <button
              onClick={submit}
              disabled={submitting || !value || !videoUrl}
              className="w-full py-3.5 rounded-2xl text-white font-bold disabled:opacity-30 transition-all"
              style={{ background: 'linear-gradient(135deg,#ca8a04,#facc15)', boxShadow: '0 0 20px rgba(250,204,21,0.3)' }}
            >
              {submitting ? 'Submitting…' : 'Submit for Coach Review ✓'}
            </button>
            <p className="text-xs text-slate-600 text-center">Your reps count toward the team total once a coach approves your video</p>
          </div>
        </div>
      )}

      {/* History modal */}
      {showHistory && active && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowHistory(false)}>
          <div className="w-full rounded-t-3xl p-5 animate-slide-up" style={{ background: '#0d1433', border: '1px solid rgba(59,130,246,0.2)', borderBottom: 'none', maxHeight: '70dvh', overflowY: 'auto' }}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-xl">My Submissions</h3>
              <button onClick={() => setShowHistory(false)} className="glass rounded-xl p-2 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {active.mySubmissions.map(s => (
                <div key={s.id} className="glass rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-white">{s.value.toLocaleString()} {active.unit}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      s.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      s.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {s.status === 'approved' ? '✓ Approved' : s.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                    </span>
                  </div>
                  {s.note && <p className="text-xs text-slate-400">{s.note}</p>}
                  {s.video_url && (
                    <a href={s.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 block">
                      View video →
                    </a>
                  )}
                  <p className="text-xs text-slate-600 mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
