'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Users, ChevronDown, ChevronUp, Plus, X } from 'lucide-react'

type Athlete = { id: string; full_name: string }
type Log = { user_id: string; calories: number; protein: number; carbs: number; fat: number }
type SuppLog = { user_id: string; supplement_name: string; taken: boolean }
type Target = { user_id: string; calories: number; protein: number; carbs: number; fat: number; supplements: string[] }

function pct(val: number, target: number) {
  if (!target) return 0
  return Math.min(Math.round((val / target) * 100), 100)
}

function Bar({ value, target, color }: { value: number; target: number; color: string }) {
  return (
    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct(value, target)}%` }} />
    </div>
  )
}

export default function DashboardClient({
  coachName,
  athletes,
  logs,
  suppLogs,
  targets,
  today,
}: {
  coachName: string
  athletes: Athlete[]
  logs: Log[]
  suppLogs: SuppLog[]
  targets: Target[]
  today: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddAthlete, setShowAddAthlete] = useState(false)
  const [showSetTargets, setShowSetTargets] = useState<string | null>(null)
  const [newAthlete, setNewAthlete] = useState({ full_name: '', email: '', password: '' })
  const [targetForm, setTargetForm] = useState({ calories: '', protein: '', carbs: '', fat: '', supplements: '' })
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()

  async function signOut() {
    await supabase.auth.signOut()
    startTransition(() => router.push('/login'))
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
      setShowAddAthlete(false)
      setNewAthlete({ full_name: '', email: '', password: '' })
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Failed to create athlete')
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
      }),
    })
    setSaving(false)
    if (res.ok) {
      setShowSetTargets(null)
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Failed to save targets')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-10">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-4 flex items-center justify-between border-b border-gray-800">
        <div>
          <p className="text-xs text-gray-400">Coach</p>
          <h1 className="font-bold text-lg">{coachName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{today}</span>
          <button onClick={signOut} className="text-gray-400 hover:text-white"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><Users size={16} /> Athletes ({athletes.length})</h2>
          <button
            onClick={() => setShowAddAthlete(true)}
            className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-400 text-white px-3 py-1.5 rounded-lg"
          >
            <Plus size={14} /> Add Athlete
          </button>
        </div>

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
          const calPct = pct(totals.cal, target?.calories ?? 2500)

          return (
            <div key={athlete.id} className="bg-gray-900 rounded-2xl overflow-hidden">
              <button
                className="w-full px-4 py-3 flex items-center justify-between"
                onClick={() => setExpanded(isExpanded ? null : athlete.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${calPct >= 80 ? 'bg-green-400' : calPct >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  <span className="font-medium truncate">{athlete.full_name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">{totals.cal} / {target?.calories ?? '?'} cal</span>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Protein', val: Math.round(totals.pro), target: target?.protein ?? 150, color: 'bg-blue-500' },
                      { label: 'Carbs', val: Math.round(totals.carb), target: target?.carbs ?? 300, color: 'bg-yellow-500' },
                      { label: 'Fat', val: Math.round(totals.fat), target: target?.fat ?? 80, color: 'bg-red-500' },
                    ].map(({ label, val, target: t, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{label}</span>
                          <span>{val}/{t}g</span>
                        </div>
                        <Bar value={val} target={t} color={color} />
                      </div>
                    ))}
                  </div>

                  {suppsTarget.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">Supplements</p>
                      <div className="flex flex-wrap gap-1.5">
                        {suppsTarget.map(s => (
                          <span key={s} className={`text-xs px-2 py-1 rounded-full ${suppsTaken.includes(s) ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                            {suppsTaken.includes(s) ? '✓ ' : ''}{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const t = targets.find(x => x.user_id === athlete.id)
                      setTargetForm({
                        calories: String(t?.calories ?? ''),
                        protein: String(t?.protein ?? ''),
                        carbs: String(t?.carbs ?? ''),
                        fat: String(t?.fat ?? ''),
                        supplements: (t?.supplements ?? []).join(', '),
                      })
                      setShowSetTargets(athlete.id)
                    }}
                    className="text-xs text-green-400 hover:text-green-300"
                  >
                    Set / edit targets →
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {athletes.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-10">No athletes yet. Add your first one above.</p>
        )}
      </div>

      {/* Add Athlete Modal */}
      {showAddAthlete && (
        <div className="fixed inset-0 bg-black/70 z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowAddAthlete(false)}>
          <div className="bg-gray-900 rounded-t-3xl w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Add Athlete</h3>
              <button onClick={() => setShowAddAthlete(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            {[
              { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
              { key: 'password', label: 'Temp Password', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-400">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={newAthlete[key as keyof typeof newAthlete]}
                  onChange={e => setNewAthlete(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full mt-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
            <button
              onClick={addAthlete}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-green-500 disabled:opacity-50 text-white font-semibold"
            >
              {saving ? 'Creating…' : 'Create Athlete'}
            </button>
          </div>
        </div>
      )}

      {/* Set Targets Modal */}
      {showSetTargets && (
        <div className="fixed inset-0 bg-black/70 z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowSetTargets(null)}>
          <div className="bg-gray-900 rounded-t-3xl w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Set Macro Targets</h3>
              <button onClick={() => setShowSetTargets(null)}><X size={22} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'calories', label: 'Calories' },
                { key: 'protein', label: 'Protein (g)' },
                { key: 'carbs', label: 'Carbs (g)' },
                { key: 'fat', label: 'Fat (g)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-gray-400">{label}</label>
                  <input
                    type="number"
                    value={targetForm[key as keyof typeof targetForm]}
                    onChange={e => setTargetForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full mt-1 bg-gray-800 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-gray-400">Supplements (comma-separated)</label>
              <input
                type="text"
                placeholder="Creatine, Fish Oil, Vitamin D"
                value={targetForm.supplements}
                onChange={e => setTargetForm(p => ({ ...p, supplements: e.target.value }))}
                className="w-full mt-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => saveTargets(showSetTargets)}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-green-500 disabled:opacity-50 text-white font-semibold"
            >
              {saving ? 'Saving…' : 'Save Targets'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
