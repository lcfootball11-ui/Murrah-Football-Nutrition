'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Users, ChevronDown, ChevronUp, Plus, X, Target, History } from 'lucide-react'

type Athlete = { id: string; full_name: string; email?: string; phone_number?: string | null; reminder_enabled?: boolean }
type Log = { user_id: string; calories: number; protein: number; carbs: number; fat: number }
type SuppLog = { user_id: string; supplement_name: string; taken: boolean }
type Target = { user_id: string; calories: number; protein: number; carbs: number; fat: number; supplements: string[]; plan: 'gain' | 'loss'; target_weight?: number; goal_weight?: number }

function pct(val: number, target: number) {
  if (!target) return 0
  return Math.min(Math.round((val / target) * 100), 100)
}

export default function DashboardClient({
  coachName,
  athletes,
  logs,
  suppLogs,
  targets,
  streaks,
  today,
}: {
  coachName: string
  athletes: Athlete[]
  logs: Log[]
  suppLogs: SuppLog[]
  targets: Target[]
  streaks: Record<string, number>
  today: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddAthlete, setShowAddAthlete] = useState(false)
  const [showAddCoach, setShowAddCoach] = useState(false)
  const [showSetTargets, setShowSetTargets] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [newAthlete, setNewAthlete] = useState({ full_name: '', email: '', password: '', phone_number: '', plan: 'gain' as 'gain' | 'loss' })
  const [newCoach, setNewCoach] = useState({ full_name: '', email: '', password: '' })
  const [targetForm, setTargetForm] = useState({ calories: '', protein: '', carbs: '', fat: '', supplements: '', plan: 'gain' as 'gain' | 'loss', target_weight: '', goal_weight: '' })
  const [saving, setSaving] = useState(false)
  const [athletePhones, setAthletePhones] = useState<Record<string, string>>({})
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null)
  const [athleteEmails, setAthleteEmails] = useState<Record<string, string>>({})
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null)
  const [reminderToggles, setReminderToggles] = useState<Record<string, boolean>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({})
  const [generatingPassword, setGeneratingPassword] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [photoIndex, setPhotoIndex] = useState(0)
  const photoList = [
    'IMG_9077.jpeg', 'IMG_9079.jpeg', 'IMG_9080.jpeg', 'IMG_9081.jpeg',
    'IMG_9082.jpeg', 'IMG_9083.jpeg', 'IMG_9084.jpeg', 'IMG_9085.jpeg',
    'IMG_9086.jpeg', 'IMG_9087.jpeg', 'IMG_9088.jpeg', 'IMG_9089.jpeg',
    'IMG_9090.jpeg', 'IMG_9091.jpeg', 'IMG_9092.jpeg', 'IMG_9093.jpeg',
    'IMG_9094.jpeg', 'IMG_9096.jpeg', 'IMG_9097.jpeg'
  ]
  const [photos, setPhotos] = useState(photoList)

  useEffect(() => {
    const shuffled = [...photoList].sort(() => Math.random() - 0.5)
    setPhotos(shuffled)
    const interval = setInterval(() => setPhotoIndex(i => (i + 1) % shuffled.length), 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const phones: Record<string, string> = {}
    const reminders: Record<string, boolean> = {}
    athletes.forEach(a => {
      phones[a.id] = a.phone_number || ''
      reminders[a.id] = a.reminder_enabled !== false
    })
    setAthletePhones(phones)
    setReminderToggles(reminders)
  }, [athletes])

  async function signOut() {
    await supabase.auth.signOut()
    startTransition(() => router.push('/login'))
  }

  async function addCoach() {
    if (!newCoach.email || !newCoach.password || !newCoach.full_name) return
    setSaving(true)
    const res = await fetch('/api/admin/create-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoach),
    })
    setSaving(false)
    if (res.ok) {
      setShowAddCoach(false)
      setNewCoach({ full_name: '', email: '', password: '' })
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Failed to create coach')
    }
  }

  async function addAthlete() {
    if (!newAthlete.email || !newAthlete.password || !newAthlete.full_name) return
    setSaving(true)
    const res = await fetch('/api/admin/create-athlete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAthlete, coach_secret: 'MurrahFootballCover3$ky!Coach' }),
    })
    setSaving(false)
    if (res.ok) {
      // Auto-set default macro targets based on plan
      const { data: created } = await res.json()
      if (created?.id) {
        const defaults = newAthlete.plan === 'gain'
          ? { calories: 3200, protein: 180, carbs: 400, fat: 90 }
          : { calories: 2000, protein: 160, carbs: 200, fat: 60 }
        await fetch('/api/targets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coach_secret: 'MurrahFootballCover3$ky!Coach', user_id: created.id, ...defaults, supplements: [], plan: newAthlete.plan }),
        })
      }
      setShowAddAthlete(false)
      setNewAthlete({ full_name: '', email: '', password: '', phone_number: '', plan: 'gain' })
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Failed to create athlete')
    }
  }

  async function confirmDeleteAthlete(athleteId: string) {
    setSaving(true)
    const res = await fetch('/api/admin/delete-athlete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athlete_id: athleteId }),
    })
    setSaving(false)
    if (res.ok) {
      setShowDeleteConfirm(null)
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Failed to delete athlete')
    }
  }

  async function saveTargets(athleteId: string) {
    setSaving(true)
    const supps = targetForm.supplements.split(',').map(s => s.trim()).filter(Boolean)
    const res = await fetch('/api/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coach_secret: 'MurrahFootballCover3$ky!Coach',
        user_id: athleteId,
        calories: parseInt(targetForm.calories) || 0,
        protein: parseFloat(targetForm.protein) || 0,
        carbs: parseFloat(targetForm.carbs) || 0,
        fat: parseFloat(targetForm.fat) || 0,
        supplements: supps,
        plan: targetForm.plan,
        target_weight: targetForm.target_weight ? parseFloat(targetForm.target_weight) : null,
        goal_weight: targetForm.goal_weight ? parseFloat(targetForm.goal_weight) : null,
      }),
    })
    setSaving(false)
    if (res.ok) { setShowSetTargets(null); router.refresh() }
    else { const err = await res.json(); alert(err.error ?? 'Failed to save targets') }
  }

  async function updateAthletePhone(athleteId: string, phoneNumber: string) {
    setSaving(true)
    const res = await fetch('/api/admin/update-athlete-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athlete_id: athleteId, phone_number: phoneNumber, coach_secret: 'MurrahFootballCover3$ky!Coach' }),
    })
    setSaving(false)
    if (res.ok) {
      setEditingPhoneId(null)
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Failed to update phone number')
    }
  }

  async function updateReminderToggle(athleteId: string, enabled: boolean) {
    setSaving(true)
    const res = await fetch('/api/admin/update-athlete-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athlete_id: athleteId, reminder_enabled: enabled, coach_secret: 'MurrahFootballCover3$ky!Coach' }),
    })
    setSaving(false)
    if (!res.ok) {
      const err = await res.json()
      alert(err.error ?? 'Failed to update reminder settings')
      router.refresh()
    }
  }

  async function generateTempPassword(athleteId: string) {
    setGeneratingPassword(athleteId)
    const res = await fetch('/api/admin/generate-temp-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athlete_id: athleteId }),
    })
    setGeneratingPassword(null)
    if (res.ok) {
      const data = await res.json()
      setTempPasswords({ ...tempPasswords, [athleteId]: data.tempPassword })
      setShowPasswords({ ...showPasswords, [athleteId]: true })
    } else {
      alert('Failed to generate password')
    }
  }

  async function updateAthleteEmail(athleteId: string, email: string) {
    setSaving(true)
    const res = await fetch('/api/admin/update-athlete-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athlete_id: athleteId, email }),
    })
    setSaving(false)
    if (res.ok) {
      setEditingEmailId(null)
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Failed to update email')
    }
  }

  const totalLogged = athletes.filter(a => logs.some(l => l.user_id === a.id)).length
  const compliancePct = athletes.length > 0 ? Math.round((totalLogged / athletes.length) * 100) : 0

  return (
    <div className="min-h-screen mustang-gradient text-white pb-10 relative">
      {/* Left side panel with vertically stacked images - Desktop left, hidden on mobile */}
      <div className="hidden lg:fixed lg:left-0 lg:top-[300px] lg:bottom-0 lg:w-64 xl:w-80 2xl:w-96 lg:z-0 lg:flex lg:flex-col lg:overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 border-b border-[#1a2844] relative overflow-hidden">
            {i === 0 && (
              <>
                <img
                  src="/PigandPint.jpg"
                  alt="Murrah"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#08091a] to-transparent" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Right side panel with rotating player photos - Desktop right, hidden on mobile */}
      <div className="hidden lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-64 xl:w-80 2xl:w-96 lg:z-0 lg:flex lg:flex-col lg:items-center lg:justify-center lg:overflow-hidden">
        <div className="relative w-full h-full">
          {photos.map((photo, i) => (
            <div
              key={photo}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === photoIndex ? 1 : 0 }}
            >
              <img
                src={`/${photo}`}
                alt="Murrah Mustang"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#08091a] via-[#08091a]/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/murrah-team.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#08091a]" />
        <div className="relative px-4 pt-5 pb-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Murrah Mustangs 🐴</p>
              <h1 className="text-2xl font-black text-white mt-0.5">Coach Dashboard</h1>
              <p className="text-slate-400 text-xs mt-0.5">{today}</p>
            </div>
            <button onClick={signOut} className="glass rounded-xl p-2.5 text-slate-400 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Athletes', value: athletes.length, emoji: '🏈' },
              { label: 'Logged Today', value: totalLogged, emoji: '✅' },
              { label: 'Compliance', value: `${compliancePct}%`, emoji: compliancePct >= 70 ? '🔥' : '💪' },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="glass-blue rounded-2xl p-3 text-center">
                <p className="text-xl mb-0.5">{emoji}</p>
                <p className="text-xl font-black text-white">{value}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-3 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-slate-400" />
            <p className="text-sm font-bold text-slate-300 uppercase tracking-wide">Roster</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCoach(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 px-3.5 py-2 rounded-xl glass"
            >
              <Plus size={13} /> Invite Coach
            </button>
            <button
              onClick={() => setShowAddAthlete(true)}
              className="btn-blue flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl"
            >
              <Plus size={13} /> Add Athlete
            </button>
          </div>
        </div>

        {athletes.length === 0 && (
          <div className="glass rounded-2xl py-12 text-center">
            <p className="text-4xl mb-3">🏈</p>
            <p className="text-slate-400 font-medium">No athletes yet</p>
            <p className="text-slate-600 text-sm mt-1">Add your first Mustang above</p>
          </div>
        )}

        {athletes.map(athlete => {
          const athleteLogs = logs.filter(l => l.user_id === athlete.id)
          const target = targets.find(t => t.user_id === athlete.id)
          const totals = athleteLogs.reduce(
            (acc, l) => ({ cal: acc.cal + l.calories, pro: acc.pro + l.protein, carb: acc.carb + l.carbs, fat: acc.fat + l.fat }),
            { cal: 0, pro: 0, carb: 0, fat: 0 }
          )
          const suppsTaken = suppLogs.filter(s => s.user_id === athlete.id && s.taken).map(s => s.supplement_name)
          const suppsTarget = target?.supplements ?? []
          const isExpanded = expanded === athlete.id
          const calTarget = target?.calories ?? 2500
          const proTarget = target?.protein ?? 150
          const plan = target?.plan ?? 'gain'
          const athleteStreak = streaks[athlete.id] ?? 0
          const calPct = pct(totals.cal, calTarget)

          const proteinMet = totals.pro >= proTarget * 0.9
          const calorieMet = plan === 'loss'
            ? totals.cal <= calTarget * 1.05
            : totals.cal >= calTarget * 0.9

          const compliant = proteinMet && calorieMet
          const hasLogged = totals.cal > 0

          const statusColor = !hasLogged ? '#475569' : compliant ? '#22c55e' : '#ef4444'
          const statusEmoji = !hasLogged ? '💤' : compliant ? (plan === 'gain' ? '🔥' : '✅') : '😡'

          return (
            <div
              key={athlete.id}
              className="card overflow-hidden"
              style={calPct >= 100 ? { background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)', borderColor: '#22c55e' } : {}}
            >
              <button
                className="w-full px-4 py-3.5 flex items-center gap-3"
                onClick={() => setExpanded(isExpanded ? null : athlete.id)}
              >
                <div className="w-10 h-10 glass-blue rounded-xl flex items-center justify-center font-black text-blue-300 text-sm shrink-0">
                  {athlete.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-white truncate">{athlete.full_name}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0 ${plan === 'gain' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-300'}`}>
                      {plan === 'gain' ? '📈' : '📉'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${calPct}%`, background: '#4169E1', boxShadow: '0 0 6px #4169E144' }} />
                    </div>
                    <span className="text-xs font-bold shrink-0 text-blue-400">{calPct}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {athleteStreak > 0 && (
                    <div className="streak-badge rounded-xl px-2 py-1 text-center">
                      <p className="text-xs font-black text-white leading-none">{athleteStreak}🔥</p>
                    </div>
                  )}
                  <span className="text-lg">{statusEmoji}</span>
                  {isExpanded && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(athlete.id) }}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1"
                      title="Remove athlete"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {isExpanded ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-slide-up">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Calories', val: totals.cal, target: calTarget, unit: 'cal', color: '#3b82f6' },
                      { label: 'Protein', val: Math.round(totals.pro), target: target?.protein ?? 150, unit: 'g', color: '#60a5fa' },
                      { label: 'Carbs', val: Math.round(totals.carb), target: target?.carbs ?? 300, unit: 'g', color: '#94a3b8' },
                      { label: 'Fat', val: Math.round(totals.fat), target: target?.fat ?? 80, unit: 'g', color: '#cbd5e1' },
                    ].map(({ label, val, target: t, unit, color }) => (
                      <div key={label} className="glass rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-400">{label}</span>
                          <span className="text-xs font-bold" style={{ color }}>{val}/{t}{unit}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct(val, t)}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {suppsTarget.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Supplements</p>
                      <div className="flex flex-wrap gap-1.5">
                        {suppsTarget.map(s => (
                          <span
                            key={s}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${suppsTaken.includes(s) ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'glass text-slate-500'}`}
                          >
                            {suppsTaken.includes(s) ? '✓ ' : ''}{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 border-t border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Login Credentials</p>
                      <div className="glass rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-slate-400">Email (Username)</p>
                            {editingEmailId === athlete.id ? (
                              <input
                                type="email"
                                value={athleteEmails[athlete.id] || athlete.email || ''}
                                onChange={(e) => setAthleteEmails({ ...athleteEmails, [athlete.id]: e.target.value })}
                                className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <p className="text-sm font-bold text-white font-mono">{athlete.email || 'N/A'}</p>
                            )}
                          </div>
                          {editingEmailId === athlete.id ? (
                            <button
                              onClick={() => updateAthleteEmail(athlete.id, athleteEmails[athlete.id])}
                              disabled={saving}
                              className="text-xs font-bold text-green-400 hover:text-green-300 disabled:opacity-50 whitespace-nowrap"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingEmailId(athlete.id)
                                setAthleteEmails({ ...athleteEmails, [athlete.id]: athlete.email || '' })
                              }}
                              className="text-xs font-bold text-blue-400 hover:text-blue-300 whitespace-nowrap"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="border-t border-white/5 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400">Temporary Password</p>
                              {tempPasswords[athlete.id] && showPasswords[athlete.id] ? (
                                <p className="text-sm font-bold text-yellow-300 font-mono bg-yellow-500/10 px-2 py-1 rounded inline-block mt-1">{tempPasswords[athlete.id]}</p>
                              ) : (
                                <p className="text-xs text-slate-500 mt-1">Click to generate</p>
                              )}
                            </div>
                            <button
                              onClick={() => generateTempPassword(athlete.id)}
                              disabled={generatingPassword === athlete.id}
                              className="text-xs font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50"
                            >
                              {generatingPassword === athlete.id ? 'Generating...' : 'Generate New'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Phone & Reminders</p>
                      <div className="glass rounded-xl p-3 space-y-2">
                        {editingPhoneId === athlete.id ? (
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              value={athletePhones[athlete.id]}
                              onChange={(e) => setAthletePhones({ ...athletePhones, [athlete.id]: e.target.value })}
                              placeholder="(555) 123-4567"
                              className="flex-1 glass border border-white/10 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500/50"
                            />
                            <button
                              onClick={() => updateAthletePhone(athlete.id, athletePhones[athlete.id])}
                              disabled={saving}
                              className="px-3 py-2 rounded-lg btn-blue text-xs font-bold disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPhoneId(null)}
                              className="px-3 py-2 rounded-lg glass text-xs font-bold text-slate-400 hover:text-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400">Phone Number</p>
                              <p className="text-sm font-bold text-white">{athletePhones[athlete.id] || '—'}</p>
                            </div>
                            <button
                              onClick={() => setEditingPhoneId(athlete.id)}
                              className="text-xs font-bold text-blue-400 hover:text-blue-300"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div>
                            <p className="text-xs text-slate-400">Send Reminders</p>
                            <p className="text-xs text-slate-500 mt-0.5">Text at 9:30pm, 10pm, 10:30pm if below 50% goal</p>
                          </div>
                          <button
                            onClick={() => {
                              const newValue = !reminderToggles[athlete.id]
                              setReminderToggles({ ...reminderToggles, [athlete.id]: newValue })
                              updateReminderToggle(athlete.id, newValue)
                            }}
                            className={`relative w-10 h-6 rounded-full transition-colors ${reminderToggles[athlete.id] ? 'btn-blue' : 'glass'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${reminderToggles[athlete.id] ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={`/dashboard/athlete/${athlete.id}`}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      <History size={12} /> View history →
                    </a>
                    <button
                      onClick={() => {
                        const t = targets.find(x => x.user_id === athlete.id)
                        setTargetForm({
                          calories: String(t?.calories ?? ''),
                          protein: String(t?.protein ?? ''),
                          carbs: String(t?.carbs ?? ''),
                          fat: String(t?.fat ?? ''),
                          supplements: (t?.supplements ?? []).join(', '),
                          plan: t?.plan ?? 'gain',
                          target_weight: String(t?.target_weight ?? ''),
                          goal_weight: String(t?.goal_weight ?? ''),
                        })
                        setShowSetTargets(athlete.id)
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Target size={12} /> Set targets →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Coach Modal */}
      {showAddCoach && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowAddCoach(false)}>
          <div className="w-full rounded-t-3xl p-5 space-y-4 animate-slide-up" style={{ background: '#0d1433', border: '1px solid rgba(59,130,246,0.2)', borderBottom: 'none' }}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl">Invite Coach 👨‍💼</h3>
              <button onClick={() => setShowAddCoach(false)} className="glass rounded-xl p-2 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            {[
              { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Coach Name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'coach@example.com' },
              { key: 'password', label: 'Temp Password', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</label>
                <input
                  type={type} placeholder={placeholder}
                  value={newCoach[key as keyof typeof newCoach]}
                  onChange={e => setNewCoach(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full mt-1.5 glass border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 placeholder-slate-600"
                />
              </div>
            ))}
            <button onClick={addCoach} disabled={saving} className="w-full py-3.5 rounded-2xl btn-blue disabled:opacity-50 text-white font-bold">
              {saving ? 'Inviting…' : 'Invite Coach ✓'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom picture bar - only shows on small screens */}
      <div className="flex lg:hidden h-40 md:h-56 mt-4">
        <div className="flex-1 relative overflow-hidden border-r border-[#1a2844]">
          <img
            src="/PigandPint.jpg"
            alt="Murrah"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08091a] to-transparent" />
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="relative w-full h-full">
            {photos.map((photo, i) => (
              <div
                key={photo}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === photoIndex ? 1 : 0 }}
              >
                <img
                  src={`/${photo}`}
                  alt="Murrah Mustang"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#08091a] via-[#08091a]/40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Athlete Modal */}
      {showAddAthlete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowAddAthlete(false)}>
          <div className="w-full rounded-t-3xl p-5 space-y-4 animate-slide-up" style={{ background: '#0d1433', border: '1px solid rgba(59,130,246,0.2)', borderBottom: 'none' }}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl">Add Athlete 🏈</h3>
              <button onClick={() => setShowAddAthlete(false)} className="glass rounded-xl p-2 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            {/* Plan toggle */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Goal</label>
              <div className="flex glass rounded-2xl p-1 gap-1">
                {(['gain', 'loss'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewAthlete(prev => ({ ...prev, plan: p }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${newAthlete.plan === p ? 'btn-blue text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {p === 'gain' ? '📈 Weight Gain' : '📉 Weight Loss'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-1.5 text-center">
                {newAthlete.plan === 'gain' ? 'Default: 3,200 cal · 180g P · 400g C · 90g F' : 'Default: 2,000 cal · 160g P · 200g C · 60g F'}
              </p>
            </div>

            {[
              { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
              { key: 'phone_number', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567' },
              { key: 'password', label: 'Temp Password', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</label>
                <input
                  type={type} placeholder={placeholder}
                  value={newAthlete[key as keyof typeof newAthlete]}
                  onChange={e => setNewAthlete(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full mt-1.5 glass border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 placeholder-slate-600"
                />
              </div>
            ))}
            <button onClick={addAthlete} disabled={saving} className="w-full py-3.5 rounded-2xl btn-blue disabled:opacity-50 text-white font-bold">
              {saving ? 'Creating…' : 'Add to Roster ✓'}
            </button>
          </div>
        </div>
      )}

      {/* Set Targets Modal */}
      {showSetTargets && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowSetTargets(null)}>
          <div className="w-full rounded-t-3xl p-5 space-y-4 animate-slide-up" style={{ background: '#0d1433', border: '1px solid rgba(59,130,246,0.2)', borderBottom: 'none' }}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl flex items-center gap-2"><Target size={20} className="text-blue-400" /> Set Targets</h3>
              <button onClick={() => setShowSetTargets(null)} className="glass rounded-xl p-2 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            {/* Plan toggle */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Goal</label>
              <div className="flex glass rounded-2xl p-1 gap-1">
                {(['gain', 'loss'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setTargetForm(prev => ({ ...prev, plan: p }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${targetForm.plan === p ? 'btn-blue text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {p === 'gain' ? '📈 Weight Gain' : '📉 Weight Loss'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'calories', label: 'Calories' },
                { key: 'protein', label: 'Protein (g)' },
                { key: 'carbs', label: 'Carbs (g)' },
                { key: 'fat', label: 'Fat (g)' },
                { key: 'target_weight', label: 'Current Weight (lbs)' },
                { key: 'goal_weight', label: 'Goal Weight (lbs)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</label>
                  <input
                    type="number"
                    value={targetForm[key as keyof typeof targetForm]}
                    onChange={e => setTargetForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full mt-1.5 glass border border-white/10 text-white rounded-xl px-3 py-3 outline-none focus:border-blue-500/50 text-center font-bold"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Supplements (comma-separated)</label>
              <input
                type="text" placeholder="Creatine, Fish Oil, Vitamin D"
                value={targetForm.supplements}
                onChange={e => setTargetForm(p => ({ ...p, supplements: e.target.value }))}
                className="w-full mt-1.5 glass border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
            <button onClick={() => saveTargets(showSetTargets)} disabled={saving} className="w-full py-3.5 rounded-2xl btn-blue disabled:opacity-50 text-white font-bold">
              {saving ? 'Saving…' : 'Save Targets ✓'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center" onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4 border border-red-500/30">
            <h3 className="font-black text-lg text-white mb-2">Remove Athlete?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This will permanently delete the athlete account and all their data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl glass text-gray-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteAthlete(showDeleteConfirm)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-sm transition-colors"
              >
                {saving ? 'Deleting…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
